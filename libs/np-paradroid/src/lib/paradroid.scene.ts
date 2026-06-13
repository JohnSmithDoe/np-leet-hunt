import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import MouseWheelScroller from 'phaser3-rex-plugins/plugins/input/mousewheelscroller/MouseWheelScroller';

import { TextButton } from '../../../np-phaser/src/lib/sprites/button/text-button';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../np-phaser/src/lib/types/np-phaser';
import { ParadroidGame } from './core/paradroid.game';

export class ParadroidScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'paradroid-scene';
    iter = 0;
    #paradroidGame!: ParadroidGame;
    constructor() {
        super({ key: ParadroidScene.key });
    }

    async setupComponents() {
        this.#paradroidGame = new ParadroidGame(this);
        this.addComponent(this.#paradroidGame);
        // TODO: ParadroidIntro still depends on the removed layer cameras ('ui-camera') — rework before re-enabling
        // this.addComponent(new ParadroidIntro(this));
    }

    init() {
        super.init();
        const scroller = new MouseWheelScroller(this, {
            enable: true,
            speed: 0.1,
            focus: true,
        });
        scroller.on('scroll', (inc: number, gameObject: unknown, scroll: unknown) => {
            console.log(inc, gameObject, scroll);
        });
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    create() {
        const container = new Phaser.GameObjects.Container(this, 0, 0, []);
        super.create(container);
        this.addExisting(container);

        const recreateBtn = new TextButton(this, 600, 10, 'Re-Create');
        recreateBtn.on('pointerup', () => {
            this.removeComponent(this.#paradroidGame);
            this.removeExisting(this.#paradroidGame.container);
            const newcontainer = new Phaser.GameObjects.Container(this, 0, 0, []);
            this.#paradroidGame = new ParadroidGame(this);
            this.addComponent(this.#paradroidGame);
            this.#paradroidGame.init();
            this.#paradroidGame.create(newcontainer);
            this.addExisting(newcontainer);
            this.resize();
        });
        this.addExisting(recreateBtn);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        this.resize();
    }

    update(time: number, delta: number) {
        this.iter += 0.01;
        super.update(time, delta);
        this.#paradroidGame.update(time, delta);
    }

    /**
     * * When the screen is resized, match the camera viewport to the new size and
     * * re-fit the board so the whole thing stays visible on any device.
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
        this.#fitBoardToViewport(width, height);
    }

    /**
     * The board is laid out at a fixed pixel size (48px tiles, anchored near the
     * top-left) and would overflow narrow / mobile viewports. Zoom the main camera
     * so the board's bounds fit the viewport (with a little breathing room) and
     * centre the camera on it. Scaling down for now — proper responsive layout TODO.
     */
    #fitBoardToViewport(width: number, height: number): void {
        const board = this.#paradroidGame?.container;
        if (!board || width === 0 || height === 0) return;
        const bounds = board.getBounds();
        if (bounds.width === 0 || bounds.height === 0) return;
        const margin = 1.1; // ~10% padding around the board
        const zoom = Math.min(width / (bounds.width * margin), height / (bounds.height * margin));
        this.cameras.main.setZoom(zoom).centerOn(bounds.centerX, bounds.centerY);
    }
}
