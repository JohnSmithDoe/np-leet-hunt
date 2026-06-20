import { inject, Injectable } from '@angular/core';
import { CParadroidTileSets, paradroidFactoryOptions, ParadroidScene } from '@shared/np-paradroid';
import { PlaceholderConfig, PlaceholderScene, StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { SPACE_EVENTS, SpaceMapScene, SpaceScene, SpaceUiScene } from '@shared/np-space-map';
import { Balance, GameStateService, ModeResult, RunPhase, Sector, SECTOR_COUNT } from '@shared/np-state';

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
    #started = false;

    // The sector currently rendered, and its number, so #showSpace can tell a *new* sector (rebuild the
    // map fresh) from a return to the same one (wake the slept scenes after a dungeon/duel excursion).
    #sector?: Sector;
    #shownSector = 0;

    /** Begin reacting to the run FSM. Idempotent; call once after the stage is initialised. */
    start(): void {
        if (this.#started) return;
        this.#started = true;
        // Root singleton: lives for the whole app, so these subscriptions need no teardown.
        this.#game.fsm.current$.subscribe(phase => this.#enter(phase));
        // The map fires SECTOR_EXIT on the Phaser bus when the ship bails at a rim sun; advance the run.
        this.#stage.phaser.game.events.on(SPACE_EVENTS.SECTOR_EXIT, () => this.#onSectorExit());
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
        this.#showPlaceholder('hangar', {
            title: 'Hangar',
            lines: ['The garage. Reality is bent; a rescue run waits.'],
            actions: [{ label: '▶ Launch run', onSelect: () => this.#launchRun() }],
        });
    }

    /** Sector boss (placeholder until Phase 4): clear back to the map, or get wiped and end the run. */
    #showGuardian(): void {
        const { sectorNumber } = this.#game.run.snapshot();
        this.#showPlaceholder('guardian', {
            title: `Sector ${sectorNumber} — Guardian`,
            lines: ['The sector boss blocks the lane. (staged duel + lair gimmick — Phase 4)'],
            actions: [
                { label: '⚔ Defeat → back to map', onSelect: () => this.#clearGuardian() },
                { label: '☠ Get wiped (end run)', onSelect: () => this.#game.fsm.to('ending') },
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
                { label: '☠ Overwhelmed (end run)', onSelect: () => this.#game.fsm.to('ending') },
            ],
        });
    }

    /** The run is over: a stub ending screen that returns to the hangar (text endings come in Phase 1). */
    #showEnding(): void {
        const { sectorNumber, resources } = this.#game.run.snapshot();
        this.#showPlaceholder('ending', {
            title: 'Run over',
            lines: [`Reached sector ${sectorNumber} · marbles ${resources.marbles}`, '(text endings — Phase 1)'],
            actions: [{ label: '⤺ Return to hangar', onSelect: () => this.#game.fsm.to('hangar') }],
        });
    }

    /** Start a fresh run from the hangar: reset the run store, then enter the first sector. */
    #launchRun(): void {
        this.#game.run.reset();
        this.#game.fsm.to('sector');
    }

    /** Clear the guardian back to the map (same sector; boss-advances-sector wiring is Phase 4). */
    #clearGuardian(): void {
        this.#game.fsm.to('sectorExit');
        this.#game.fsm.to('sector');
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
            // Advanced to a new sector → rebuild the map in place inside the live, still-running scenes
            // (no scene swap/restart), so their textures and input survive and only the content reloads.
            this.#shownSector = number;
            const sector = Balance.sector(number);
            this.#sector = sector;
            const game = this.#stage.phaser.game;
            const map = game.scene.getScene(SpaceMapScene.key) as SpaceMapScene;
            const ui = game.scene.getScene(SpaceUiScene.key) as SpaceUiScene;
            this.#stage.fadeTransition(() => {
                map.loadSector(sector);
                ui.loadSector(sector);
            });
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
            this.#game.fsm.to('sectorExit');
            this.#game.fsm.to('ending'); // last sector left → run ends (no ending scene yet — TODO)
        }
    }
}
