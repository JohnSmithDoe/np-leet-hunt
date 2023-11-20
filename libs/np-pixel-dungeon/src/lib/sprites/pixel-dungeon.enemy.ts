import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMob, TPixelDungeonSpriteOptions } from './pixel-dungeon.mob';

interface TPixelDungeonEnemyOptions extends TPixelDungeonSpriteOptions {
    type: 'skeleton';
}

const defaultOptions: TPixelDungeonEnemyOptions = {
    lpcType: 'standard',
    moveRotate: false,
    moveSpeed: 200,
    type: 'skeleton',
};

export class PixelDungeonEnemy extends PixelDungeonMob {
    #options: TPixelDungeonEnemyOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonEnemyOptions) {
        super(engine, options);
        this.#options = Object.assign({}, defaultOptions, options ?? {});
    }

    preload() {
        this.key = 'skeleton';
        this.scene.load.spritesheet('skeleton', 'np-pixel-dungeon/Download19233.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        // this.scene.load.image('grid', 'np-pixel-dungeon/grid-ps1.png');
    }
}
