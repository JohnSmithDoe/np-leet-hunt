import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

// const frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig = {
//     frameWidth: 256 * 2,
//     frameHeight: 256 * 2,
// };
const IMAGES = {
    defaultBtn: {
        key: 'button-glossy',
        url: 'np-phaser/button/assets/button1.png',
    },
    defaultBtnHover: {
        key: 'button-glossy-hover',
        url: 'np-phaser/button/assets/button2.png',
    },
    defaultBtnPressed: {
        key: 'button-glossy-pressed',
        url: 'np-phaser/button/assets/button3.png',
    },
    defaultBtnDisabled: {
        key: 'button-glossy-disabled',
        url: 'np-phaser/button/assets/button4.png',
    },
};

export class Button extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    static readonly EVENT_CLICK = 'np-click';
    #disabled = false;

    constructor(public scene: NPScene, x: number, y: number) {
        super(scene, x, y, '');
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => this.#updateTexture(true, false))
            .on('pointerout', () => this.#updateTexture(false, false))
            .on('pointerdown', () => this.#updateTexture(true, true))
            .on('pointerup', () => this.#onClick());
    }

    preload(): void {
        this.scene.load.image(IMAGES.defaultBtn);
        this.scene.load.image(IMAGES.defaultBtnHover);
        this.scene.load.image(IMAGES.defaultBtnPressed);
        this.scene.load.image(IMAGES.defaultBtnDisabled);
    }

    create(container?: Phaser.GameObjects.Container): void {
        this.setTexture(IMAGES.defaultBtn.key);
        this.setOrigin(0);
        this.setDisplaySize(64, 64);
        container?.add(this);
        if (!container) this.scene.addToLayer('ui', this);
    }

    #onClick() {
        if (this.#disabled) {
            return;
        }
        this.setTexture(IMAGES.defaultBtn.key);
        this.emit(Button.EVENT_CLICK, this);
    }

    set disabled(value: boolean) {
        this.#disabled = value;
        value ? this.setTexture(IMAGES.defaultBtnDisabled.key) : this.setTexture(IMAGES.defaultBtn.key);
    }

    #updateTexture(hover: boolean, press: boolean) {
        if (this.#disabled) {
            this.setTexture(IMAGES.defaultBtnDisabled.key);
        } else if (press) {
            this.setTexture(IMAGES.defaultBtnPressed.key);
        } else if (hover) {
            this.setTexture(IMAGES.defaultBtnHover.key);
        } else {
            this.setTexture(IMAGES.defaultBtn.key);
        }
    }
}
