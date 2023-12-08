import { EDirection } from '@shared/np-library';
import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';

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

export interface TPixelDungeonLPCSpriteOptions {
    lpcType?: TLpcSheetType;
    key: TLpcSheetKeys;
}

export type TLpcSheetKeys = 'brawler' | 'skeleton';

export const CLpcSheetConfigs: Record<TLpcSheetKeys, { url: string }> = {
    brawler: { url: 'np-pixel-dungeon/Download96156.png' },
    skeleton: { url: 'np-pixel-dungeon/Download19233.png' },
};

/**
 * Liberated Pixel Cup Sprite-Sheet-Wrapper
 *
 * @see https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/
 */
export class PixelDungeonLPCSprite extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    #options: TPixelDungeonLPCSpriteOptions;

    constructor(public scene: NPScene, x: number, y: number, options: TPixelDungeonLPCSpriteOptions) {
        super(scene, x, y, '');
        this.#options = options;
    }

    preload() {
        this.scene.load.spritesheet(this.#options.key, CLpcSheetConfigs[this.#options.key].url, {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create() {
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
    }

    play(key: TLpcAnimationKey): this {
        return super.play(key, true);
    }

    animateWalk(dir: EDirection) {
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

    #setFirstAnimationFrame(key: TLpcAnimationKey) {
        //this.stop();
        this.setFrame(this.anims.get(key).getFrameByProgress(0).frame);
    }

    animateFaceToDirection(dir: EDirection) {
        switch (dir) {
            case EDirection.NONE:
                this.#setFirstAnimationFrame('die');
                break;
            case EDirection.N:
                this.#setFirstAnimationFrame('walk up');
                break;
            case EDirection.NE:
            case EDirection.E:
            case EDirection.SE:
                this.#setFirstAnimationFrame('walk right');
                break;
            case EDirection.S:
                this.#setFirstAnimationFrame('walk down');
                break;
            case EDirection.SW:
            case EDirection.W:
            case EDirection.NW:
                this.#setFirstAnimationFrame('walk left');
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
                    frames: this.anims.generateFrameNumbers(this.#options.key, { ...animation }),
                    frameRate: animation.frameRate ?? 12,
                    repeat: animation.repeat ?? -1,
                });
            }
        }
    }
}
