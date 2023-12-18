import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { NPMovableSprite } from '../../../../np-phaser/src/lib/sprites/np-movable-sprite';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { vectorToStr } from '../../../../np-phaser/src/lib/utilities/np-phaser-utils';
import { SPACE_EVENTS } from '../space.events';
import { NPSpaceMap } from '../space/np-space-map';

export class SpaceMapScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-map-scene';
    iter = 0;
    private rocket: NPMovableSprite;
    private map: NPSpaceMap;

    constructor() {
        super({ key: SpaceMapScene.key });
    }

    setupComponents() {
        this.map = this.addComponent(new NPSpaceMap(this));

        this.game.events.on(SPACE_EVENTS.ZOOM_IN, () => {
            this.cameras.main.setZoom(1);
        });
        this.game.events.on(SPACE_EVENTS.ZOOM_OUT, () => {
            this.cameras.main.setZoom(0.05);
        });
    }

    // this.addComponent(this.map);
    // this.addComponent(new Reality(this, 'reality1'));

    preload() {
        console.log('Preloading Assets...');
        super.preload();
        this.load.image('rocket', 'assets/rocket.png');
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    create() {
        super.create();
        const start = this.map.startingPlanet.getCenter();
        this.rocket = new NPMovableSprite(this, start.x, start.y, 'rocket').setScale(0.5);
        this.rocket.create();
        this.rocket.setDepth(30);
        this.addExisting(this.rocket);
        this.map.setRocket(this.rocket);
        this.cameras.main.startFollow(this.rocket).setZoom(0.5);
    }

    update(time: number, delta: number) {
        // this.map.update(time, delta);
        this.rocket.update(delta);
        const debugMsg = [
            'rocket',
            vectorToStr(this.rocket.getCenter()),
            'fps',
            `${this.game.loop.actualFps}`,
            'planets',
            `${this.map?.list.length}`,
            'zoom',
            `${this.cameras.main.zoom}`,
            't',
            `${Phaser.Math.Distance.BetweenPoints({ x: -100, y: -100 }, { x: 100, y: 100 })}`,
            `${Phaser.Math.Distance.BetweenPoints({ x: 0, y: 0 }, { x: 200, y: 200 })}`,
        ];
        this.debugOut(debugMsg);
        // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        this.iter += 0.01;
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
