import { EDirection, mapRexPluginDirection, mapToRexPluginDirection } from '@shared/np-library';
import * as Phaser from 'phaser';
import FieldOfView from 'phaser3-rex-plugins/plugins/board/fieldofview/FieldOfView';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { SceneWithBoard, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonMap } from './pixel-dungeon.map';

type TLpcSheetType = 'standard' | 'extended';
type TLpcAnimationDirection = 'up' | 'down' | 'left' | 'right';
type TLpcAnimationKey = 'walk up' | 'walk down' | 'walk left' | 'walk right' | 'die';

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

interface TPixelDungeonPlayerOptions {
    lpcType?: TLpcSheetType;

    fovRange?: number;
    fovConeAngle?: number;

    moveSpeed?: number;
    moveRotate?: boolean;
    startingDirection?: EDirection;
}

const defaultOptions: TPixelDungeonPlayerOptions = {
    startingDirection: EDirection.N,
    lpcType: 'standard',
    fovRange: 10,
    moveRotate: false,
    moveSpeed: 200,
    fovConeAngle: undefined,
};

export class PixelDungeonPlayer extends Phaser.GameObjects.Sprite {
    #map: PixelDungeonMap;
    #tile: TDungeonTile;

    #moveTo: BoardPlugin.MoveTo;
    #pathToMove: PathFinder.NodeType[];

    #fieldOfView: FieldOfView<Phaser.GameObjects.GameObject>;
    #currentView: TileXYType[];

    #options: TPixelDungeonPlayerOptions;

    constructor(public scene: Phaser.Scene & SceneWithBoard, options?: TPixelDungeonPlayerOptions) {
        super(scene, 0, 0, '');
        this.#options = Object.assign({}, defaultOptions, options ?? {});
    }

    preload() {
        this.scene.load.spritesheet('brawler', 'np-pixel-dungeon/Download19233.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        // this.scene.load.image('grid', 'np-pixel-dungeon/grid-ps1.png');
    }

    create() {
        // Text section
        // this.scene.add.tileSprite(0, 0, 832, 1344, 'grid').setOrigin(0);
        // this.scene.add.image(0, 0, 'brawler', '__BASE').setOrigin(0, 0);
        // this.scene.add.grid(0, 0, 832, 1344, 64, 64).setOrigin(0, 0).setOutlineStyle(0x00ff00);

        this.#createAnimations();

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

        this.setTexture('brawler', 1);
        this.setScale(1);
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
        const animations = NPLpcConfig[this.#options.lpcType].animations;
        for (const key in animations) {
            if (animations.hasOwnProperty(key)) {
                const animation = animations[key];
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers('brawler', { ...animation }),
                    frameRate: animation.frameRate ?? 12,
                    repeat: animation.repeat ?? -1,
                });
            }
        }
    }

    addToMap(map: PixelDungeonMap, start: TDungeonTile) {
        this.#map = map;
        this.#tile = start;
        map.board.addChess(this, start.x, start.y, 1);
        this.#createMoveTo();
        this.#createFieldOfView();
    }

    #createMoveTo() {
        this.#moveTo = this.scene.rexBoard.add.moveTo(this, {
            speed: this.#options.moveSpeed,
            rotateToTarget: this.#options.moveRotate,
            blockerTest: false,
            occupiedTest: false,
            sneak: false,
            moveableTestScope: undefined,
            moveableTest: undefined,
        });
        this.#moveTo.on('complete', () => this.moveToNext());
    }

    #createFieldOfView() {
        this.#fieldOfView = this.scene.rexBoard.add.fieldOfView(this, {
            preTestCallback: (a, visiblePoints) => {
                const first = a[0];
                const target = a[a.length - 1];
                const distance = Phaser.Math.Distance.Snake(first.x, first.y, target.x, target.y);
                return !visiblePoints || distance <= visiblePoints;
            },
            coneMode: 'angle',
            cone: this.#options.fovConeAngle,
            costCallback: a => this.#map.costs(a),
        });

        this.#fieldOfView.setFace(mapToRexPluginDirection(this.#options.startingDirection));
        this.#updateFoV();
    }

    #updateFoV() {
        this.#map.loseVision(this.#currentView);
        this.#currentView = this.#fieldOfView.findFOV(this.#options.fovRange);
        // put the players tile into vision as well
        this.#currentView.push({ ...this.tile });
        this.#map.gainVision(this.#currentView);
    }

    moveOnPath(path: PathFinder.NodeType[], startMoving = true) {
        this.#pathToMove = path;
        if (startMoving) {
            this.moveToNext();
        }
    }

    hasMoves() {
        return !!this.#pathToMove.length;
    }

    isMoving() {
        return !!this.#moveTo.destinationTileX;
    }

    moveToNext() {
        if (this.hasMoves()) {
            this.tile = this.#pathToMove.shift();
            this.#moveTo.moveTo(this.tile);
            this.faceMoveTo(mapRexPluginDirection(this.#moveTo.destinationDirection));
        } else {
            this.faceToDirection(mapRexPluginDirection(this.#moveTo.destinationDirection));
        }
        this.#fieldOfView.setFace(this.#moveTo.destinationDirection);
        this.#updateFoV();
    }

    set tile(next: PathFinder.NodeType | TileXYType) {
        this.#tile.x = next.x;
        this.#tile.y = next.y;
    }

    get tile() {
        return this.#tile;
    }

    get moveToTile(): TileXYType {
        return { x: this.#moveTo.destinationTileX, y: this.#moveTo.destinationTileY };
    }
}
