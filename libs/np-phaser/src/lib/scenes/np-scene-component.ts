// eslint-disable-next-line import/no-cycle
import { NPScene } from './np-scene';

export interface NPBaseComponent {
    scene: NPScene;

    init?(): void;
}

export interface NPSceneComponent extends NPBaseComponent {
    preload?(): void;

    create?(): void;

    update?(time: number, delta: number): void;
}

export interface NPSceneComponentContainer {
    init(): void;

    preload(): void;

    create(): void;

    update(time: number, delta: number): void;
}

export class NPSceneContainer<T extends NPSceneComponent> extends Phaser.Structs.List<T> implements NPSceneComponentContainer {
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

    update(time: number, delta: number): void {
        for (const component of this.list) {
            if (component.update) {
                component.update(time, delta);
            }
        }
    }
}
