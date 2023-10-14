import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

export const IMAGES = {
    space1: { key: 'space-1', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-1.jpg' },
    space2: { key: 'space-2', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-2.jpg' },
    space3: { key: 'space-3', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-3.jpg' },
    space4: { key: 'space-4', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-4.jpg' },
    space5: { key: 'space-5', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-5.jpg' },
    space6: { key: 'space-6', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-6.jpg' },
    space7: { key: 'space-7', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-7.jpg' },
    space8: { key: 'space-8', url: 'assets/tileablespace/tileable-classic-nebula-space-patterns-8.jpg' },
};

export class Space extends Phaser.GameObjects.TileSprite implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    constructor(public scene: NPScene, type: keyof typeof IMAGES) {
        super(scene, 0, 0, scene.scale.width, scene.scale.height, '');
        this.#image = IMAGES[type];
        this.setName(type);
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    create(): void {
        this.setTexture(this.#image.key).setSize(this.scene.scale.width, this.scene.scale.height).setOrigin(0);
        this.scene.addToLayer('bg', this);
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    update(...args: number[]): void {
        super.update(...args);
        this.tilePositionX += 0.5;
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scene.scale;
        this.setSize(width, height);
    }
}
