/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { StageService } from '@shared/phaser';
/* eslint-disable no-magic-numbers */
import * as Phaser from 'phaser';
import MouseWheelScroller from 'phaser3-rex-plugins/plugins/input/mousewheelscroller/MouseWheelScroller';

import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../types/np-phaser';
import TileSprite = Phaser.GameObjects.TileSprite;

export class SpaceScene extends Phaser.Scene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    private backgroundKey = 'background-image'; // * Store the background image name
    private backgroundImageAsset = 'assets/tileablespace/tileable-classic-nebula-space-patterns-2.jpg'; // * Asset url relative to the app itself
    iter = 0;
    ts: TileSprite;
    private container: Phaser.GameObjects.Container;
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl;

    constructor(private npStage: StageService) {
        super({ key: 'space-scene' });
    }

    async init() {
        this.scale.baseSize.setSize(1920, 1080);

        const scroller = new MouseWheelScroller(this, {
            enable: true,
            speed: 0.1,
            focus: true,
        });
        scroller.on('scroll', (inc: number, gameObject: any, scroll: any) => {
            console.log(inc, gameObject, scroll);
        });
    }

    async preload(): Promise<void> {
        try {
            console.log('world.scene.ts', 'Preloading Assets...');
            // * Now load the background image
            this.load.image(this.backgroundKey, this.backgroundImageAsset);
            this.load.image('test', 'assets/resolutiontesthd.png');
            this.load.image('planet-1', 'assets/planets/planet01.png');
            this.load.image('planet-2', 'assets/planets/planet02.png');
            this.load.image('planet-3', 'assets/planets/planet03.png');
        } catch (e) {
            console.error('preloader.scene.ts', 'error preloading', e);
        }
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    async create(): Promise<void> {
        this.ts = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, this.backgroundKey).setName('tiley').setOrigin(0, 0);
        console.log('forge.scene.ts', 'Creating Assets...', this.scale.width, this.scale.height);
        //  Our container
        const container = this.add.container(0, 0).setName('conty');
        const image = this.add.image(2000, 200, 'planet-1');
        container.add(image);
        const image2 = this.add.image(200, 2000, 'planet-2');
        container.add(image2);
        const image3 = this.add.image(200, 200, 'planet-3');
        container.add(image3);
        // container.add(this.ts);
        // container.add(image2);
        this.container = container;
        this.input.on(
            'pointerup',
            () => {
                // this.scene.stop();
            },
            this
        );
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        const cursors = this.input.keyboard.createCursorKeys();

        this.cameras.resetAll().ignore(this.container);
        this.cameras.main = this.cameras.add().ignore(this.ts);

        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0,
        };
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    }

    update(time: number, delta: number) {
        this.controls.update(delta);
        // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        this.iter += 0.01;
        const value = -1 * this.iter * 100;
        this.ts.tilePositionX = -1 * value;
        if (this.controls.zoomIn.isDown || this.controls.zoomOut.isDown) {
            this.resize();
        }
    }

    /**
     * * When the screen is resized, we
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        console.log('resize');
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
        this.ts.setTileScale(this.controls.camera.zoomX);
        // const worldBounds = this.controls.camera.worldView;
        // console.log(worldBounds);
        // //this.ts.setTileScale();
        // this.ts.setPosition(worldBounds.x, worldBounds.y);
        // this.ts.setSize(worldBounds.width, worldBounds.height);
        // console.log(this.controls.camera);
    }
}
