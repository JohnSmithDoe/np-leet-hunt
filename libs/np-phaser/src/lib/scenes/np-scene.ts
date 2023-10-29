import * as Phaser from 'phaser';

import { NPLayer } from './np-layer';
import { NPSceneComponent, NPSceneComponentContainer, NPSceneContainer } from './np-scene-component';

export type TNPLayerKeys = 'bg' | 'np' | 'fg' | 'ui' | string;

export abstract class NPScene extends Phaser.Scene implements NPSceneComponentContainer {
    #components = new NPSceneContainer<NPSceneComponent>(this);
    #layers = new NPSceneContainer<NPLayer>(this);
    #debugOut: Phaser.GameObjects.Text;
    x: Phaser.Structs.List<NPLayer> = new Phaser.Structs.List<NPLayer>(this);

    abstract setupComponents(): void;

    #initScene() {
        const npLayer = new NPLayer(this, 'bg', false);
        this.x.add(npLayer);
        this.cameras.resetAll();
        this.cameras.remove(this.cameras.main);
        console.log('23:#initScene');

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
        // this.#layers.getByName('np').camera.setZoom(0.1);
        // DEBUG <- end
    }

    debugOut(text: string | string[] | number | number[]) {
        this.#debugOut.setText(`${text}`);
        this.addToLayer('debug', this.#debugOut); // need to readd or it will be rendered by every camera...
    }

    addComponent(component: NPSceneComponent | NPSceneComponent[]) {
        if (Array.isArray(component)) {
            component.forEach(comp => this.addComponent(comp));
        } else {
            this.#components.add(component);
        }
    }

    addToLayer(name: TNPLayerKeys, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (Array.isArray(gameObject)) {
            gameObject.forEach(gameObj => this.addToLayer(name, gameObj));
        } else {
            for (const layer of this.#layers.list) {
                if (layer.name === name) {
                    layer.add(gameObject, true);
                } else {
                    layer.camera?.ignore(gameObject); // ignore obj on every other layer
                }
            }
        }
    }

    createLayer(name: TNPLayerKeys, makeMain = false) {
        this.#layers.add(new NPLayer(this, name, makeMain));
    }

    init() {
        this.#initScene();
        this.setupComponents();
        this.#layers.init();
        this.#components.init();
    }

    preload() {
        this.#components.preload();
        this.#layers.preload();
    }

    create() {
        this.#layers.create();
        this.#components.create();
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.#layers.update(time, delta);
        this.#components.update(time, delta);
    }
}
