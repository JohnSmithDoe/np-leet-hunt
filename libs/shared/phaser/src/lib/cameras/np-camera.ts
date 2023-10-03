import * as Phaser from 'phaser';

// eslint-disable-next-line import/no-cycle
import { NPScene } from '../scenes/np-scene';
// eslint-disable-next-line import/no-cycle
import { NPBaseComponent } from '../scenes/np-scene-component';
import { isLayer } from '../utilities/np-phaser-utils';

export class NPCamera extends Phaser.Cameras.Scene2D.Camera implements NPBaseComponent {
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
        if ((!this.focusLayer && !this.focusObject) || (this.focusLayer && this.focusLayer.getChildren()?.includes(child)) || (this.focusObject && this.focusObject === child)) {
            super.addToRenderList(child);
        }
    }
}
