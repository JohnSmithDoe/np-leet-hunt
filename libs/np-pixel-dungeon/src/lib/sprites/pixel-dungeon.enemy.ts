import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import {
    AttackMobAction,
    PixelDungeonAction,
    RestAction,
    WalkToAction,
    WarpAction,
} from '../engine/states/handle-action.state';
import { PixelDungeonMob, TPixelDungeonMobOptions } from './pixel-dungeon.mob';

interface TPixelDungeonEnemyOptions extends TPixelDungeonMobOptions {
    type: 'skeleton';
}

const defaultOptions: TPixelDungeonEnemyOptions = {
    lpcType: 'standard',
    moveRotate: false,
    type: 'skeleton',
    key: 'skeleton',
    energyGain: 50,
};

export class PixelDungeonEnemy extends PixelDungeonMob {
    options: TPixelDungeonEnemyOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonEnemyOptions) {
        // options.energyGain = (Math.trunc(Math.random() * 5) + 1) * 10;
        super(engine, Object.assign({}, defaultOptions, options ?? {}));
    }

    get action(): PixelDungeonAction | null {
        this.#aiAction();
        return super.action;
    }

    #aiAction() {
        const activity = this.activity;
        if (!activity.hasNextAction && activity.canAct()) {
            let tile: TileXYType;
            const neighbours = this.engine.board.getNeighborChess(this, null) ?? [];
            const playerAsNeigbour = (neighbours && Array.isArray(neighbours) ? neighbours : [neighbours]).find(
                n => n === this.engine.player
            );
            if (playerAsNeigbour) {
                activity.setNextAction(new AttackMobAction(this, this.engine.player));
            } else {
                try {
                    tile = this.engine.board.getRandomEmptyTileXYInRange(this, 1, 1);
                } catch (e) {
                    console.log('no random tile');
                }
                if (tile) {
                    let i = 0;
                    while (!this.movement.canMoveToTile(tile)) {
                        tile = this.engine.board.getRandomEmptyTileXYInRange(this, 1, 1);
                        if (i++ > 5) {
                            tile = null;
                            break;
                        }
                    }
                }

                if (tile) {
                    if (this.engine.player.vision.canSee(this.tile) || this.engine.player.vision.canSee(tile)) {
                        activity.setNextAction(new WalkToAction(this, tile));
                    } else {
                        activity.setNextAction(new WarpAction(this, tile));
                    }
                } else {
                    activity.setNextAction(new RestAction(this));
                }
            }
        }
    }
}
