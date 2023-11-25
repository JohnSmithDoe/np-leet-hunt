import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMob, TPixelDungeonMobOptions } from './pixel-dungeon.mob';

interface TPixelDungeonEnemyOptions extends TPixelDungeonMobOptions {
    type: 'skeleton';
}

const defaultOptions: TPixelDungeonEnemyOptions = {
    lpcType: 'standard',
    moveRotate: false,
    type: 'skeleton',
    energyGain: 20,
};

export class PixelDungeonEnemy extends PixelDungeonMob {
    options: TPixelDungeonEnemyOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonEnemyOptions) {
        super(engine, Object.assign({}, defaultOptions, options ?? {}));
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
