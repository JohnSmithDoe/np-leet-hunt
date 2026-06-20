import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

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
    override options!: TPixelDungeonEnemyOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonEnemyOptions) {
        // options.energyGain = (Math.trunc(Math.random() * 5) + 1) * 10;
        super(engine, Object.assign({}, defaultOptions, options ?? {}));
    }

    override get action(): PixelDungeonAction | null {
        this.#aiAction();
        return super.action;
    }

    #aiAction() {
        const activity = this.activity;
        if (activity.hasNextAction || !activity.canAct()) return;

        const neighbours = this.engine.level.getNeighborChess(this.tile);
        const playerIsAdjacent = (Array.isArray(neighbours) ? neighbours : [neighbours]).some(
            n => n === this.engine.player
        );
        if (playerIsAdjacent) {
            activity.setNextAction(new AttackMobAction(this, this.engine.player));
            return;
        }

        const tile = this.#randomStepTile();
        if (!tile) {
            activity.setNextAction(new RestAction(this));
        } else if (this.engine.player.vision.canSee(this.tile) || this.engine.player.vision.canSee(tile)) {
            activity.setNextAction(new WalkToAction(this, tile));
        } else {
            // out of the player's sight — teleport instead of animating the step
            activity.setNextAction(new WarpAction(this, tile));
        }
    }

    /**
     * A random walkable adjacent tile, or null after a few misses. The rex board lookups can throw
     * when no empty tile is in range, so every call is guarded here (the previous version left the
     * retry calls unguarded, letting a throw escape into the turn loop).
     */
    #randomStepTile(): TileXYType | null {
        try {
            let tile = this.engine.level.getRandomEmptyTileXYInRange(this.tile, 1);
            for (let i = 0; tile && !this.movement.canMoveToTile(tile); i++) {
                if (i >= 5) return null;
                tile = this.engine.level.getRandomEmptyTileXYInRange(this.tile, 1);
            }
            return tile ?? null;
        } catch {
            return null;
        }
    }
}
