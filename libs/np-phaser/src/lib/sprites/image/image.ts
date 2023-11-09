import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

export class Image extends Phaser.GameObjects.Image implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    constructor(public scene: NPScene, x: number, y: number, image: Phaser.Types.Loader.FileTypes.ImageFileConfig) {
        super(scene, x, y, '');
        this.#image = image;
    }

    preload(): void {
        console.log('13:preload');

        this.scene.load.image(this.#image);
    }

    create(container?: Phaser.GameObjects.Container): void {
        console.log('17:create');
        console.log(this.#image);

        this.setTexture(this.#image.key);
        container?.add(this);
    }
}
