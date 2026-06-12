import * as Phaser from 'phaser';

import { NPScene } from './np-scene';

// Gameobject with init, preload and create
export interface NPGameObject extends Phaser.GameObjects.GameObject {
    scene: NPScene;

    init?(): void;
    preload?(): void;
    create?(container?: Phaser.GameObjects.Container): void;
    addToScene?(): void;
    // update(...args) is already part of Phaser.GameObjects.GameObject
}

export interface NPGameObjectContainer {
    scene: NPScene;

    init(): void;
    preload(): void;
    create(): void;
    addToScene(): void;
}

export class NPGameObjectList<T extends NPGameObject | NPGameObjectList = NPGameObject>
    extends Phaser.Structs.List<T>
    implements NPGameObjectContainer
{
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

    create(container?: Phaser.GameObjects.Container): void {
        for (const component of this.list) {
            if (component.create) {
                component.create(container);
            }
        }
    }

    update(...args: unknown[]): void {
        for (const component of this.list) {
            if (component.update) {
                component.update(...args);
            }
        }
    }

    public addToScene(): void {
        for (const component of this.list) {
            if (component.addToScene) {
                component.addToScene();
            }
        }
    }
}
