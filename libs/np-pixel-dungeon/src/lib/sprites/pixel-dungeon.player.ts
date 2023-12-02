import { EDirection } from '@shared/np-library';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { WalkToAction } from '../engine/states/handle-action.state';
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
    visionRange: 10,
    moveRotate: false,
    moveSpeed: 160,
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

    preload() {
        this.key = 'brawler';
        this.scene.load.spritesheet('brawler', 'np-pixel-dungeon/Download96156.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    startTurn() {
        if (!this.getAction() && this.hasMoves()) {
            const pathTile = this.nextMove();
            this.setNextAction(new WalkToAction(this, pathTile));
            console.log('62:startTurn- drop move');
        }
    }

    getAction() {
        if (!super.getAction() && this.hasMoves()) {
            const pathTile = this.nextMove();
            this.setNextAction(new WalkToAction(this, pathTile));
            console.log('62:getaction- drop move');
        }
        return super.getAction();
    }
}
