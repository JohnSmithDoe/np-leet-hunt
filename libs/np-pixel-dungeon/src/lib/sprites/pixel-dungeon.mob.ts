import { EDirection } from '@shared/np-library';
import { NPGameObject } from '@shared/np-phaser';
import ChessData from 'phaser4-rex-plugins/plugins/board/chess/ChessData';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { EMobInfoType } from './pixel-dungeon.info-text';
import { PixelDungeonLPCSprite, TPixelDungeonLPCSpriteOptions } from './pixel-dungeon.lpc-sprite';
import { MobAction } from './traits/mob-action';
import { MobMovement } from './traits/mob-movement';
import { MobVision } from './traits/mob-vision';

export interface TPixelDungeonMobOptions extends TPixelDungeonLPCSpriteOptions {
    energyGain?: number;

    moveSpeed?: number;
    moveRotate?: boolean;

    visionRange?: number;
    fovConeAngle?: number;

    startingDirection?: EDirection;
}

const defaultOptions: TPixelDungeonMobOptions = {
    startingDirection: EDirection.N,
    lpcType: 'standard',
    key: 'brawler',
    moveRotate: false,
    moveSpeed: 160,
    visionRange: 3,
    energyGain: 25,
};

export class PixelDungeonMob extends PixelDungeonLPCSprite implements NPGameObject {
    rexChess!: ChessData;
    override scene!: NPSceneWithBoard;
    options: TPixelDungeonMobOptions;

    #movement!: MobMovement;
    #vision!: MobVision;
    #activity!: MobAction;
    #lastTile = { x: 0, y: 0, z: 0 };

    constructor(
        public engine: PixelDungeonEngine,
        options?: TPixelDungeonMobOptions
    ) {
        const mobOptions = Object.assign({}, defaultOptions, options ?? {});
        super(engine.scene, 0, 0, mobOptions);
        this.options = mobOptions;
    }

    override create() {
        super.create();
        this.#movement = new MobMovement(this);
        this.#vision = new MobVision(this);
        this.#activity = new MobAction(this);
        this.setTexture(this.options.key, 1);
        this.setScale(1);
        const size = 20;
        this.setOrigin(0, 0.5);
        this.setDisplaySize(size, size);
    }

    startTurn() {
        // nop
    }

    info(msg: string, type: EMobInfoType) {
        this.engine.displayText(msg, this.tile, type);
    }

    get tile() {
        // rexChess.tileXYZ is briefly null while a mob is between board cells (mid-move/off-board);
        // fall back to the last known tile rather than the {0,0,0} origin, which mis-placed text,
        // vision and adjacency checks.
        const tileXYZ = this.rexChess.tileXYZ;
        if (tileXYZ) this.#lastTile = tileXYZ;
        return this.#lastTile;
    }

    get vision() {
        return this.#vision;
    }

    get movement() {
        return this.#movement;
    }

    get activity() {
        return this.#activity;
    }

    get action() {
        return this.activity.getAction();
    }
}
