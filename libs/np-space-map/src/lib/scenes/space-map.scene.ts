import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { NPMovableSprite } from '../../../../np-phaser/src/lib/sprites/np-movable-sprite';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { NPSpaceMap } from '../space/np-space-map';

// Zoomed well out by default so the closing front is legible; the wheel zooms in for node detail.
const INITIAL_ZOOM = 0.09;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 1;

export class SpaceMapScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-map-scene';
    #rocket!: NPMovableSprite;
    #map!: NPSpaceMap;

    constructor() {
        super({ key: SpaceMapScene.key });
    }

    setupComponents() {
        this.#map = this.addComponent(new NPSpaceMap(this));
    }

    preload() {
        super.preload();
        this.load.image('rocket', 'assets/rocket.png');
    }

    create() {
        super.create();
        const start = this.#map.startingPlanet;
        this.#rocket = new NPMovableSprite(this, start.x, start.y, 'rocket').setScale(0.5);
        this.#rocket.create();
        this.#rocket.setDepth(30);
        this.addExisting(this.#rocket);
        this.#map.setRocket(this.#rocket);

        this.cameras.main.startFollow(this.#rocket).setZoom(INITIAL_ZOOM);
        this.input.on('wheel', (_pointer: unknown, _over: unknown, _dx: number, dy: number) => {
            const cam = this.cameras.main;
            cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), MIN_ZOOM, MAX_ZOOM));
        });
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    update(time: number, delta: number) {
        this.#map.update(time, delta); // drives planet spin + route shimmer
        super.update(time, delta);
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
    }
}
