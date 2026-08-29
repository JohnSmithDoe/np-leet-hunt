import { EDirection } from '@shared/np-library';
import { NPGameObject } from '@shared/np-phaser';
import ChessData from 'phaser4-rex-plugins/plugins/board/chess/ChessData';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { EMobInfoType } from './pixel-dungeon.info-text';
import { PixelDungeonLPCSprite, TPixelDungeonLPCSpriteOptions } from './pixel-dungeon.lpc-sprite';
import { MobAction } from './traits/mob-action';
import { MobCombat } from './traits/mob-combat';
import { MobMovement } from './traits/mob-movement';
import { MobVision } from './traits/mob-vision';

export interface TPixelDungeonMobOptions extends TPixelDungeonLPCSpriteOptions {
    energyGain?: number;

    moveSpeed?: number;
    moveRotate?: boolean;

    visionRange?: number;
    fovConeAngle?: number;

    startingDirection?: EDirection;

    // Combat stats (Leet combat spine). Equipment folds into the derived attack/defense later (item #13).
    maxHp?: number;
    attack?: number;
    defense?: number;
}

const defaultOptions: TPixelDungeonMobOptions = {
    startingDirection: EDirection.N,
    lpcType: 'standard',
    key: 'brawler',
    moveRotate: false,
    moveSpeed: 160,
    visionRange: 3,
    energyGain: 25,
    // The real per-archetype combat stats now come from np-config's `BESTIARY` via `MobFactory` (item #10).
    // These are only a minimal *safety* fallback so a directly-newed mob (a test, an unexpected path) still
    // has non-undefined HP and `MobCombat` never reads NaN — not balance numbers (those live in the bestiary).
    maxHp: 1,
    attack: 1,
    defense: 0,
};

export class PixelDungeonMob extends PixelDungeonLPCSprite implements NPGameObject {
    rexChess!: ChessData;
    override scene!: NPSceneWithBoard;
    options: TPixelDungeonMobOptions;

    #movement!: MobMovement;
    #vision!: MobVision;
    #activity!: MobAction;
    #combat!: MobCombat;
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
        this.#combat = new MobCombat(this);
        this.setTexture(this.options.key, 1);
        this.setScale(1);
        const size = 20;
        this.setOrigin(0, 0.5);
        this.setDisplaySize(size, size);
    }

    startTurn() {
        // nop
    }

    /**
     * Decide this mob's next action for the turn — an explicit step the turn loop calls before reading
     * `action` (RPG cluster E / F5). The base mob is passive (no-op); the player continues its queued path,
     * the enemy delegates to its `MobBrain`. Replaces the old mutation-on-read `get action()` side-effect.
     */
    decide(): void {
        // base: no decision
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

    get combat() {
        return this.#combat;
    }

    get action() {
        return this.activity.getAction();
    }
}
