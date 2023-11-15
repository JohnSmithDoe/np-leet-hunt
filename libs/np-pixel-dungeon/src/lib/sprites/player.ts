import * as Phaser from 'phaser';

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
            die: { direction: 'down', start: 261, end: 265, repeat: 0 },
            'walk up': { direction: 'down', start: 105, end: 112 },
            'walk left': { direction: 'down', start: 118, end: 125 },
            'walk down': { direction: 'down', start: 131, end: 138 },
            'walk right': { direction: 'down', start: 144, end: 151 },
        },
    },
    extended: {
        animations: {
            die: { direction: 'down', start: 1, end: 2, frameRate: 8 },
        },
    },
};

export class Player extends Phaser.GameObjects.Sprite {
    #type: TLpcSheetType;

    constructor(scene: Phaser.Scene, x: number, y: number, type: TLpcSheetType) {
        super(scene, x, y, 'brawler', 1);
        this.#type = type;
    }

    preload() {
        this.scene.load.spritesheet('brawler', 'np-pixel-dungeon/Download96156.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.scene.load.image('grid', 'np-pixel-dungeon/grid-ps1.png');
    }

    create() {
        // Text section
        this.scene.add.tileSprite(0, 0, 832, 1344, 'grid').setOrigin(0);
        this.scene.add.image(0, 0, 'brawler', '__BASE').setOrigin(0, 0);
        this.scene.add.grid(0, 0, 832, 1344, 64, 64).setOrigin(0, 0).setOutlineStyle(0x00ff00);

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
        console.log(this.scene.textures.get('brawler'));

        this.setTexture('brawler', 1);
        this.play('walk right');
        this.setScale(1);
        this.scene.input.on('pointerdown', () => {
            this.play('die');
        });
    }

    play(key: TLpcAnimationKey, ignoreIfPlaying?: boolean): this {
        return super.play(key, ignoreIfPlaying);
    }

    #createAnimations() {
        const animations = NPLpcConfig[this.#type].animations;
        for (const key in animations) {
            if (animations.hasOwnProperty(key)) {
                const animation = animations[key];
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers('brawler', { ...animation }),
                    frameRate: animation.frameRate ?? 8,
                    repeat: animation.repeat ?? -1,
                });
            }
        }
    }
}
