import { EDirection, mapRexPluginDirection, mapToRexPluginDirection } from '@shared/np-library';
import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import ChessData from 'phaser3-rex-plugins/plugins/board/chess/ChessData';
import FieldOfView from 'phaser3-rex-plugins/plugins/board/fieldofview/FieldOfView';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonAction, WalkToAction } from '../engine/states/handle-action.state';
import { EMobInfoType } from './pixel-dungeon.info-text';

type TLpcSheetType = 'standard' | 'extended';
type TLpcAnimationDirection = 'up' | 'down' | 'left' | 'right';
type TLpcAnimationKey = 'walk up' | 'walk down' | 'walk left' | 'walk right' | 'die';

const equalTile = (tile: TileXYType, other: TileXYType) => tile.x === other.x && tile.y === other.y;

export class PixelDungeonMob extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    rexChess: ChessData;
    scene: NPSceneWithBoard;
    options: TPixelDungeonMobOptions;

    #moveTo: BoardPlugin.MoveTo;
    #pathToMove: PathFinder.NodeType[];
    #fieldOfView: FieldOfView<Phaser.GameObjects.GameObject>;
    #currentVision: TileXYType[];
    #energy = 0;
    key: string;
    #nextAction: PixelDungeonAction | null;

    constructor(public engine: PixelDungeonEngine, options?: TPixelDungeonMobOptions) {
        super(engine.scene, 0, 0, '');
        this.options = Object.assign({}, defaultOptions, options ?? {});
    }

    get energy() {
        return this.#energy;
    }

    get vision() {
        return this.#currentVision;
    }

    get hasNextAction() {
        return !!this.#nextAction;
    }

    faceTowards(rexDirection: number) {
        this.#fieldOfView.setFace(rexDirection);
    }

    get faceDirection() {
        return mapRexPluginDirection(this.#fieldOfView.face);
    }

    updateVision() {
        this.#currentVision = this.#fieldOfView.findFOV(this.options.visionRange);
        this.#currentVision.push({ ...this.tile });
    }

    setMoveSpeed(speed: number) {
        this.#moveTo.setSpeed(speed);
    }

    canSee(tile: TileXYType) {
        return !!this.#currentVision.find(other => equalTile(tile, other));
    }

    preload() {
        this.key = 'brawler';
        this.scene.load.spritesheet(this.key, 'np-pixel-dungeon/Download19233.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        // this.scene.load.image('grid', 'np-pixel-dungeon/grid-ps1.png');
    }

    create() {
        this.#createAnimations();
        this.#createMoveTo();
        this.#createFieldOfView();

        // Animation set
        //   1   2   3   4   5   6   7   8   9  10  11  12  13
        //  14  15  16  17  18  19  20  21  22  23  24  25  26
        //  27  28  29  30  31  32  33  34  35  36  37  38  39
        //  40  41  42  43  44  45  46  47  48  49  50  51  52
        //  53  54  55  56  57  58  59  60  61  62  63  64  65
        //  66  67  68  69  70  71  72  73  74  75  76  77  78
        //  79  80  81  82  83  84  85  86  87  88  89  90  91
        //  92  93  94  95  96  97  98  99 100 101 102 103 104
        // 105 106 107 108 109 110 111 112 113 114 115 116 117
        // 118 119 120 121 122 123 124 125 126 127 128 129 130
        // 131 132 133 134 135 136 137 138 139 140 141 142 143
        // 144 145 146 147 148 149 150 151 152 153 154 155 156
        // 157 158 159 160 161 162 163 164 165 166 167 168 169
        // 170 171 172 173 174 175 176 177 178 179 180 181 182
        // 183 184 185 186 187 188 189 190 191 192 193 194 195
        // 196 197 198 199 200 201 202 203 204 205 206 207 208
        // 209 210 211 212 213 214 215 216 217 218 219 220 221
        // 222 223 224 225 226 227 228 229 230 231 232 233 234
        // 235 236 237 238 239 240 241 242 243 244 245 246 247
        // 248 ... 260

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (a, b, c, d) => {
            console.log(`Playing: ${d}`);
        });

        this.setTexture(this.key, 1);
        this.setScale(1);
        const size = 24;
        this.setOrigin((size - 16) / 2 / size, (size - 16) / size);
        this.setDisplaySize(size, size);
        console.log(this.rexChess);
        this.rexChess.setBlocker(true);
    }

    play(key: TLpcAnimationKey): this {
        return super.play(key, true);
    }

    faceMoveTo(dir: EDirection) {
        switch (dir) {
            case EDirection.NONE:
                this.play('die');
                break;
            case EDirection.N:
                this.play('walk up');
                break;
            case EDirection.NE:
            case EDirection.E:
            case EDirection.SE:
                this.play('walk right');
                break;
            case EDirection.S:
                this.play('walk down');
                break;
            case EDirection.SW:
            case EDirection.W:
            case EDirection.NW:
                this.play('walk left');
                break;
        }
    }

    faceToAnimation(key: TLpcAnimationKey) {
        //this.stop();
        this.setFrame(this.anims.get(key).getFrameByProgress(0).frame);
    }

    faceToDirection(dir: EDirection) {
        switch (dir) {
            case EDirection.NONE:
                this.faceToAnimation('die');
                break;
            case EDirection.N:
                this.faceToAnimation('walk up');
                break;
            case EDirection.NE:
            case EDirection.E:
            case EDirection.SE:
                this.faceToAnimation('walk right');
                break;
            case EDirection.S:
                this.faceToAnimation('walk down');
                break;
            case EDirection.SW:
            case EDirection.W:
            case EDirection.NW:
                this.faceToAnimation('walk left');
                break;
        }
    }

    #createAnimations() {
        const animations = NPLpcConfig[this.options.lpcType].animations;
        for (const key in animations) {
            if (animations.hasOwnProperty(key)) {
                const animation = animations[key];
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers(this.key, { ...animation }),
                    frameRate: animation.frameRate ?? 12,
                    repeat: animation.repeat ?? -1,
                });
            }
        }
    }

    #createMoveTo() {
        this.#moveTo = this.scene.rexBoard.add.moveTo(this, {
            speed: this.options.moveSpeed,
            rotateToTarget: this.options.moveRotate,
            blockerTest: true,
            occupiedTest: true,
            sneak: false,
            moveableTestScope: undefined,
            moveableTest: (from, to) => !!this.engine.costs(to),
        });
        this.#moveTo.on('complete', () => console.log('complete move'));
    }

    #createFieldOfView() {
        this.#fieldOfView = this.scene.rexBoard.add.fieldOfView(this, {
            preTestCallback: a => this.engine.preTestCallback(a, this.options.visionRange),
            costCallback: a => this.engine.costs(a),
            coneMode: 'angle',
            cone: this.options.fovConeAngle,
            occupiedTest: false,
            blockerTest: false,
            perspective: false,
        });
        this.#fieldOfView.setFace(mapToRexPluginDirection(this.options.startingDirection));
        this.updateVision();
    }

    onceMoved(fn: () => void) {
        this.#moveTo.once('complete', () => fn());
        return this;
    }

    onceMovedOccupied(fn: () => void) {
        this.#moveTo.once('occupy', () => fn());
        return this;
    }

    moveOnPath(path: PathFinder.NodeType[]) {
        console.log('269:moveOnPath');
        this.#pathToMove = path;
        if (this.hasMoves()) {
            const pathTile = this.nextMove();
            console.log('new action walk');
            this.setNextAction(new WalkToAction(this, pathTile));
        }
    }

    moveOnTile(tileX: number, tileY: number) {
        this.#pathToMove = [{ x: tileX, y: tileY, pathCost: 0, preNodes: [] }];
        return this;
    }

    hasMoves() {
        return !!this.#pathToMove?.length;
    }

    nextMove() {
        return this.#pathToMove.shift();
    }

    isMoving() {
        const s = (this.#moveTo as unknown as { moveToTask: { targetX: number; targetY: number } }).moveToTask;
        const { targetX, targetY } = s;
        return this.#moveTo.isRunning && !(targetX === this.x && targetY === this.y);
    }

    moveOnRandomTile(warp = false) {
        this.#moveTo.moveToRandomNeighbor();
        let i = 0;
        while (!this.#moveTo.canMoveTo(this.#moveTo.destinationTileX, this.#moveTo.destinationTileY)) {
            this.#moveTo.moveToRandomNeighbor();
            if (i++ > 500) break;
        }
        if (warp) {
            const pos = this.engine.map.tileMap.tileToWorldXY(
                this.#moveTo.destinationTileX,
                this.#moveTo.destinationTileY
            );
            this.setPosition(pos.x, pos.y);
        }
        return this;
    }

    moveToTile(tile: TileXYType) {
        this.#moveTo.moveTo(tile);
        console.log('move to tile');
        this.faceTowards(this.#moveTo.destinationDirection);
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
        console.log('start turn mob');
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
        if (this.#moveTo.canMoveTo(tile.x, tile.y)) {
            this.engine.board.moveChess(this, tile.x, tile.y, 1);
            this.showInfo(`3`, EMobInfoType.GainHealth);
        }
    }

    showInfo(msg: string, type: EMobInfoType) {
        this.engine.displayText(msg, this.tile, type);
    }

    canMoveTo(tile: TileXYType) {
        return this.#moveTo.canMoveTo(tile.x, tile.y);
    }
}

interface TLpcAnimation {
    start: number;
    end: number;
    frameRate?: number;
    repeat?: number;
    direction: TLpcAnimationDirection;
}

interface TLpcSheetConfig {
    animations: Partial<Record<TLpcAnimationKey, TLpcAnimation>>;
}

type TLpcConfig = Record<TLpcSheetType, TLpcSheetConfig>;

const NPLpcConfig: TLpcConfig = {
    standard: {
        animations: {
            die: { direction: 'down', start: 260, end: 265, repeat: 0 },
            'walk up': { direction: 'down', start: 104, end: 112 },
            'walk left': { direction: 'down', start: 117, end: 125 },
            'walk down': { direction: 'down', start: 130, end: 138 },
            'walk right': { direction: 'down', start: 143, end: 151 },
        },
    },
    extended: {
        animations: {
            die: { direction: 'down', start: 1, end: 2, frameRate: 8 },
        },
    },
};

export interface TPixelDungeonMobOptions {
    lpcType?: TLpcSheetType;
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
    moveRotate: false,
    moveSpeed: 160,
    visionRange: 3,
    energyGain: 25,
};

const FULL_ENERGY = 100;
