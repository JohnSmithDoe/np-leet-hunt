import { effect, inject, Injectable } from '@angular/core';
import { NpAudioService } from '@shared/np-audio';
import { Audio, Balance, CREW_DISPLAY_NAMES, ITEMS, Sector, SECTOR_COUNT } from '@shared/np-config';
import { GreyFight, GreyFightScene } from '@shared/np-grey-fight';
import { CParadroidTileSets, paradroidFactoryOptions, ParadroidScene } from '@shared/np-paradroid';
import { PlaceholderConfig, PlaceholderScene, StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { SPACE_EVENTS, SpaceMapScene, SpaceScene, SpaceUiScene, SpawnGamePayload } from '@shared/np-space-map';
import {
    describeEnding,
    EndingKind,
    GameStateService,
    isModeSuccess,
    ModeLaunch,
    ModeResult,
    RunPhase,
} from '@shared/np-state';

import { IntroScene } from '../intro/intro.scene';

/** Placeholder consequence of losing a duel — non-lethal (Phase 2 decision); tuned by the curve in Leet-38. */
const DUEL_LOSS_PENALTY = { hull: -2 };

/**
 * The app-side wrapper that turns run-phase changes into scene swaps (Leet-28). The run FSM is the
 * single source of truth for "which mode are we in"; this conductor is the ONLY place that calls
 * `StageService.startScene`. State flows DOWN by injection — it builds the scenes with the run store and
 * the resolved {@link Sector} — and scene-control flows UP as phase transitions other code requests on
 * the FSM. The engine coupling lives here, in the app, so np-state never imports np-phaser.
 *
 * It also owns sector progression: each sector is generated from the central balance curve on entry, and
 * reaching a rim sun (`SECTOR_EXIT`) advances the run to the next sector — or ends it after the last.
 */
@Injectable({ providedIn: 'root' })
export class RunConductorService {
    #stage = inject(StageService);
    #game = inject(GameStateService);
    #audio = inject(NpAudioService);
    #wired = false;

    // The grey-fight colony's engine (GDD §4 "Holding the Grey"). A clockless side game outside the run
    // FSM; kept here so its progress (light, upgrades, freed cats) survives leaving and reopening within a
    // session. Persistence to the save file is a later job — for now it lives as long as the app does.
    #greyFight = new GreyFight();

    // The mood + intensity currently playing, so a same-mood/same-tension phase (event overlay,
    // same-sector return) doesn't restart the track — only a genuine change re-evaluates.
    #currentMood?: string;
    #currentIntensity = -1;

    // The sector currently rendered, and its number, so #showSpace can tell a *new* sector (rebuild the
    // map fresh) from a return to the same one (wake the slept scenes after a dungeon/duel excursion).
    #sector?: Sector;
    #shownSector = 0;

    // How the current run ended, recorded the moment it resolves (snapback / bail / wiped) so #showEnding
    // can render the matching text ending (Leet-33). Defaults to 'wiped' as a safe fallback.
    #endingKind: EndingKind = 'wiped';

    // The launch a map encounter requested via SPAWN_GAME (Leet-37), read by #showDuel/#showDungeon when the
    // FSM enters that mode. Cleared when the mode reports back.
    #pendingLaunch?: ModeLaunch;

    /**
     * Begin reacting to the run FSM. The effects are created in the constructor (the only valid place —
     * `effect` cannot be called from within another effect, so this can't be deferred behind a caller's
     * effect), and both gate on `stage.initialized()`: they no-op until Phaser has booted, then fire with
     * the current phase. Injecting this service (home.page does) is what brings it to life. Root singleton
     * → lives for the whole app → the effects need no teardown.
     */
    constructor() {
        // Once Phaser is up, wire the map's three run-routing bus events: SECTOR_EXIT (bailed at a rim sun),
        // REALITY_SNAPBACK (the front caught the ship), and GUARDIAN_REACHED (reached the rewarding gate).
        // `#wired` guards against a re-run double-registering.
        effect(() => {
            if (!this.#stage.initialized() || this.#wired) return;
            this.#wired = true;
            this.#stage.phaser.game.events.on(SPACE_EVENTS.SECTOR_EXIT, () => this.#onSectorExit());
            this.#stage.phaser.game.events.on(SPACE_EVENTS.REALITY_SNAPBACK, () => this.#onSnapback());
            this.#stage.phaser.game.events.on(SPACE_EVENTS.GUARDIAN_REACHED, () => this.#onGuardianReached());
            this.#stage.phaser.game.events.on(SPACE_EVENTS.SPAWN_GAME, (s: SpawnGamePayload) => this.#onSpawnGame(s));
            this.#stage.phaser.game.events.on(SPACE_EVENTS.TRAVEL_TAP, () => this.#audio.sfx.play('ui.travel'));
        });
        // React to every *settled* phase (incl. the initial 'hangar'), but only once Phaser is up. A
        // synchronous double-step like `to('sectorExit')→to('sector')` coalesces to 'sector' directly —
        // fine, since 'sectorExit' is a transient routing phase with no scene of its own.
        effect(() => {
            const phase = this.#game.fsm.phase();
            if (this.#stage.initialized()) this.#enter(phase);
        });
    }

    /**
     * Debug toolbar: jump straight to a sector to test its deeper map + duel scaling. Sets the run's
     * sector, then re-enters the map so {@link #showSpace} rebuilds it — bouncing through the transient
     * `sectorExit` phase when already on the map (the rebuild path a rim-sun bail uses), or straight into
     * `sector` from the hangar. Not part of the run loop; only the dev buttons call it.
     */
    debugJumpToSector(sectorNumber: number): void {
        this.#game.run.setSector(sectorNumber);
        if (this.#game.fsm.can('sectorExit')) {
            this.#game.fsm.to('sectorExit');
            this.#game.fsm.to('sector'); // sector→sectorExit→sector forces #showSpace to rebuild for the new sector
        } else if (this.#game.fsm.can('sector')) {
            this.#game.fsm.to('sector');
        }
    }

    /**
     * Start the opening crawl. Called from the title screen's audio choice (the gesture that unlocks audio)
     * so the crawl and its fanfare begin together. Builds a fresh {@link IntroScene} and wires its end —
     * the scroll finishing or a skip — to the `intro → hangar` transition, which the conductor then renders
     * as the hangar. Stays the conductor's job since it's the only place that calls `startScene`.
     */
    beginIntro(): void {
        const scene = new IntroScene({
            onDone: () => {
                if (this.#game.fsm.can('hangar')) this.#game.fsm.to('hangar');
            },
        });
        this.#stage.startScene({ key: IntroScene.key, scene });
    }

    /**
     * Open the grey-fight colony (GDD §4 "Holding the Grey") — a clockless side game *outside* the run FSM,
     * like {@link beginIntro}. The engine persists on the conductor, so progress survives leaving and
     * reopening; "← Back" re-enters whatever run phase is current, restoring the mode that was on stage.
     * The colony never advances the normality front (it isn't a phase), so it's safe to dip into mid-run.
     */
    beginColony(): void {
        const scene = new GreyFightScene({
            engine: this.#greyFight,
            onExit: () => this.#enter(this.#game.fsm.phase()),
        });
        this.#stage.startScene({ key: GreyFightScene.key, scene });
    }

    #enter(phase: RunPhase): void {
        this.#audioForPhase(phase);
        switch (phase) {
            case 'intro':
                // The IntroScene isn't started here (at boot, behind the title screen) — it begins on the
                // title's audio choice via beginIntro(), so the crawl + fanfare start together with the
                // gesture. #enter('intro') only queues the mood (#audioForPhase); the stage stays empty until.
                break;
            case 'hangar':
                this.#showHangar();
                break;
            case 'sector':
            case 'event': // an event is an HTML overlay over the map — keep the sector scenes up (no-op swap)
                this.#showSpace();
                break;
            case 'duel':
                this.#showDuel();
                break;
            case 'dungeon':
                this.#showDungeon();
                break;
            case 'guardian':
                this.#showGuardian();
                break;
            case 'boarding':
                this.#showBoarding();
                break;
            case 'ending':
                this.#showEnding();
                break;
            case 'sectorExit':
                // Transient routing phase — no scene of its own; #onSectorExit advances straight through it.
                break;
        }
    }

    /**
     * Map the run phase to a mood: each sector's own escalating map track, the dedicated driving duel
     * track for a Paradroid fight, the tense encounter mood for the other combat modes, and a gentle
     * wash over the hangar — "a mid-travel encounter raises tension". This only *queues* the mood; audio
     * actually boots when {@link NpAudioService} catches the first user gesture (autoplay policy).
     * Re-playing the same mood at the same tension is skipped (see {@link #playMood}) so an event overlay
     * or same-sector return won't restart it.
     */
    #audioForPhase(phase: RunPhase): void {
        switch (phase) {
            case 'intro':
                this.#playMood('intro.crawl', 0.7, 1500); // the bold Star-Wars-y fanfare under the crawl
                break;
            case 'duel':
                this.#playMood('space.duel', 0.85, 1200); // its own beat-driven combat track
                break;
            case 'dungeon':
            case 'guardian':
            case 'boarding':
                this.#playMood('space.encounter', 0.85, 1200); // quicker drop into the tense mood
                break;
            case 'hangar':
                this.#playMood('space.calm', 0.12, 2000); // gentle wash over the garage/menu
                break;
            case 'ending':
                this.#audio.music.stop(800);
                this.#currentMood = undefined;
                this.#currentIntensity = -1;
                break;
            default:
                // The map (sector/event): each sector has its own track (ascending tempo + drive), at a
                // tension that rises the deeper the run gets — closing on the Hush.
                this.#playMapMood();
                break;
        }
    }

    /** The current sector's map track, at a depth-scaled tension (deeper sector = tenser wash). */
    #playMapMood(): void {
        const number = this.#game.run.snapshot().sectorNumber;
        const intensity = Math.min(0.7, 0.15 + (number - 1) * 0.12);
        this.#playMood(Audio.sectorMoodId(Balance.sector(number).id), intensity, 2000);
    }

    /**
     * Queue a mood at a tension. Skips entirely when neither changed (same track + tension), so an event
     * overlay or same-sector return doesn't restart the groove. Sets intensity first (so a new mood
     * starts at the right tension), then crossfades only when the mood itself changes.
     */
    #playMood(mood: string, intensity: number, fadeMs: number): void {
        const moodChanged = mood !== this.#currentMood;
        const intensityChanged = Math.abs(intensity - this.#currentIntensity) > 0.001;
        if (!moodChanged && !intensityChanged) return;
        this.#currentIntensity = intensity;
        this.#audio.music.setIntensity(intensity);
        if (moodChanged) {
            this.#currentMood = mood;
            this.#audio.music.play(mood, { fadeMs });
        }
    }

    /**
     * A map encounter requested a mode (Leet-37): record the launch and drive the FSM into it. The
     * `spawnGame` effect carries an optional {@link ModeLaunch}; #showDuel/#showDungeon read it on entry.
     */
    #onSpawnGame(spawn: SpawnGamePayload): void {
        this.#pendingLaunch = spawn.launch;
        const phase: RunPhase = spawn.game === 'dungeon' ? 'dungeon' : 'duel';
        if (this.#game.fsm.can(phase)) this.#game.fsm.to(phase);
    }

    /** Build a duel and wire its typed result back to the run (Leet-29/37/39). */
    #showDuel(): void {
        // Use the difficulty the encounter asked for (Leet-37); default to normal when launched without one
        // (e.g. the debug toolbar). The sector-scaled difficulty curve is Leet-38.
        const launch = this.#pendingLaunch?.kind === 'duel' ? this.#pendingLaunch : undefined;
        const boardLevel = launch?.boardLevel ?? 'normal';
        // The pet's class is its "stronger duel position" (Leet-39): it eases the opposing AI a notch per
        // tier of class. The board stays as the encounter set it.
        const aiLevel = Balance.duelAiForPet(launch?.aiLevel ?? 'normal', this.#game.run.petClass);
        // The board grows with sector depth (Leet-38): a 4-row mini-duel in sector 1 up to a full 12-row
        // board near the Hush. Rows feed the factory; the shot budget scales with them inside np-paradroid.
        const rows = Balance.duelRows(this.#game.run.snapshot().sectorNumber);
        const factoryOptions = paradroidFactoryOptions(
            Balance.duelBoardParams(boardLevel),
            CParadroidTileSets[boardLevel],
            { rows }
        );
        const scene = new ParadroidScene({
            factoryOptions,
            aiParams: Balance.duelAiParams(aiLevel),
            droidClass: launch?.droidClass, // echoed into the result's absorbedClass on a win
            onResult: result => this.#onModeResult(result),
        });
        this.#stage.startScene({ key: ParadroidScene.key, scene });
    }

    /** Build a dungeon run and wire its typed result back to the run (Leet-29 / F1). */
    #showDungeon(): void {
        // Read the encounter's launch (mirror #showDuel): the objective drives generation/exit, defaulting
        // to 'retrieve' when launched without one (e.g. the debug toolbar). Depth is the current sector, so
        // dungeon content can scale with run progress. No seed source yet — leaving it undefined keeps the
        // engine on its fixed-layout default, which is fine for now.
        const launch = this.#pendingLaunch?.kind === 'dungeon' ? this.#pendingLaunch : undefined;
        const scene = new PixelDungeonScene({
            // Pass the pet class through as the dungeon-companion-perk seam (Leet-39); the perks themselves are
            // Phase 3 (the dungeon loop), so the scene just carries it for now.
            petClass: this.#game.run.petClass,
            objective: launch?.objective ?? 'retrieve',
            depth: this.#game.run.snapshot().sectorNumber,
            // The floor's enemy roster, scaled to the current sector (item #10 / RPG cluster E): archetype
            // ids the engine resolves through np-config's bestiary and builds via MobFactory — count and mix
            // both grow with depth. Numbers live in np-config; the engine just spawns what it's handed.
            roster: Balance.dungeonRoster(this.#game.run.snapshot().sectorNumber),
            // The floor's loot plan, scaled to the current sector (RPG cluster A): the engine scatters these
            // item ids on the floor and carries the collected ones back as `DungeonResult.loot`.
            loot: Balance.dungeonLoot(this.#game.run.snapshot().sectorNumber),
            // The kid's starting equipment (item #13): the launch's declared loadout if the encounter named
            // one, else the pet-class-scaled starter set from np-config. The engine equips each id so its
            // mods fold into the player's combat stats — equipment changes damage without the formula moving.
            // A run-managed equipped set kept across excursions is item #17.
            startingEquipment: launch?.equippedItemIds ?? Balance.startingEquipment(this.#game.run.petClass),
            // Inject the dungeon combat tuning (the combat spine): numbers live in np-config, the formula in
            // the mode lib. Left out the engine falls back to a minDamage:1 default (standalone/debug entry).
            combatParams: Balance.dungeonCombatParams(),
            // The floor's mob-AI tuning, scaled to the current sector (item #12 / RPG cluster E): sight/wake
            // radii, give-up memory, wander chance and flee fraction the enemy brains read. Deeper floors see
            // farther and flee sooner. Numbers live in np-config; the FSM lives in the mode lib.
            aiParams: Balance.dungeonAiParams(this.#game.run.snapshot().sectorNumber),
            // The floor's world-content plan, scaled to the current sector (RPG cluster C): the decorator
            // draws trap/lock budgets from it (#14). Step 0 places only the exit stairs regardless of it.
            plan: Balance.dungeonPlan(this.#game.run.snapshot().sectorNumber),
            onResult: result => this.#onModeResult(result),
        });
        this.#stage.startScene({ key: PixelDungeonScene.key, scene });
    }

    /**
     * A mode reported its outcome (Leet-29/37/39): consume it, then return to the map. A **lost duel is
     * non-lethal** (Phase 2 decision) — it costs resources but never ends the run; a lethal failure belongs
     * to the dungeon/boarding mode (Phase 3). A **won** duel offers the beaten droid's class for absorption
     * (Leet-39). Guarded so a late report (after the player left the mode another way) can't fire illegally.
     */
    #onModeResult(result: ModeResult): void {
        this.#pendingLaunch = undefined;
        if (result.kind === 'duel') {
            if (isModeSuccess(result)) {
                this.#offerAbsorption(result.absorbedClass);
                return;
            }
            this.#game.run.adjustResources(DUEL_LOSS_PENALTY);
        }
        if (result.kind === 'dungeon') {
            if (isModeSuccess(result)) {
                // Completed: bank the loot through the ITEMS catalog (RPG cluster A). A `coin` adds its
                // value to the run's marble economy (summed into one adjustResources call so the meter
                // ticks once); anything else is granted to the run inventory. Unknown ids are ignored.
                this.#bankLoot(result.loot ?? []);
                this.#toMapAfterMode();
            } else {
                // Failed is now LETHAL (combat spine / item #9): the kid died in the dungeon, so the whole run
                // ends on the 'wiped' ending via the legal `dungeon → ending` transition — not a quiet return
                // to the map. (Soften here later if desired, e.g. an extraction/downed-but-rescued mechanic.)
                this.#endRun('wiped');
            }
            return;
        }
        this.#toMapAfterMode();
    }

    /**
     * Bank a completed dungeon's loot (RPG cluster A). Each id is resolved through np-config's `ITEMS`
     * catalog: a `coin` accumulates its `value` into a single marble total (so the economy meter ticks
     * once, not per coin), every other kind is granted as a run-inventory item. Ids missing from the
     * catalog are skipped — the dungeon should only ever return ids it scattered, but the run stays robust
     * to a stale plan. The marble adjustment is applied only when at least one coin was banked.
     */
    #bankLoot(loot: string[]): void {
        let marbles = 0;
        for (const id of loot) {
            const def = ITEMS[id];
            if (!def) continue;
            if (def.kind === 'coin') marbles += def.value ?? 0;
            else this.#game.run.grantItem(id);
        }
        if (marbles > 0) this.#game.run.adjustResources({ marbles });
    }

    /**
     * After a takeover win, offer the beaten droid's class for absorption (GDD §4 — Paradroid-style choice,
     * not auto). Only worth offering an upgrade, so a class at-or-below the pet's just returns to the map.
     */
    #offerAbsorption(droidClass?: number): void {
        const current = this.#game.run.petClass;
        if (droidClass === undefined || droidClass <= current) {
            this.#toMapAfterMode();
            return;
        }
        this.#showPlaceholder('duel', {
            title: 'Takeover',
            lines: [
                `You cracked a class ${droidClass} droid; your pet runs class ${current}.`,
                'Absorb its class for a stronger duel position and dungeon perks — or keep your own.',
            ],
            actions: [
                {
                    label: `⬆ Absorb class ${droidClass}`,
                    onSelect: () => {
                        this.#game.run.setPetClass(droidClass);
                        this.#toMapAfterMode();
                    },
                },
                { label: `Keep class ${current}`, onSelect: () => this.#toMapAfterMode() },
            ],
        });
    }

    /** Return to the map after a mode/absorption resolves (guarded against an illegal late transition). */
    #toMapAfterMode(): void {
        if (this.#game.fsm.can('sector')) this.#game.fsm.to('sector');
    }

    /** The garage. Tears down any prior run's scenes so the next builds fresh, then offers "Launch run". */
    #showHangar(): void {
        this.#stage.clear();
        this.#sector = undefined;
        this.#shownSector = 0;
        this.#endingKind = 'wiped'; // reset the exit record for the next run
        this.#showPlaceholder('hangar', {
            title: 'Hangar',
            lines: ['The garage. Reality is bent; a rescue run waits.'],
            actions: [{ label: '▶ Launch run', onSelect: () => this.#launchRun() }],
        });
    }

    /** Sector boss (placeholder until Phase 4): win → free the captive + advance, or get wiped and end the run. */
    #showGuardian(): void {
        const { sectorNumber } = this.#game.run.snapshot();
        const captive = CREW_DISPLAY_NAMES[Balance.rescueForSector(sectorNumber)];
        this.#showPlaceholder('guardian', {
            title: `Sector ${sectorNumber} — Guardian`,
            lines: [
                `The gate-keeper holds ${captive}. (staged duel + lair gimmick — Phase 4)`,
                'Win to free them and push on — or bail at a rim sun to leave this captive behind.',
            ],
            actions: [
                { label: `⚔ Win → free ${captive}`, onSelect: () => this.#winGuardian() },
                { label: '☠ Get wiped (end run)', onSelect: () => this.#endRun('wiped') },
            ],
        });
    }

    /** Ship boarding (placeholder until Phase 4): take the bridge back to the map, or be overwhelmed. */
    #showBoarding(): void {
        this.#showPlaceholder('boarding', {
            title: 'Boarding action',
            lines: ['A Grey Fleet ship — take the bridge or be overwhelmed. (ship dungeon — Phase 4)'],
            actions: [
                { label: '⚓ Take the bridge → map', onSelect: () => this.#game.fsm.to('sector') },
                { label: '☠ Overwhelmed (end run)', onSelect: () => this.#endRun('wiped') },
            ],
        });
    }

    /** The run is over (Leet-33): render the text ending for the exit taken, then return to the hangar. */
    #showEnding(): void {
        const ending = describeEnding(this.#endingKind, this.#game.run.snapshot());
        this.#showPlaceholder('ending', {
            title: ending.title,
            lines: ending.lines,
            actions: [{ label: '⤺ Return to hangar', onSelect: () => this.#game.fsm.to('hangar') }],
        });
    }

    /** The front caught the ship (REALITY_SNAPBACK from the map): end the run with the snap-back ending. */
    #onSnapback(): void {
        this.#endingKind = 'snapback';
        if (this.#game.fsm.can('ending')) this.#game.fsm.to('ending');
    }

    /** Reached the guardian gate (GUARDIAN_REACHED from the map): hand off to the guardian fight (Leet-34). */
    #onGuardianReached(): void {
        if (this.#game.fsm.can('guardian')) this.#game.fsm.to('guardian');
    }

    /** End the run via a direct ending transition (guardian/boarding wipes), recording the exit taken. */
    #endRun(kind: EndingKind): void {
        this.#endingKind = kind;
        this.#game.fsm.to('ending');
    }

    /** Start a fresh run from the hangar: reset the run store, then enter the first sector. */
    #launchRun(): void {
        this.#game.run.reset();
        this.#game.fsm.to('sector');
    }

    /**
     * Won the guardian fight (Leet-34): free this sector's captive (recorded in run state — crew abilities
     * are Phase 4), then advance to the next sector. Beating the *final* guardian wins the sibling and ends
     * the run on the 'rescued' ending — the way to the Hush opens (GDD §2 full rescue / true-final, Phase 4).
     */
    #winGuardian(): void {
        const { sectorNumber } = this.#game.run.snapshot();
        this.#game.run.addCrew(Balance.rescueForSector(sectorNumber));
        if (sectorNumber < SECTOR_COUNT) {
            this.#game.run.advanceSector();
            this.#game.fsm.to('sectorExit');
            this.#game.fsm.to('sector'); // → #enter('sector') → #showSpace() rebuilds with the new sector
        } else {
            this.#endRun('rescued');
        }
    }

    /** Show a transient placeholder scene for a run phase that has no real scene yet (Leet-31). */
    #showPlaceholder(phase: RunPhase, config: PlaceholderConfig): void {
        this.#stage.startScene({ key: `phase-${phase}`, scene: new PlaceholderScene(`phase-${phase}`, config) });
    }

    /** Show the space mode for the current sector: build first, regenerate on advance, wake on return. */
    #showSpace(): void {
        const number = this.#game.run.snapshot().sectorNumber;
        if (this.#shownSector === 0) {
            // First sector of the run → build the space mode fresh.
            this.#shownSector = number;
            this.#sector = Balance.sector(number);
            this.#stage.startScene(...this.#spaceScenes(this.#sector));
        } else if (number !== this.#shownSector) {
            // Advanced to a new sector → rebuild the map content in place (no scene swap/restart), so the
            // persistent scenes' textures and input survive and only the content reloads.
            this.#shownSector = number;
            const sector = Balance.sector(number);
            this.#sector = sector;
            const game = this.#stage.phaser.game;
            const map = game.scene.getScene(SpaceMapScene.key) as SpaceMapScene;
            const ui = game.scene.getScene(SpaceUiScene.key) as SpaceUiScene;
            if (game.scene.isSleeping(SpaceMapScene.key)) {
                // We advanced from an excursion that slept the space scenes off-stage (a guardian win):
                // rebuild their content while hidden (instant — they're not rendering), then wake + fade
                // them back in showing the new sector. A single transition, no awkward fade-chaining.
                map.loadSector(sector);
                ui.loadSector(sector);
                this.#stage.startScene(...this.#spaceScenes(sector));
            } else {
                // Rim-sun bail: the space scenes are still on stage → rebuild in place behind a fade.
                this.#stage.fadeTransition(() => {
                    map.loadSector(sector);
                    ui.loadSector(sector);
                });
            }
        } else {
            // Same sector (event overlay, or returning from a dungeon/duel) → wake the slept scenes.
            this.#stage.startScene(...this.#spaceScenes(this.#sector!));
        }
    }

    #spaceScenes(sector: Sector) {
        const state = this.#game.run;
        return [
            { key: SpaceScene.key, scene: new SpaceScene(), persistent: true },
            { key: SpaceMapScene.key, scene: new SpaceMapScene(state, sector), persistent: true },
            { key: SpaceUiScene.key, scene: new SpaceUiScene(state, sector), persistent: true },
        ];
    }

    /** Rim-sun bail: advance to the next sector (regenerating the map), or end the run after the last. */
    #onSectorExit(): void {
        if (this.#game.run.snapshot().sectorNumber < SECTOR_COUNT) {
            this.#game.run.advanceSector();
            this.#game.fsm.to('sectorExit');
            this.#game.fsm.to('sector'); // → #enter('sector') → #showSpace() rebuilds with the new sector
        } else {
            this.#endingKind = 'bail'; // bailed past the final sector → the rim-sun "leave poor" ending
            this.#game.fsm.to('sectorExit');
            this.#game.fsm.to('ending');
        }
    }
}
