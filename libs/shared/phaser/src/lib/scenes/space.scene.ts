/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { StageService } from '@shared/phaser';
/* eslint-disable no-magic-numbers */
import * as Phaser from 'phaser';

import { OnSceneCreate, OnScenePreload } from '../types/np-phaser';
import TileSprite = Phaser.GameObjects.TileSprite;

export class SpaceScene extends Phaser.Scene implements OnScenePreload, OnSceneCreate {
    private backgroundKey = 'background-image'; // * Store the background image name
    private backgroundImageAsset = 'assets/tileablespace/tileable-classic-nebula-space-patterns-2.jpg'; // * Asset url relative to the app itself
    iter = 0;
    ts: TileSprite;
    private container: Phaser.GameObjects.Container;

    constructor(private npStage: StageService) {
        super({ key: 'space-scene' });
    }

    async preload(): Promise<void> {
        try {
            console.log('world.scene.ts', 'Preloading Assets...');
            // * Now load the background image
            this.load.image(this.backgroundKey, this.backgroundImageAsset);
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
        console.log('forge.scene.ts', 'Creating Assets...', this.scale.width, this.scale.height);
        //  Our container
        this.ts = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, this.backgroundKey).setName('tiley').setOrigin(0);
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
            function () {
                this.scene.stop();
            },
            this
        );
        this.scale.on('resize', this.resize, this);
    }

    update() {
        // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        this.iter += 0.01;
        const value = -1 * this.iter * 100;
        this.ts.tilePositionX = -1 * value;
        this.container.setX(value);
    }

    /**
     * * When the screen is resized, we
     *
     * @param gameSize
     */
    resize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;
        this.cameras.resize(width, height);
        this.ts.setSize(width, height);
    }
}
