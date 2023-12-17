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

    async setupComponents() {
        this.generateStuff();
        this.game.events.on(SPACE_EVENTS.ZOOM_IN, () => {
            this.cameras.main.setZoom(this.cameras.main.zoom + 0.01);
        });
        this.game.events.on(SPACE_EVENTS.ZOOM_OUT, () => {
            this.cameras.main.setZoom(this.cameras.main.zoom - 0.01);
        });
    }

    private generateStuff() {
        this.map = new NPSpaceMap(this);
        this.map.init();
        // this.addComponent(this.map);
        // this.addComponent(new Reality(this, 'reality1'));
    }

    preload() {
        console.log('Preloading Assets...');
        super.preload();
        this.map.preload();
        this.load.image('rocket', 'assets/rocket.png');
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    create() {
        super.create();
        this.map.create();
        this.rocket = new NPMovableSprite(this, 5000, 5000, 'rocket').setScale(0.5);
        this.addToLayer('np', this.rocket);
        this.map.list.forEach(c => this.add.existing(c));
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
