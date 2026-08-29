import { EDirection } from '@shared/np-library';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { AttackMobAction, WalkToAction } from '../engine/states/handle-action.state';
import { PixelDungeonMob, TPixelDungeonMobOptions } from './pixel-dungeon.mob';

// this.makeAnimation('walk1', 1, 6);
// this.makeAnimation('walk2', 14, 19);
// this.makeAnimation('walk3', 27, 32);
// this.makeAnimation('walk4', 40, 45);
//
// this.makeAnimation('walk5', 53, 59);
// this.makeAnimation('walk6', 66, 72);
// this.makeAnimation('walk7', 79, 85);
// this.makeAnimation('walk8', 92, 98);
//
// this.makeAnimation('walk13', 157, 161);
// this.makeAnimation('walk14', 170, 174);
// this.makeAnimation('walk15', 183, 187);
// this.makeAnimation('walk16', 196, 200);
//
// this.makeAnimation('walk17', 209, 220);
// this.makeAnimation('walk18', 222, 233);
// this.makeAnimation('walk19', 235, 246);
// this.makeAnimation('walk20', 248, 259);

type TPixelDungeonPlayerOptions = TPixelDungeonMobOptions;

const defaultOptions: TPixelDungeonPlayerOptions = {
    startingDirection: EDirection.N,
    lpcType: 'standard',
    key: 'brawler',
    moveRotate: false,
    moveSpeed: 120,
    fovConeAngle: undefined,
    // The player's real stats (HP/attack/defense, energy, vision, sheet) now come from np-config's
    // `BESTIARY.brawler`, threaded in by the engine's `#setup` (item #10) — the same data path enemies take
    // through `MobFactory`. No stats hard-coded here; the engine passes the bestiary block as options.
};

export class PixelDungeonPlayer extends PixelDungeonMob {
    override options!: TPixelDungeonPlayerOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonPlayerOptions) {
        super(engine, Object.assign({}, defaultOptions, options ?? {}));
    }

    /**
     * Continue the player's queued click-to-move path (RPG cluster E / F5). Moved out of the old
     * `get action()` (which mutated state as a side-effect of a property read) into this explicit step the
     * turn loop calls before reading `action`. When the player has no queued action but still has path
     * tiles left, pop the next one into a `WalkToAction`. The `action` getter reverts to the base mob's.
     */
    override decide(): void {
        if (!this.action && this.movement.hasMoves()) {
            const pathTile = this.movement.nextMove();
            this.activity.setNextAction(new WalkToAction(this, pathTile));
        }
    }

    attack(mob: PixelDungeonMob) {
        if (this.engine.level.areNeighbors(this.tile, mob.tile)) {
            this.activity.setNextAction(new AttackMobAction(this, mob));
        }
    }

    lookAround() {
        this.vision.updateVision();
    }
}
