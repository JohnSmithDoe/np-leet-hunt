import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

const IMAGES = {
    reality1: { key: 'reality-1', url: 'np-phaser/reality/assets/nebular.jpg' },
};

export class Reality extends Phaser.GameObjects.TileSprite implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;
    private sphere: Phaser.GameObjects.Graphics;
    private light: Phaser.GameObjects.Arc;
    private renderTexture: Phaser.GameObjects.RenderTexture;

    handlePointerMove(pointer) {
        const x = pointer.x;
        const y = pointer.y;

        this.renderTexture.clear();
        this.renderTexture.draw(this.light, x, y);
    }

    constructor(public scene: NPScene, type: keyof typeof IMAGES) {
        super(scene, 0, 0, scene.scale.width, scene.scale.height, '');
        this.#image = IMAGES[type];
        this.setName(type);
        const graphics = new Phaser.GameObjects.Graphics(this.scene);
        graphics.fillStyle(0xff00ff, 0.5);
        graphics.lineStyle(50, 0xff00ff);
        graphics.fillCircle(0, 0, 500);
        // graphics.beginPath();
        // graphics.arc(0, 0, 200, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.01);
        // graphics.strokePath();
        // graphics.closePath();
        graphics.setPosition(1e3, 500);
        this.sphere = graphics;
        // this.scene.add.existing(graphics);
        const mask = new Phaser.Display.Masks.GeometryMask(this.scene, graphics);
        mask.invertAlpha = true;
        this.setBlendMode(Phaser.BlendModes.LUMINOSITY);

        this.setMask(mask);

        this.alpha = 0.25;
        // const rt = this.scene.make.renderTexture(
        //     {
        //         width: this.scene.scale.width,
        //         height: this.scene.scale.height,
        //     },
        //     false
        // );
        // this.light = this.scene.add.circle(0, 0, 1130, 0x000000, 1);
        // this.light.visible = false;
        // this.renderTexture = rt;
        // // this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove, this);
        // const maskImage = this.scene.make.image({
        //     x: 0,
        //     y: 0,
        //     key: rt.texture.key,
        //     add: false,
        // });

        // const mask = new Phaser.Display.Masks.BitmapMask(this.scene, maskImage);
        // mask.invertAlpha = true;
        // this.setMask(mask);
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    create(): void {
        this.setTexture(this.#image.key).setSize(this.scene.scale.width, this.scene.scale.height).setOrigin(0);
        this.scene.addToLayer('fg', this);
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    update(...args: number[]): void {
        super.update(...args);
        this.sphere.scale = this.sphere.scale - 0.001;
        // this.tilePositionX -= 0.5;
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scene.scale;
        this.setSize(width, height);
    }
}
