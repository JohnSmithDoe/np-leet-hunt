// eslint-disable-next-line max-classes-per-file
import * as Phaser from 'phaser';

import { NPScene } from './np-scene';

// Gameobject with init, preload and create
export interface NPGameObject extends Phaser.GameObjects.GameObject {
    scene: NPScene;

    init?(): void;
    preload?(): void;
    create?(): void;

    // hmm
    // protected preUpdate?(time: number, delta: number): void;
}

export interface NPGameObjectContainer {
    scene: NPScene;

    init(): void;
    preload(): void;
    create(): void;
}

export class NPGameObjectList<T extends NPGameObject> extends Phaser.Structs.List<T> implements NPGameObjectContainer {
    scene: NPScene;

    constructor(scene: NPScene) {
        super(scene); // hmm: parent what does this?
        this.scene = scene;
    }

    init(): void {
        for (const component of this.list) {
            if (component.init) {
                component.init();
            }
        }
    }

    preload(): void {
        for (const component of this.list) {
            if (component.preload) {
                component.preload();
            }
        }
    }

    create(): void {
        for (const component of this.list) {
            if (component.create) {
                component.create();
            }
        }
    }
}
