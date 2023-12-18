import { NPGameObject, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import MoveToTask from 'phaser3-rex-plugins/plugins/behaviors/moveto/MoveTo';
import Ship from 'phaser3-rex-plugins/plugins/ship';

export class NPMovableSprite extends Phaser.Physics.Arcade.Image implements NPGameObject {
    // private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private shipBehaviour: Ship;
    private moveTo: MoveToTask;

    constructor(public scene: NPScene, x: number, y: number, texture: string | Phaser.Textures.Texture) {
        super(scene, x, y, texture);
        this.shipBehaviour = new Ship(this, { wrap: false, maxSpeed: 500 });
        this.setName('rocket');
        // this.setVisible(true);
        console.log(this);
        // const controlConfig = {
        //     camera: this.scene.cameras.add(),
        //     left: cursors.left,
        //     right: cursors.right,
        //     up: cursors.up,
        //     down: cursors.down,
        //     zoomIn: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        //     zoomOut: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        //     acceleration: 0.06,
        //     drag: 0.0005,
        //     maxSpeed: 1.0,
        // };
        // this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    }

    public create(): void {
        this.moveTo = new MoveToTask(this, { speed: 1200, rotateToTarget: true });
    }

    preUpdate() {
        // this.controls.update(delta);
        if (!this.shipBehaviour.isUp) {
            this.setAngularVelocity(0);
            this.setVelocity(0);
        }
    }

    public moveToTarget(target: { x?: number; y?: number }) {
        this.moveTo.moveTo(target.x, target.y);
    }

    onceMoved(fn: () => void) {
        this.moveTo.once('complete', () => fn());
        return this;
    }
}
