/* eslint-disable no-magic-numbers */
// eslint-disable-next-line max-classes-per-file

import { NPScene } from '../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { NPMovableSprite } from '../sprites/np-movable-sprite';

export class NPTileableMap extends NPSceneContainer<NPSceneComponent> {
    iter = 0;
    // bgLayer: Phaser.GameObjects.Container;
    // mapLayer: Phaser.GameObjects.Container;

    private ship: NPMovableSprite;

    constructor(scene: NPScene) {
        super(scene);
    }

    preload() {
        super.preload();
        this.scene.load.image('test', 'assets/resolutiontesthd.png');
    }

    create() {
        super.create();
        // const img = new Phaser.GameObjects.Image(this.scene, 0, 0, 'test').setOrigin(0);
        // this.scene.addToLayer('np', img);
    }

    update(time: number, delta: number) {
        super.update(time, delta); // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        // const shipSpeed = 0.25;
        // for (const { sprite, speed } of this.#tileSprites) {
        //     sprite.tilePositionX += speed;
        //     if (this.ship) {
        //         sprite.tilePositionX += this.ship.body.deltaX() * shipSpeed;
        //         sprite.tilePositionY += this.ship.body.deltaY() * shipSpeed;
        //     }
        // }
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

    public addShip(rocket: NPMovableSprite) {
        this.ship = rocket;
    }
}
