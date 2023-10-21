import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';

export class TextButton extends Phaser.GameObjects.Text {
    constructor(public scene: NPScene, x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, style);

        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState());
    }

    enterButtonHoverState() {
        this.setStyle({ fill: '#ff0' });
    }

    enterButtonRestState() {
        this.setStyle({ fill: '#0f0' });
    }

    enterButtonActiveState() {
        this.setStyle({ fill: '#0ff' });
    }
}
