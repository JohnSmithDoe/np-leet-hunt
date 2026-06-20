import { NPRNG } from '@shared/np-library';
import { NPScene, NPSprite } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { PlanetInfo } from './planet-info';

const IMAGES = {
    planet1: { key: 'planet-1', url: 'np-space-map/planets/planet01.png' },
    planet2: { key: 'planet-2', url: 'np-space-map/planets/planet02.png' },
    planet3: { key: 'planet-3', url: 'np-space-map/planets/planet03.png' },
    planet4: { key: 'planet-4', url: 'np-space-map/planets/planet04.png' },
    planet5: { key: 'planet-5', url: 'np-space-map/planets/planet05.png' },
    planet6: { key: 'planet-6', url: 'np-space-map/planets/planet06.png' },
    planet7: { key: 'planet-7', url: 'np-space-map/planets/planet07.png' },
    planet8: { key: 'planet-8', url: 'np-space-map/planets/planet08.png' },
    planetBlue: { key: 'planet-blue', url: 'np-space-map/planets/blue-planet.png' },
    planetBrown: { key: 'planet-brown', url: 'np-space-map/planets/brown-planet.png' },
    planetSun: { key: 'planet-sun', url: 'np-space-map/planets/sun.png' },
    planetGalaxy: { key: 'planet-galaxy', url: 'np-space-map/planets/galaxy.png' },
    planetGasGiant: { key: 'planet-gas-giant', url: 'np-space-map/planets/gas-giant.png' },
    planetPurple: { key: 'planet-purple', url: 'np-space-map/planets/purple-planet.png' },
    planetGreenForest: { key: 'planet-green-forest', url: 'np-space-map/planets/green-forest.leonardo.png' },
};

/**
 * A node's role on the map this turn, which drives its look and whether it can be jumped to:
 * - `current`   — where the ship is now (marked by the "here" ring)
 * - `reachable` — an adjacent, still-distorted node the player can jump to (pulses, hand cursor)
 * - `dim`       — a live node that isn't adjacent right now
 * - `swallowed` — normalised by the front: a colourless, shrunken "boring star", no longer travelable
 */
export type PlanetMapState = 'current' | 'reachable' | 'dim' | 'swallowed';

const SWALLOWED_TINT = 0x6b7280;
const INNER_DISPLAY = 512; // base size for a normal planet (small textures scale up to this)
const OUTER_DISPLAY = 1100; // out-of-the-way bonus suns read noticeably bigger

export class Planet extends NPSprite {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;
    #baseScale = 1;
    #alive = true;
    #pulse?: Phaser.Tweens.Tween;
    #state: PlanetMapState = 'dim';
    #info!: PlanetInfo;
    #outer = false;

    static getRandom() {
        const types = Object.keys(IMAGES) as (keyof typeof IMAGES)[];
        return NPRNG.item(types);
    }

    /** Queue every planet texture so any sector (and any in-place rebuild) can set it from cache. */
    static preloadAll(scene: NPScene): void {
        Object.values(IMAGES).forEach(image => scene.load.image(image));
    }

    constructor(scene: NPScene, type: keyof typeof IMAGES) {
        super(scene, 0, 0, '');
        this.#image = IMAGES[type];
        this.setName(type);
    }

    /** A node is alive until the normality front swallows it. */
    get alive(): boolean {
        return this.#alive;
    }

    get mapState(): PlanetMapState {
        return this.#state;
    }

    /** This planet's survey readout, shown in the info overlay on selection. */
    get info(): PlanetInfo {
        return this.#info;
    }

    setInfo(info: PlanetInfo): this {
        this.#info = info;
        return this;
    }

    /** Out-of-the-way bonus sun off the main route (vs. an inner travel-graph planet). */
    get outer(): boolean {
        return this.#outer;
    }

    setOuter(value = true): this {
        this.#outer = value;
        return this;
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    public create(): void {
        this.setTexture(this.#image.key);
        this.setOrigin(0.5);
        // Outer (bonus) suns read bigger; inner planets just scale small textures up to a base size.
        if (this.#outer) {
            this.setDisplaySize(OUTER_DISPLAY, OUTER_DISPLAY);
        } else if (this.width < INNER_DISPLAY) {
            this.setDisplaySize(INNER_DISPLAY, INNER_DISPLAY);
        }
        this.#baseScale = this.scaleX;
    }

    addToScene(): void {
        this.scene.addExisting(this);
    }

    /** Apply a map role: updates tint, alpha, scale, the idle pulse, and travel interactivity. */
    setMapState(state: PlanetMapState): this {
        this.#state = state;
        this.#pulse?.stop();
        this.#pulse = undefined;
        this.setScale(this.#baseScale);

        switch (state) {
            case 'current':
                this.clearTint().setAlpha(1).setInteractive({ useHandCursor: true });
                break;
            case 'reachable':
                this.clearTint().setAlpha(1).setInteractive({ useHandCursor: true });
                this.#pulse = this.scene.tweens.add({
                    targets: this,
                    scale: this.#baseScale * 1.08,
                    duration: 700,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
                break;
            case 'dim':
                // Still clickable so the player can inspect any live planet, just not a jump target.
                this.clearTint().setAlpha(0.5).setInteractive({ useHandCursor: true });
                break;
            case 'swallowed':
                this.#alive = false;
                this.disableInteractive();
                this.setTint(SWALLOWED_TINT);
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0.3,
                    scale: this.#baseScale * 0.3,
                    duration: 800,
                    ease: 'Sine.easeIn',
                });
                break;
        }
        return this;
    }

    public override update(...args: number[]): void {
        super.update(...args);
        if (this.#alive) {
            this.angle += 0.05;
        }
    }
}
