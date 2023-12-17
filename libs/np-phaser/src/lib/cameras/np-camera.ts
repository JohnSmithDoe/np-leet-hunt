import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { isLayer } from '../utilities/np-phaser-utils';

export class NPCamera extends Phaser.Cameras.Scene2D.Camera {
    focusObject?: Phaser.GameObjects.GameObject;
    focusLayer?: Phaser.GameObjects.Layer;
    debug = true;
    #makeMain = false;

    constructor(public scene: NPScene, x: number, y: number, width: number, height: number, makeMain: boolean) {
        super(x, y, width, height);
        this.#makeMain = makeMain;
    }

    init(): void {
        this.scene.cameras.addExisting(this, this.#makeMain);
        if (!this.debug) {
            this.ignore(this.scene.physics.world.debugGraphic);
        }
    }

    setFocus(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Layer) {
        if (isLayer(gameObject)) {
            this.focusLayer = gameObject;
        } else {
            this.focusObject = gameObject;
        }
        return this;
    }

    addToRenderList(child: Phaser.GameObjects.GameObject) {
        if (
            (!this.focusLayer && !this.focusObject) ||
            (this.focusLayer && this.focusLayer.getChildren()?.includes(child)) ||
            (this.focusObject && this.focusObject === child)
        ) {
            super.addToRenderList(child);
        }
    }
}
