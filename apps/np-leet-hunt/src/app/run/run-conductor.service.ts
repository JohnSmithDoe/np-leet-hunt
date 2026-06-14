import { inject, Injectable } from '@angular/core';
import { ParadroidScene } from '@shared/np-paradroid';
import { StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { SpaceMapScene, SpaceScene, SpaceUiScene } from '@shared/np-space-map';
import { GameStateService, RunPhase } from '@shared/np-state';

/**
 * The app-side wrapper that turns run-phase changes into scene swaps (Leet-28). The run FSM is the
 * single source of truth for "which mode are we in"; this conductor is the ONLY place that calls
 * `StageService.startScene`. State flows DOWN by injection — it builds the scenes with the run store —
 * and scene-control flows UP as phase transitions other code requests on the FSM. The engine coupling
 * lives here, in the app, so np-state never imports np-phaser.
 */
@Injectable({ providedIn: 'root' })
export class RunConductorService {
    #stage = inject(StageService);
    #game = inject(GameStateService);
    #started = false;

    /** Begin reacting to the run FSM. Idempotent; call once after the stage is initialised. */
    start(): void {
        if (this.#started) return;
        this.#started = true;
        // Root singleton: lives for the whole app, so the subscription needs no teardown.
        this.#game.fsm.current$.subscribe(phase => this.#enter(phase));
    }

    #enter(phase: RunPhase): void {
        switch (phase) {
            case 'sector':
            case 'event': // an event is an HTML overlay over the map — keep the sector scenes up (no-op swap)
                this.#startSpace();
                break;
            case 'duel':
                this.#stage.startScene({ key: ParadroidScene.key, scene: new ParadroidScene() });
                break;
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

    #startSpace(): void {
        const state = this.#game.run;
        this.#stage.startScene(
            { key: SpaceScene.key, scene: new SpaceScene(), persistent: true },
            { key: SpaceMapScene.key, scene: new SpaceMapScene(state), persistent: true },
            { key: SpaceUiScene.key, scene: new SpaceUiScene(state), persistent: true }
        );
    }
}
