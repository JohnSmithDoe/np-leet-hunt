import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { Space } from '../space/space';

/** The drifting nebula backdrop, rendered below the map scene on its own camera. */
export class SpaceScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-scene';
    #space!: Space;

    constructor() {
        super({ key: SpaceScene.key });
    }

    setupComponents() {
        this.#space = this.addComponent(new Space(this, Space.getRandom()));
    }

    override create() {
        super.create();
        this.addExisting(this.#space);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
    }
}
