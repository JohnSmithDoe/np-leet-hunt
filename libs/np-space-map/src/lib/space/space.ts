import { NPGameObject, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { NPRNG } from '../../../../np-phaser/src/lib/utilities/piecemeal';

const IMAGES = {
    space1: { key: 'space-1', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-1.jpg' },
    space2: { key: 'space-2', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-2.jpg' },
    space3: { key: 'space-3', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-3.jpg' },
    space4: { key: 'space-4', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-4.jpg' },
    space5: { key: 'space-5', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-5.jpg' },
    space6: { key: 'space-6', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-6.jpg' },
    space7: { key: 'space-7', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-7.jpg' },
    space8: { key: 'space-8', url: 'np-space-map/space/tileable-classic-nebula-space-patterns-8.jpg' },
};

export class Space extends Phaser.GameObjects.TileSprite implements NPGameObject {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    static getRandom() {
        const types = Object.keys(IMAGES) as (keyof typeof IMAGES)[];
        return NPRNG.item(types);
    }

    constructor(public scene: NPScene, type: keyof typeof IMAGES) {
        super(scene, 0, 0, scene.scale.width, scene.scale.height, '');
        this.#image = IMAGES[type];
        this.setName(type);
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    create(): void {
        console.log('36:create-');
        this.setTexture(this.#image.key).setSize(this.scene.scale.width, this.scene.scale.height).setOrigin(0);
        // this.scene.addToLayer('bg', this);
        // this only works if the camera is related to this....
        // two options: own camera      scene handles all the camera related stuff
        //              soc             control
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    preUpdate(): void {
        this.tilePositionX += 0.5;
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scene.scale;
        this.setSize(width, height);
    }
}
