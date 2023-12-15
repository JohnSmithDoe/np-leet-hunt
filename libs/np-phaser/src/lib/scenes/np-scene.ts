import { NPSceneComponent, NPSceneComponentContainer, NPSceneContainer } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { Observable, take } from 'rxjs';

import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
import { NPLayer } from './np-layer';

export type TNPLayerKeys = 'bg' | 'np' | 'fg' | 'ui' | string;

export abstract class NPScene extends Phaser.Scene implements NPSceneComponentContainer {
    protected components = new NPSceneContainer<NPSceneComponent>(this);
    #layers = new NPSceneContainer<NPLayer>(this);
    #debugOut: Phaser.GameObjects.Text;
    onlyComponent = true;

    abstract setupComponents(): void;

    #initScene() {
        this.cameras.resetAll();
        this.cameras.remove(this.cameras.main);
        console.log('23:#initScene');
        this.createLayer('bg');
        this.createLayer('np', true);
        this.createLayer('fg');
        this.createLayer('ui');
        this.createLayer('debug');
        // DEBUG -> start

        // this.#layers.getByName('np').camera.setZoom(0.1);
        // DEBUG <- end
    }

    debugOut(text: string | string[] | number | number[]) {
        this.#debugOut.setText(`${text}`).setPosition(0, this.scale.height - 50);
        this.addToLayer('debug', this.#debugOut); // need to readd or it will be rendered by every camera...
    }

    addComponent(component: NPSceneComponent | NPSceneComponent[]) {
        if (Array.isArray(component)) {
            component.forEach(comp => this.addComponent(comp));
        } else {
            this.components.add(component);
        }
    }

    layer(name: TNPLayerKeys) {
        return this.#layers.getByName(name);
    }

    addToLayer(name: TNPLayerKeys, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (Array.isArray(gameObject)) {
            gameObject.forEach(gameObj => this.addToLayer(name, gameObj));
        } else {
            this.add.existing(gameObject);
            const uiCam = this.cameras.getCamera('ui-camera');
            if (name === 'ui') {
                this.cameras.main.ignore(gameObject);
            } else {
                uiCam.ignore(gameObject);
            }
            //https://github.com/photonstorm/phaser/issues/6675
            return;
            // for (const layer of this.#layers.list) {
            //     if (layer.name === name) {
            //         layer.add(gameObject, true);
            //     } else {
            //         layer.camera?.ignore(gameObject); // ignore obj on every other layer
            //     }
            // }
        }
    }

    removeFromLayer(name: TNPLayerKeys, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (Array.isArray(gameObject)) {
            gameObject.forEach(gameObj => this.removeFromLayer(name, gameObj));
        } else {
            gameObject.destroy(true);

            // for (const layer of this.#layers.list) {
            //     if (layer.name === name) {
            //         layer.remove(gameObject);
            //         gameObject.destroy(true);
            //     }
            // }
        }
    }

    removeFromContainer(component: NPSceneComponent | NPSceneComponent[]) {
        if (Array.isArray(component)) {
            component.forEach(comp => this.removeFromContainer(comp));
        } else {
            this.components.remove(component);
        }
    }

    createLayer(name: TNPLayerKeys, makeMain = false) {
        this.#layers.add(new NPLayer(this, name, makeMain));
    }

    init() {
        this.#debugOut = this.add.text(0, 0, '');
        this.cameras.addExisting(new NPFullscreenCamera(this, false).setName('ui-camera'));
        if (!this.onlyComponent) {
            this.#initScene();
        }
        this.setupComponents();
        if (!this.onlyComponent) {
            this.#layers.init();
        }
        this.components.init();
    }

    preload() {
        this.components.preload();
        if (!this.onlyComponent) {
            this.#layers.preload();
        }
    }

    create(container?: Phaser.GameObjects.Container) {
        if (!this.onlyComponent) {
            this.#layers.create(container);
        }
        this.components.create(container);
        new Observable(sub => {
            this.cameras.cameras.forEach(cam => {
                cam.fadeIn(1000, 0, 0, 0, (cama: NPFullscreenCamera, percent: number) => {
                    if (percent === 1) {
                        sub.next(true);
                        sub.complete();
                    }
                });
            });
        })
            .pipe(take(1))
            .subscribe(() => {
                console.log('fade done');
            });
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if (!this.onlyComponent) {
            this.#layers.update(time, delta);
        }
        this.components.update(time, delta);
    }
}
