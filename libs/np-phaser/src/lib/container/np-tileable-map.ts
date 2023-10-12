/* eslint-disable no-magic-numbers */
// eslint-disable-next-line max-classes-per-file
import * as Phaser from 'phaser';

import { NPScene, TNPLayerKeys } from '../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { NPMovableSprite } from '../sprites/np-movable-sprite';
import { Planet } from '../sprites/planet/planet';
import { TNPTextureKey } from '../types/np-phaser';

export class NPTileableMap extends NPSceneContainer<NPSceneComponent> {
    iter = 0;
    // bgLayer: Phaser.GameObjects.Container;
    // mapLayer: Phaser.GameObjects.Container;

    #tileSprites: (Phaser.Types.Loader.FileTypes.ImageFileConfig & {
        speed: number;
        layer: TNPLayerKeys;
        sprite?: Phaser.GameObjects.TileSprite;
    })[] = [];
    private ship: NPMovableSprite;

    constructor(scene: NPScene) {
        super(scene);
    }

    addTileSpriteLayer(textureKey: TNPTextureKey, url: string, speed: number, layer: TNPLayerKeys) {
        this.#tileSprites.push({ key: textureKey, url, speed, layer });
    }

    preload() {
        super.preload();
        for (const { key, url } of this.#tileSprites) {
            this.scene.load.image(key, url);
        }
        this.scene.load.image('test', 'assets/resolutiontesthd.png');
    }

    create() {
        super.create();
        for (const tileSprite of this.#tileSprites) {
            tileSprite.sprite = new Phaser.GameObjects.TileSprite(this.scene, 0, 0, this.scene.scale.width, this.scene.scale.height, tileSprite.key).setOrigin(0);
            this.scene.addToLayer(tileSprite.layer, tileSprite.sprite);
        }
        const img = new Phaser.GameObjects.Image(this.scene, 0, 0, 'test').setOrigin(0);
        this.scene.addToLayer('np', img);
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    update(time: number, delta: number) {
        super.update(time, delta); // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        const shipSpeed = 0.25;
        for (const { sprite, speed } of this.#tileSprites) {
            sprite.tilePositionX += speed;
            if (this.ship) {
                sprite.tilePositionX += this.ship.body.deltaX() * shipSpeed;
                sprite.tilePositionY += this.ship.body.deltaY() * shipSpeed;
            }
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
        for (const { sprite } of this.#tileSprites) {
            sprite.setSize(width, height);
        }
        // this.tileSprite.setTileScale(this.controls.camera.zoomX);
    }

    public addShip(rocket: NPMovableSprite) {
        this.ship = rocket;
    }
}

export class NPSpaceMap extends NPTileableMap {
    init = () => {
        this.addTileSpriteLayer('background-image', 'assets/tileablespace/tileable-classic-nebula-space-patterns-2.jpg', -0.05, 'bg');
        this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 1, 'bg');
        this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 2, 'fg');
        console.log('add a planet');
        this.addPlanet();
        super.init();
    };

    private addPlanet() {
        const planet = new Planet(this.scene, 'planetBlue');
        this.add(planet);
    }
}
