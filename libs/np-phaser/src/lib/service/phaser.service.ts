import { inject, Injectable, NgZone } from '@angular/core';
import * as Phaser from 'phaser';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import MouseWheelScrollerPlugin from 'phaser3-rex-plugins/plugins/mousewheelscroller-plugin';
import ShipPlugin from 'phaser3-rex-plugins/plugins/ship-plugin';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PhaserService {
    #ngZone = inject(NgZone);
    // * We need the Phaser.Game to live inside our own class because extending Phaser.Game would require a super call
    #game: Phaser.Game;
    get game(): Phaser.Game {
        return this.#game;
    }

    actionsHistory: string[] = []; // * Since np-phaser is a singleton, let's store the history of actions here for all components.
    #initialized = new BehaviorSubject(false);
    initialized$ = this.#initialized.asObservable();

    /**
     * * When A user Logs out, destroy the active game.
     */
    destroyActiveGame(): void {
        //* Param 1: Set to true if you would like the parent canvas element removed from the DOM.
        //* Param 2: Set to false  If you do need to create another game instance on the same page
        if (this.#game) {
            this.#game.destroy(true, false);
        }
    }

    /**
     * * Initializes the active Phaser.Game
     * * The Phaser.Game instance owns Scene Manager, Texture Manager, Animations FrameHandler, and Device Class as GLOBALS
     * * The Scene Manager owns the individual Scenes and is accessed by activeGame.scene
     * * Each Scene owns its own "world", which includes all game objects.
     * ! GameInstance must be the parent class to scenes.
     * ! Should only be called *when* we want it to load in memory.  I.e. during simulation.
     */
    init(parent: string | HTMLElement = 'np-np-phaser-main') {
        console.warn('np-phaser init');
        /**
         * * Phaser by default runs at 60 FPS, and each frame that triggers change detection in Angular which causes
         * * Performance to go out the door.  NgZone's runOutsideAngular will prevent Phaser from automatically hitting change detection
         * * https://angular.io/guide/zone
         */
        this.#ngZone.runOutsideAngular(() => {
            if (!this.#game) {
                this.createGame(parent);
                this.#initialized.next(true);
            }
        });
        return this.initialized$;
    }

    private createGame(parent: string | HTMLElement) {
        // To scale game to always fit in parent container
        // https://photonstorm.github.io/phaser3-docs/Phaser.Scale.ScaleManager.html
        const globalPlugins = [
            {
                key: 'rexMouseWheelScroller',
                plugin: MouseWheelScrollerPlugin,
                start: true,
            },
            {
                key: 'rexShip',
                plugin: ShipPlugin,
                start: true,
            },
        ];

        this.#game = new Phaser.Game({
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.RESIZE,
                width: window.innerWidth,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                height: window.innerHeight,
            },
            parent,
            scene: [],
            plugins: {
                global: [...globalPlugins],
                scene: [
                    {
                        key: 'rexBoard',
                        plugin: BoardPlugin,
                        mapping: 'rexBoard',
                    },
                ],
            },
            fps: {
                forceSetTimeOut: true,
            },
            render: {
                transparent: false,
            },
            physics: {
                default: 'arcade',
                arcade: { debug: true },
            },
        });
    }
}
