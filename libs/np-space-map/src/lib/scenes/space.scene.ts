import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import MouseWheelScroller from 'phaser3-rex-plugins/plugins/input/mousewheelscroller/MouseWheelScroller';

import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { Space } from '../space/space';

export class SpaceScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-scene';
    iter = 0;
    #space: Space;

    constructor() {
        super({ key: SpaceScene.key });
    }

    setupComponents() {
        console.log('dont do it');
        this.#space = new Space(this, Space.getRandom());
        this.addComponent(this.#space);
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
        super.create();
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        this.add.existing(this.#space);
    }

    update(time: number, delta: number) {
        // this.map.update(time, delta);
        this.iter += 0.01;
        console.log('51:update-space');

        // const value = -1 * this.iter * 100;
        super.update(time, delta);
        // this.stars.tilePositionX = -1 * value;
        // if (this.zoomIn.isDown || this.zoomOut.isDown) {
        //     this.resize();
        // }
        // const worldView = this.controls.camera.worldView;
        // this.rocket.setPosition(worldView.centerX, worldView.centerY);
    }

    /**
     * * When the screen is resized, we
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        console.log('resize');
        // this.cameras.cameras.forEach(cam => console.log(cam.renderList));
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
        // this.stars.setSize(width, height);
        //this.ts.setTileScale(this.controls.camera.zoomX);
        // const worldBounds = this.controls.camera.worldView;
        // console.log(worldBounds);
        // //this.ts.setTileScale();
        // this.ts.setPosition(worldBounds.x, worldBounds.y);
        // this.ts.setSize(worldBounds.width, worldBounds.height);
        // console.log(this.controls.camera);
    }
}
