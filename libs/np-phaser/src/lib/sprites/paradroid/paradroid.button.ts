import { NPScene } from '../../scenes/np-scene';
import { TextButton } from '../button/text-button';

export class ParadroidButton extends TextButton {
    constructor(
        scene: NPScene,
        x: number,
        y: number,
        text: string | string[],
        style?: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        super(scene, x, y, text, style);
    }

    create(container?: Phaser.GameObjects.Container): void {
        if (container) {
            container.add(this);
        } else {
            this.scene.addToLayer('ui', this);
        }
    }
}
