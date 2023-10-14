import * as Phaser from 'phaser';
import Ship from 'phaser3-rex-plugins/plugins/ship';

export class NPMovableSprite extends Phaser.Physics.Arcade.Image {
    // private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private shipBehaviour: Ship;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture) {
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

    public update(delta: number) {
        super.update(delta);
        // this.controls.update(delta);
        if (!this.shipBehaviour.isUp) {
            this.setAngularVelocity(0);
            this.setVelocity(0);
        }
    }
}
