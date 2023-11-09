import { StageService } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import MouseWheelScroller from 'phaser3-rex-plugins/plugins/input/mousewheelscroller/MouseWheelScroller';

import { NPScene } from '../../../np-phaser/src/lib/scenes/np-scene';
import { TextButton } from '../../../np-phaser/src/lib/sprites/button/text-button';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../np-phaser/src/lib/types/np-phaser';
import { ParadroidGame } from './core/paradroid.game';
import { ParadroidIntro } from './sprites/paradroid.intro';

export class ParadroidScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    iter = 0;
    #paradroidGame: ParadroidGame;

    constructor(private npStage: StageService) {
        super({ key: 'paradroid-scene' });
    }

    async setupComponents() {
        this.#paradroidGame = new ParadroidGame(this);
        this.addComponent(this.#paradroidGame);
        this.addComponent(new ParadroidIntro(this));
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
        this.addToLayer('ui', container);

        const recreateBtn = new TextButton(this, 600, 10, 'Re-Create');
        recreateBtn.on('pointerup', () => {
            this.removeFromContainer(this.#paradroidGame);
            this.removeFromLayer('ui', this.#paradroidGame.container);
            console.log(this.layer('ui').list, this.components);
            const newcontainer = new Phaser.GameObjects.Container(this, 0, 0, []);
            this.#paradroidGame = new ParadroidGame(this);
            this.addComponent(this.#paradroidGame);
            this.#paradroidGame.init();
            this.#paradroidGame.create(newcontainer);
            this.addToLayer('ui', newcontainer);
            // this.generateStuff();
        });
        this.addToLayer('ui', recreateBtn);

        this.layer('ui').camera.setViewport(0, 0, 100, 100);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    update(time: number, delta: number) {
        this.iter += 0.01;
        super.update(time, delta);
    }

    /**
     * * When the screen is resized, we
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        // this.cameras.cameras.forEach(cam => console.log(cam.renderList));
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
    }
}
