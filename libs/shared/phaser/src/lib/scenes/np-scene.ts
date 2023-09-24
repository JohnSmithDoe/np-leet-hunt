import * as Phaser from 'phaser';

// eslint-disable-next-line import/no-cycle
import { NPSceneComponent } from './np-scene-component';

export class NPScene extends Phaser.Scene {
    #components: NPSceneComponent[] = [];

    setupComponents?(): void;

    addComponent(component: NPSceneComponent) {
        this.#components.push(component);
    }

    init() {
        if (this.setupComponents) {
            this.setupComponents();
        }
        for (const component of this.#components) {
            if (component.init) {
                component.init();
            }
        }
    }

    preload() {
        for (const component of this.#components) {
            if (component.preload) {
                component.preload();
            }
        }
    }

    create() {
        for (const component of this.#components) {
            if (component.create) {
                component.create();
            }
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        for (const component of this.#components) {
            if (component.update) {
                component.update(time, delta);
            }
        }
    }
}
