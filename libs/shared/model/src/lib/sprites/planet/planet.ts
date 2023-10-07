import * as Phaser from 'phaser';

import { NPScene } from '../../../../../phaser/src/lib/scenes/np-scene';
import { NPSceneComponent } from '../../../../../phaser/src/lib/scenes/np-scene-component';

export const IMAGES = {
    planet1: { key: 'planet-1', url: 'assets/planets/planet01.png' },
    planet2: { key: 'planet-2', url: 'assets/planets/planet02.png' },
    planet3: { key: 'planet-3', url: 'assets/planets/planet03.png' },
    planet4: { key: 'planet-4', url: 'assets/planets/planet04.png' },
    planet5: { key: 'planet-5', url: 'assets/planets/planet05.png' },
    planet6: { key: 'planet-6', url: 'assets/planets/planet06.png' },
    planet7: { key: 'planet-7', url: 'assets/planets/planet07.png' },
    planet8: { key: 'planet-8', url: 'assets/planets/planet08.png' },
    planetBlue: { key: 'planet-blue', url: 'assets/example/blue-planet.png' },
    planetBrown: { key: 'planet-brown', url: 'assets/example/brown-planet.png' },
    planetSun: { key: 'planet-sun', url: 'assets/example/sun.png' },
    planetGalaxy: { key: 'planet-galaxy', url: 'assets/example/galaxy.png' },
    planetGasGiant: { key: 'planet-gas-giant', url: 'assets/example/gas-giant.png' },
    planetPurple: { key: 'planet-purple', url: 'assets/example/purple-planet.png' },
};

export class Planet implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;
    #planet: Phaser.GameObjects.Sprite;

    constructor(public scene: NPScene, type: keyof typeof IMAGES) {
        this.#image = IMAGES[type];
    }

    preload(): void {
        console.log(this.#image);
        this.scene.load.image(this.#image);
    }

    public create(): void {
        this.#planet = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.#image.key);
        console.log(this.#planet, this.#image);
        this.scene.addToLayer('np', this.#planet);
    }
    public update(): void {
        this.#planet.angle += 0.01;
    }
}
