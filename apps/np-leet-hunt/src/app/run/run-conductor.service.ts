import { inject, Injectable } from '@angular/core';
import { CParadroidTileSets, paradroidFactoryOptions, ParadroidScene } from '@shared/np-paradroid';
import { StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { SPACE_EVENTS, SpaceMapScene, SpaceScene, SpaceUiScene } from '@shared/np-space-map';
import { Balance, GameStateService, RunPhase, Sector, SECTOR_COUNT } from '@shared/np-state';

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
            case 'sector':
            case 'event': // an event is an HTML overlay over the map — keep the sector scenes up (no-op swap)
                this.#showSpace();
                break;
            case 'duel': {
                // Resolve the duel difficulty from the central balance and inject it (board fx rates +
                // tile palette + AI tuning). Fixed levels for now — easily scaled by sector later.
                const boardLevel = 'brutal';
                const aiLevel = 'normal';
                const factoryOptions = paradroidFactoryOptions(
                    Balance.duelBoardParams(boardLevel),
                    CParadroidTileSets[boardLevel]
                );
                const scene = new ParadroidScene({ factoryOptions, aiParams: Balance.duelAiParams(aiLevel) });
                this.#stage.startScene({ key: ParadroidScene.key, scene });
                break;
            }
            case 'dungeon':
                this.#stage.startScene({ key: PixelDungeonScene.key, scene: new PixelDungeonScene() });
                break;
            // hangar / boarding / guardian / sectorExit / ending have no scene yet → keep the current view.
            // TODO(Leet-29): when a mode reports a ModeResult on completion, the conductor advances the FSM
            // back to 'sector' here; until then the return-to-map intent comes from the app (home.page).
            default:
                break;
        }
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
