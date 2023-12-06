import { EDirection } from '@shared/np-library';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { AttackMobAction, WalkToAction } from '../engine/states/handle-action.state';
import { EMobInfoType } from './pixel-dungeon.info-text';
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
    visionRange: 10,
    moveRotate: false,
    moveSpeed: 120,
    fovConeAngle: undefined,
    energyGain: 100,
};

export class PixelDungeonPlayer extends PixelDungeonMob {
    options: TPixelDungeonPlayerOptions;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonPlayerOptions) {
        super(engine, Object.assign({}, defaultOptions, options ?? {}));
    }

    init(): void {
        console.log('init player');
    }

    get action() {
        if (!super.action && this.movement.hasMoves()) {
            const pathTile = this.movement.nextMove();
            this.activity.setNextAction(new WalkToAction(this, pathTile));
            this.info('mov', EMobInfoType.Doged);
        }
        return super.action;
    }

    attack(mob: PixelDungeonMob) {
        if (this.engine.board.areNeighbors(this.tile, mob.tile)) {
            this.activity.setNextAction(new AttackMobAction(this, mob));
        }
    }

    lookAround() {
        this.vision.updateVision();
    }
}
