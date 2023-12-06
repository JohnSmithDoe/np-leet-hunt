import { EDirection, mapRexPluginDirection } from '@shared/np-library';
import { NPSceneComponent } from '@shared/np-phaser';
import ChessData from 'phaser3-rex-plugins/plugins/board/chess/ChessData';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonAction, WalkToAction } from '../engine/states/handle-action.state';
import { NPFieldOfView } from '../rex-rainbow/np-field-of-view';
import { NPMoveTo } from '../rex-rainbow/np-move-to';
import { EMobInfoType } from './pixel-dungeon.info-text';
import { PixelDungeonLPCSprite, TPixelDungeonLPCSpriteOptions } from './pixel-dungeon.lpc-sprite';

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

const FULL_ENERGY = 100;

export class PixelDungeonMob extends PixelDungeonLPCSprite implements NPSceneComponent {
    rexChess: ChessData;
    scene: NPSceneWithBoard;
    options: TPixelDungeonMobOptions;

    protected moveTo: NPMoveTo;
    protected fieldOfView: NPFieldOfView;

    #energy = 0;
    #nextAction: PixelDungeonAction | null;

    constructor(public engine: PixelDungeonEngine, options?: TPixelDungeonMobOptions) {
        const mobOptions = Object.assign({}, defaultOptions, options ?? {});
        super(engine.scene, 0, 0, mobOptions);
        this.options = mobOptions;
    }

    create() {
        super.create();
        this.moveTo = new NPMoveTo(this);
        this.fieldOfView = new NPFieldOfView(this);

        this.setTexture(this.options.key, 1);
        this.setScale(1);
        const size = 24;
        this.setOrigin((size - 16) / 2 / size, (size - 16) / size);
        this.setDisplaySize(size, size);
    }

    faceTowards(rexDirection: number) {
        this.fieldOfView.setFace(rexDirection);
    }
    setMoveSpeed(speed: number) {
        this.moveTo.setSpeed(speed);
    }

    canSee(tile: TileXYType) {
        return this.fieldOfView.canSee(tile);
    }

    onceMoved(fn: () => void) {
        this.moveTo.once('complete', () => fn());
        return this;
    }

    onceMovedOccupied(fn: () => void) {
        this.moveTo.once('occupy', () => fn());
        return this;
    }

    moveOnPath(path: PathFinder.NodeType[]) {
        console.log('269:moveOnPath');
        this.moveTo.setPath(path);
        if (this.moveTo.hasMoves()) {
            const pathTile = this.moveTo.nextMove();
            console.log('new action walk');
            this.setNextAction(new WalkToAction(this, pathTile));
        }
    }

    isMoving() {
        return this.moveTo.isMoving();
    }

    moveToTile(tile: TileXYType) {
        this.moveTo.moveTo(tile);
        console.log('move to tile');
        this.faceTowards(this.moveTo.destinationDirection);
        this.faceMoveTo(this.faceDirection);
        this.updateFov();
    }

    get tile() {
        return this.rexChess.tileXYZ;
    }

    protected updateFov() {
        this.engine.updateFoV();
    }

    gainEnergy() {
        //console.log(`${this.key} gain energy: ${this.options.energyGain}/${this.#energy}`);

        return (this.#energy += this.options.energyGain) >= FULL_ENERGY;
    }

    canAct() {
        return this.#energy >= FULL_ENERGY;
    }

    startTurn() {
        // nop
    }

    setNextAction(action: PixelDungeonAction) {
        this.#nextAction = action;
    }

    getAction(): PixelDungeonAction | null {
        return this.#nextAction;
    }

    drainEnergy(amount: number) {
        this.#energy -= amount;
    }

    warp(tile: TileXYType) {
        if (this.moveTo.canMoveTo(tile.x, tile.y)) {
            this.engine.board.moveChess(this, tile.x, tile.y, 1);
            this.showInfo(`!`, EMobInfoType.GainHealth);
        }
    }

    showInfo(msg: string, type: EMobInfoType) {
        this.engine.displayText(msg, this.tile, type);
    }

    canMoveTo(tile: TileXYType) {
        return this.moveTo.canMoveTo(tile.x, tile.y);
    }

    get energy() {
        return this.#energy;
    }

    get vision() {
        return this.fieldOfView.vision;
    }

    get hasNextAction() {
        return !!this.#nextAction;
    }

    get faceDirection() {
        return mapRexPluginDirection(this.fieldOfView.face);
    }
}
