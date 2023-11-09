import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

export class Image extends Phaser.GameObjects.Image implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;
    #frameKey: number;

    constructor(
        public scene: NPScene,
        x: number,
        y: number,
        image: Phaser.Types.Loader.FileTypes.ImageFileConfig,
        frame?: number
    ) {
        super(scene, x, y, '', frame);
        this.#image = image;
        this.#frameKey = frame;
    }

    preload(): void {
        console.log('13:preload');
        if (this.#image.frameConfig) {
            this.scene.load.spritesheet(this.#image);
        } else {
            this.scene.load.image(this.#image);
        }
    }

    create(container?: Phaser.GameObjects.Container): void {
        console.log('17:create');
        console.log(this.#image);

        this.setTexture(this.#image.key, this.#frameKey);
        container?.add(this);
    }
}
