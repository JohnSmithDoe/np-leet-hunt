import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { AttackMobAction, PixelDungeonAction, RestAction, WarpAction } from '../engine/states/handle-action.state';
import { PixelDungeonMob, TPixelDungeonMobOptions } from './pixel-dungeon.mob';

interface TPixelDungeonEnemyOptions extends TPixelDungeonMobOptions {
    type: 'skeleton';
}

const defaultOptions: TPixelDungeonEnemyOptions = {
    lpcType: 'standard',
    moveRotate: false,
    type: 'skeleton',
    energyGain: 50,
};

export class PixelDungeonEnemy extends PixelDungeonMob {
    options: TPixelDungeonEnemyOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonEnemyOptions) {
        // options.energyGain = (Math.trunc(Math.random() * 5) + 1) * 10;
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

    public getAction(): PixelDungeonAction | null {
        this.#aiAction();
        return super.getAction();
    }

    #aiAction() {
        if (!this.hasNextAction && this.canAct()) {
            let tile: TileXYType;
            const neighbours = this.engine.board.getNeighborChess(this, null);
            if (neighbours && Array.isArray(neighbours)) {
                const other = neighbours.pop() as PixelDungeonMob;
                this.setNextAction(new AttackMobAction(this, other));
            } else {
                try {
                    tile = this.engine.board.getRandomEmptyTileXYInRange(this, 1, 1);
                } catch (e) {
                    console.log('no random tile');
                }
                if (tile) {
                    let i = 0;
                    while (!this.canMoveTo(tile)) {
                        tile = this.engine.board.getRandomEmptyTileXYInRange(this, 1, 1);
                        if (i++ > 5) {
                            tile = null;
                            break;
                        }
                    }
                }
                this.setNextAction(tile ? new WarpAction(this, tile) : new RestAction(this));
            }
        }
    }
}
