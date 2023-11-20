import * as Phaser from 'phaser';

import { SceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonSprite, TPixelDungeonSpriteOptions } from './pixel-dungeon.sprite';

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

interface TPixelDungeonEnemyOptions extends TPixelDungeonSpriteOptions {
    type: 'skeleton';
}

const defaultOptions: TPixelDungeonEnemyOptions = {
    lpcType: 'standard',
    moveRotate: false,
    moveSpeed: 200,
    type: 'skeleton',
};

export class PixelDungeonEnemy extends PixelDungeonSprite {
    #options: TPixelDungeonEnemyOptions;

    constructor(public scene: Phaser.Scene & SceneWithBoard, options?: TPixelDungeonEnemyOptions) {
        super(scene, options);
        this.#options = Object.assign({}, defaultOptions, options ?? {});
    }

    preload() {
        this.key = 'skeleton';
        this.scene.load.spritesheet('skeleton', 'np-pixel-dungeon/Download19233.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        // this.scene.load.image('grid', 'np-pixel-dungeon/grid-ps1.png');
    }
}
