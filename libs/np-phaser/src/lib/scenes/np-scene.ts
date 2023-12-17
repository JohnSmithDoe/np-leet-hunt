import { NPGameObject, NPGameObjectList } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { Observable, take } from 'rxjs';

import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';

export type TNPLayerKeys = 'bg' | 'np' | 'fg' | 'ui' | string;

export abstract class NPScene extends Phaser.Scene {
    protected components = new NPGameObjectList<NPGameObject | NPGameObjectList<NPGameObject>>(this);
    #debugOut: Phaser.GameObjects.Text;
    abstract setupComponents(): void;

    debugOut(text: string | string[] | number | number[]) {
        this.#debugOut.setText(`${text}`).setPosition(0, 0);
        this.addExisting(this.#debugOut); // need to readd or it will be rendered by every camera...
    }

    addComponent<T extends NPGameObject | NPGameObject[] | NPGameObjectList>(component: T) {
        if (Array.isArray(component)) {
            component.forEach(comp => this.addComponent(comp));
        } else {
            this.components.add(component);
        }
        return component;
    }
    removeComponent(component: NPGameObject | NPGameObject[] | NPGameObjectList) {
        if (Array.isArray(component)) {
            component.forEach(comp => this.removeComponent(comp));
        } else {
            this.components.remove(component);
        }
        return component;
    }
    addExisting(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (Array.isArray(gameObject)) {
            gameObject.forEach(gameObj => this.addExisting(gameObj));
        } else {
            this.add.existing(gameObject);
        }
    }

    removeExisting(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (Array.isArray(gameObject)) {
            gameObject.forEach(gameObj => this.removeExisting(gameObj));
        } else {
            gameObject.destroy(true);
        }
    }

    init() {
        this.#debugOut = this.add.text(0, 0, '');
        this.scale.baseSize.setSize(1920, 1080);
        // this.scale.scaleMode = Phaser.Scale.ScaleModes.FIT;
        this.setupComponents();
        this.components.init();
    }

    preload() {
        this.components.preload();
    }

    create() {
        this.components.create();
        this.components.addToScene();
        this.fadeIn();
    }

    private fadeIn() {
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
}
