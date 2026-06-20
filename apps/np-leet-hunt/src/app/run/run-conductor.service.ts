import { effect, inject, Injectable } from '@angular/core';
import { CParadroidTileSets, paradroidFactoryOptions, ParadroidScene } from '@shared/np-paradroid';
import { PlaceholderConfig, PlaceholderScene, StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { SPACE_EVENTS, SpaceMapScene, SpaceScene, SpaceUiScene } from '@shared/np-space-map';
import {
    Balance,
    CREW_DISPLAY_NAMES,
    describeEnding,
    EndingKind,
    GameStateService,
    ModeResult,
    RunPhase,
    Sector,
    SECTOR_COUNT,
} from '@shared/np-state';

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
    #wired = false;

    // The sector currently rendered, and its number, so #showSpace can tell a *new* sector (rebuild the
    // map fresh) from a return to the same one (wake the slept scenes after a dungeon/duel excursion).
    #sector?: Sector;
    #shownSector = 0;

    // How the current run ended, recorded the moment it resolves (snapback / bail / wiped) so #showEnding
    // can render the matching text ending (Leet-33). Defaults to 'wiped' as a safe fallback.
    #endingKind: EndingKind = 'wiped';

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
        });
        // React to every *settled* phase (incl. the initial 'hangar'), but only once Phaser is up. A
        // synchronous double-step like `to('sectorExit')→to('sector')` coalesces to 'sector' directly —
        // fine, since 'sectorExit' is a transient routing phase with no scene of its own.
        effect(() => {
            const phase = this.#game.fsm.phase();
            if (this.#stage.initialized()) this.#enter(phase);
        });
    }

    #enter(phase: RunPhase): void {
        switch (phase) {
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

    /** Build a duel for the current balance and wire its typed result back to the run (Leet-29). */
    #showDuel(): void {
        // Resolve the duel difficulty from the central balance and inject it (board fx rates + tile
        // palette + AI tuning). Fixed levels for now — easily scaled by sector later.
        const boardLevel = 'brutal';
        const aiLevel = 'normal';
        const factoryOptions = paradroidFactoryOptions(
            Balance.duelBoardParams(boardLevel),
            CParadroidTileSets[boardLevel]
        );
        const scene = new ParadroidScene({
            factoryOptions,
            aiParams: Balance.duelAiParams(aiLevel),
            onResult: result => this.#onModeResult(result),
        });
        this.#stage.startScene({ key: ParadroidScene.key, scene });
    }

    /** Build a dungeon run and wire its typed result back to the run (Leet-29). */
    #showDungeon(): void {
        const scene = new PixelDungeonScene({ onResult: result => this.#onModeResult(result) });
        this.#stage.startScene({ key: PixelDungeonScene.key, scene });
    }

    /**
     * A mode reported its outcome (Leet-29): log it, then return to the map. Reward wiring — pet
     * absorption on a duel win, loot on a dungeon clear — lands in Phases 2–3. Guarded so a late report
     * (after the player already left the mode another way) can't fire an illegal transition.
     */
    #onModeResult(result: ModeResult): void {
        console.log('[run] mode result', result);
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
