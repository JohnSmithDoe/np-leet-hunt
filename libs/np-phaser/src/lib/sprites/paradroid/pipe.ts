import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

const SHEET = { key: 'pipes', url: 'assets/paradroid.png' };

export const FRAMES = {
    bottom_endCap: 0,
    bottom_left_elbow: 3,
    cross: 6,
    empty: 12,
    left_endCap: 15,
    right_bottom_elbow: 1,
    right_bottom_left_tee: 2,
    right_endCap: 13,
    right_left_straight: 14,
    top_bottom_left_tee: 7,
    top_bottom_straight: 4,
    top_endCap: 8,
    top_left_elbow: 11,
    top_right_bottom_tee: 5,
    top_right_elbow: 9,
    top_right_left_tee: 10,
};

export class Pipe extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    readonly #frame: number;

    constructor(public scene: NPScene, frame: keyof typeof FRAMES) {
        super(scene, 0, 0, '');
        this.#frame = FRAMES[frame];
        this.setName(frame);
    }

    preload(): void {
        if (!this.scene.textures.exists(SHEET.key)) {
            this.scene.load.spritesheet(SHEET.key, SHEET.url, {
                frameWidth: this.getFrameWidth(),
                frameHeight: this.getFrameWidth(),
            });
        }
    }

    private getFrameWidth() {
        return 120;
    }

    private getFrameCount() {
        return 4;
    }

    create(): void {
        this.setTexture(SHEET.key, this.#frame);
        this.scene.addToLayer('np', this);

        let frame = 0;
        for (let i = 0; i < this.getFrameCount(); i++) {
            for (let j = 0; j < this.getFrameCount(); j++) {
                const img = new Phaser.GameObjects.Image(this.scene, j * this.getFrameWidth(), i * this.getFrameWidth(), SHEET.key, frame);
                img.alpha = 0.5;
                this.scene.addToLayer('np', img);
                frame++;
            }
        }
    }
}
