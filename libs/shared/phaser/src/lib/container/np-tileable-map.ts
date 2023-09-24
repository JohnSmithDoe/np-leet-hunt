/* eslint-disable no-magic-numbers */
// eslint-disable-next-line max-classes-per-file
import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPSceneComponent } from '../scenes/np-scene-component';
import { NPMovableSprite } from '../sprites/np-movable-sprite';
import { TNPTextureKey } from '../types/np-phaser';

export class NPTileableMap extends NPSceneComponent {
    iter = 0;
    bgLayer: Phaser.GameObjects.Container;
    mapLayer: Phaser.GameObjects.Container;

    #bgTileSprites: {
        key: TNPTextureKey;
        url: string;
        reverse: boolean;
        sprite?: Phaser.GameObjects.TileSprite;
    }[] = [];

    constructor(scene: NPScene) {
        super(scene);
    }

    addBgTileSpriteLayer(textureKey: TNPTextureKey, url: string, reverse = false) {
        this.#bgTileSprites.push({ key: textureKey, url, reverse });
    }

    preload() {
        for (const { key, url } of this.#bgTileSprites) {
            this.scene.load.image(key, url);
        }
        this.scene.load.image('test', 'assets/resolutiontesthd.png');
    }

    create() {
        this.bgLayer = this.scene.add.container();
        this.mapLayer = this.scene.add.container();
        for (const bgTile of this.#bgTileSprites) {
            bgTile.sprite = new Phaser.GameObjects.TileSprite(this.scene, 0, 0, this.scene.scale.width, this.scene.scale.height, bgTile.key).setOrigin(0);
            this.bgLayer.add(bgTile.sprite);
        }
        this.scene.cameras.resetAll().ignore(this.mapLayer).ignore(this.scene.physics.world.debugGraphic).setName('bg');
        this.scene.cameras.main = this.scene.cameras.add().ignore(this.bgLayer).setName('container');

        const img = new Phaser.GameObjects.Image(this.scene, 0, 0, 'test').setScale(0.3);
        this.mapLayer.add(img);

        //this.scene.cameras.main = this.scene.cameras.add().ignore(this.tileSprite);
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    update() {
        // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        this.iter += 0.01;
        const value = -1 * this.iter * 100;
        for (const { sprite, reverse } of this.#bgTileSprites) {
            sprite.tilePositionX = (reverse ? 1 : -1) * value;
        }
        // if (this.zoomIn.isDown || this.zoomOut.isDown) {
        //     this.resize();
        // }
        // const worldView = this.controls.camera.worldView;
        // this.rocket.setPosition(worldView.centerX, worldView.centerY);
        // this.bg.tilePositionX += this.ship.body.deltaX() * 0.5;
        // this.bg.tilePositionY += this.ship.body.deltaY() * 0.5;
        //
        // this.stars.tilePositionX += this.ship.body.deltaX() * 2;
        // this.stars.tilePositionY += this.ship.body.deltaY() * 2;
    }

    /**
     * * When the screen is resized, we
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scene.scale;
        console.log('resi', width, height);
        for (const { sprite } of this.#bgTileSprites) {
            sprite.setSize(width, height);
        }
        //this.physics.world.setBounds(0, 0, width, height);
        // this.tileSprite.setTileScale(this.controls.camera.zoomX);
        // const worldBounds = this.controls.camera.worldView;
        // console.log(worldBounds);
        // //this.ts.setTileScale();
        // this.ts.setPosition(worldBounds.x, worldBounds.y);
        // this.ts.setSize(worldBounds.width, worldBounds.height);
        // console.log(this.controls.camera);
    }

    public addShip(rocket: NPMovableSprite) {
        this.scene.add.existing(rocket);
        const camera = this.scene.cameras.getCamera('bg');
        camera.ignore(rocket);
        console.log(camera);
        // this.scene.cameras.getCamera('container').ignore(rocket);
    }
}

export class NPSpaceMap extends NPTileableMap {
    init = () => {
        this.addBgTileSpriteLayer('background-image', 'assets/tileablespace/tileable-classic-nebula-space-patterns-2.jpg');
        this.addBgTileSpriteLayer('space-stars', 'assets/example/stars.png', true);
    };

    create = () => {
        super.create();
    };
}
