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
    addComponent(component: NPSceneComponent): void;
}

export class NPComponentContainer implements NPSceneComponentContainer, NPSceneComponent {
    #components: NPSceneComponent[] = [];

    constructor(public scene: NPScene) {}

    public addComponent(component: NPSceneComponent) {
        this.#components.push(component);
    }

    public init(): void {
        for (const component of this.#components) {
            if (component.init) {
                component.init();
            }
        }
    }

    public preload(): void {
        for (const component of this.#components) {
            if (component.preload) {
                component.preload();
            }
        }
    }

    public create(): void {
        for (const component of this.#components) {
            if (component.create) {
                component.create();
            }
        }
    }

    public update(time: number, delta: number): void {
        for (const component of this.#components) {
            if (component.update) {
                component.update(time, delta);
            }
        }
    }
}
