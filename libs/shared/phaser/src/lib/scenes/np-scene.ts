import * as Phaser from 'phaser';

// eslint-disable-next-line import/no-cycle
import { NPLayer } from './np-layer';
// eslint-disable-next-line import/no-cycle
import { NPSceneComponent, NPSceneComponentContainer } from './np-scene-component';

export type TNPLayerKeys = 'bg' | 'np' | 'fg' | 'ui' | string;

export abstract class NPScene extends Phaser.Scene implements NPSceneComponentContainer {
    #components: NPSceneComponent[] = [];
    layers: Record<TNPLayerKeys, NPLayer> = {};
    #debugOut: Phaser.GameObjects.Text;

    abstract setupComponents(): void;

    #initScene() {
        this.cameras.resetAll();
        this.cameras.remove(this.cameras.main);
        this.createLayer('bg');
        this.createLayer('np', true);
        this.createLayer('fg');
        this.createLayer('ui');
        this.createLayer('debug');
        // DEBUG -> start

        this.#debugOut = new Phaser.GameObjects.Text(this, 0, 0, '', {
            backgroundColor: '#2f6c38',
        });
        this.addToLayer('debug', this.#debugOut);
        // DEBUG <- end
    }

    debugOut(text: string | string[]) {
        this.#debugOut.setText(text);
        this.addToLayer('debug', this.#debugOut); // need to readd or it will be rendered by every camera...
    }

    addComponent(component: NPSceneComponent) {
        this.#components.push(component);
    }

    getLayers(): NPLayer[] {
        return Object.values(this.layers);
    }

    addToLayer(name: TNPLayerKeys, gameObject: Phaser.GameObjects.GameObject) {
        for (const layer of this.getLayers()) {
            if (layer.key === name) {
                layer.add(gameObject, true);
            } else {
                layer.camera?.ignore(gameObject); // ignore obj on every other layer
            }
        }
    }

    createLayer(name: TNPLayerKeys, makeMain = false) {
        this.layers[name] = new NPLayer(this, name, makeMain);
    }

    init() {
        this.#initScene();
        this.setupComponents();
        for (const layer of this.getLayers()) {
            layer.init();
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
        for (const layer of this.getLayers()) {
            this.add.existing(layer);
        }

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
