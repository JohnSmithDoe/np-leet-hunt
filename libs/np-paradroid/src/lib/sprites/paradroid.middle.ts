import { NPGameObject, NPScene } from '@shared/np-phaser';

import { EParadroidOwner } from '../@types/paradroid.consts';
import { TParadroidPlayer } from '../@types/paradroid.types';

type IMAGE_KEY = 'middle' | 'middle-player' | 'middle-droid' | 'middle-both';

const IMAGES = {
    nobody: {
        key: 'middle' as IMAGE_KEY,
        url: 'np-phaser/button/assets/button4.png',
    },
    player: {
        key: 'middle-player' as IMAGE_KEY,
        url: 'np-phaser/button/assets/button2.png',
    },
    droid: {
        key: 'middle-droid' as IMAGE_KEY,
        url: 'np-phaser/button/assets/button3.png',
    },
    both: {
        key: 'middle-both' as IMAGE_KEY,
        url: 'np-phaser/button/assets/button1.png',
    },
};

export class ParadroidMiddle extends Phaser.GameObjects.Sprite implements NPGameObject {
    static readonly EVENT_CHANGED = 'np-middle-changed';
    #active = { player: false, droid: false };

    constructor(
        public scene: NPScene,
        public row: number,
        x: number,
        y: number,
        private config = {
            width: 64,
            height: 64,
        }
    ) {
        super(scene, x, y, '');
    }

    preload(): void {
        this.scene.load.image(IMAGES.nobody);
        this.scene.load.image(IMAGES.player);
        this.scene.load.image(IMAGES.droid);
        this.scene.load.image(IMAGES.both);
    }

    create(container?: Phaser.GameObjects.Container): void {
        this.setTexture(IMAGES.nobody.key);
        this.setOrigin(0);
        this.setDisplaySize(this.config.width, this.config.height);
        container?.add(this);
        if (!container) this.scene.addExisting(this);
    }

    activate(owner: TParadroidPlayer) {
        if (owner === EParadroidOwner.Player) {
            this.#active.player = true;
        } else {
            this.#active.droid = true;
        }
        this.#updateOwner();
    }

    deactivate(owner: TParadroidPlayer) {
        if (owner === EParadroidOwner.Player) {
            this.#active.player = false;
        } else {
            this.#active.droid = false;
        }
        this.#updateOwner();
    }

    #updateOwner() {
        const old = this.texture.key;
        if (this.#active.droid && this.#active.player) {
            this.setTexture(IMAGES.both.key);
        } else if (this.#active.player) {
            this.setTexture(IMAGES.player.key);
        } else if (this.#active.droid) {
            this.setTexture(IMAGES.droid.key);
        }
        if (old !== this.texture.key) {
            this.emit(ParadroidMiddle.EVENT_CHANGED);
        }
    }

    get owner(): IMAGE_KEY {
        return this.texture.key as IMAGE_KEY;
    }

    set owner(key: IMAGE_KEY) {
        this.setTexture(key);
    }
}
