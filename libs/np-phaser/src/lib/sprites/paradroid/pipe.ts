import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

const SHEET = { key: 'pipes', url: 'np-phaser/paradroid/assets/paradroid.png' };

type PIPES =
    | 'bottom_endCap'
    | 'bottom_left_elbow'
    | 'cross'
    | 'empty'
    | 'left_endCap'
    | 'right_bottom_elbow'
    | 'right_bottom_left_tee'
    | 'right_endCap'
    | 'right_left_straight'
    | 'top_bottom_left_tee'
    | 'top_bottom_straight'
    | 'top_endCap'
    | 'top_left_elbow'
    | 'top_right_bottom_tee'
    | 'top_right_elbow'
    | 'top_right_left_tee';

interface PipeDefinition {
    frame: number;
    connections: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
}

export const PIPE_DEFINITIONS: Record<PIPES, PipeDefinition> = {
    bottom_endCap: { frame: 0, connections: { bottom: true } },
    bottom_left_elbow: { frame: 3, connections: { bottom: true, left: true } },
    cross: { frame: 6, connections: { bottom: true, top: true, left: true, right: true } },
    empty: { frame: 12, connections: {} },
    left_endCap: { frame: 15, connections: { left: true } },
    right_bottom_elbow: { frame: 1, connections: { bottom: true, right: true } },
    right_bottom_left_tee: { frame: 2, connections: { right: true, bottom: true, left: true } },
    right_endCap: { frame: 13, connections: { right: true } },
    right_left_straight: { frame: 14, connections: { right: true, left: true } },
    top_bottom_left_tee: { frame: 7, connections: { top: true, bottom: true, left: true } },
    top_bottom_straight: { frame: 4, connections: { top: true, bottom: true } },
    top_endCap: { frame: 8, connections: { top: true } },
    top_left_elbow: { frame: 11, connections: { top: true, left: true } },
    top_right_bottom_tee: { frame: 5, connections: { top: true, right: true, bottom: true } },
    top_right_elbow: { frame: 9, connections: { top: true, right: true } },
    top_right_left_tee: { frame: 10, connections: { top: true, right: true, left: true } },
};

export class Pipe extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    readonly #config: PipeDefinition;
    private bars: {
        top?: Phaser.GameObjects.Graphics;
        right?: Phaser.GameObjects.Graphics;
        bottom?: Phaser.GameObjects.Graphics;
        left?: Phaser.GameObjects.Graphics;
    } = {};
    private flip = true;

    constructor(public scene: NPScene, frame: PIPES) {
        super(scene, 0, 0, '');
        this.#config = PIPE_DEFINITIONS[frame];
        this.setName(frame);
        this.setOrigin(0);
    }

    preload(): void {
        if (!this.scene.textures.exists(SHEET.key)) {
            this.scene.load.spritesheet(SHEET.key, SHEET.url, {
                frameWidth: this.getFrameWidth(),
                frameHeight: this.getFrameWidth(),
            });
        }
    }

    private getFrameWidth() {
        return 120;
    }

    private getFrameCount() {
        return 4;
    }

    create(): void {
        this.setTexture(SHEET.key, this.#config.frame);
        this.setDisplaySize(64, 64);
        this.scene.addToLayer('ui', this);
        // if (this.#config.connections.top) {
        //     this.bars.top = this.scene.make.graphics({ fillStyle: { alpha: 0.5, color: 0xff0000 } });
        //
        //     this.bars.top.fillRect(0, 0, 8, 32 - 4);
        //     if (flip) {
        //         this.bars.top.setPosition(this.x + 32 + 4, this.y + 32 - 4);
        //         this.bars.top.rotation = Math.PI;
        //     } else {
        //         this.bars.top.setPosition(this.x + 32 - 4, this.y);
        //     }
        //
        //     this.scene.addToLayer('ui', this.bars.top);
        // }
        // if (this.#config.connections.right) {
        //     this.bars.right = this.scene.make.graphics({ fillStyle: { alpha: 0.5, color: 0xff0000 } });
        //
        //     this.bars.right.fillRect(0, 0, 32 - 4, 8);
        //     if (flip) {
        //         this.bars.right.setPosition(this.x + 64, this.y + 32 + 4);
        //         this.bars.right.rotation = Math.PI;
        //     } else {
        //         this.bars.right.setPosition(this.x + 32 + 4, this.y + 32 - 4);
        //     }
        //
        //     this.scene.addToLayer('ui', this.bars.right);
        // }
        // if (this.#config.connections.bottom) {
        //     this.bars.bottom = this.scene.make.graphics({ fillStyle: { alpha: 0.5, color: 0xff0000 } });
        //
        //     this.bars.bottom.fillRect(0, 0, 8, 32 - 4);
        //
        //     if (!flip) {
        //         this.bars.bottom.setPosition(this.x + 32 + 4, this.y + 64);
        //         this.bars.bottom.rotation = Math.PI;
        //     } else {
        //         this.bars.bottom.setPosition(this.x + 32 - 4, this.y + 32 + 4);
        //     }
        //
        //     this.scene.addToLayer('ui', this.bars.bottom);
        // }
        // if (this.#config.connections.left) {
        //     this.bars.left = this.scene.make.graphics({ fillStyle: { alpha: 0.5, color: 0xff0000 } });
        //
        //     this.bars.left.fillRect(0, 0, 32 - 4, 8);
        //
        //     if (flip) {
        //         this.bars.left.setPosition(this.x + 32 - 4, this.y + 32 + 4);
        //         this.bars.left.rotation = Math.PI;
        //     } else {
        //         this.bars.left.setPosition(this.x, this.y + 32 - 4);
        //     }
        //
        //     this.scene.addToLayer('ui', this.bars.left);
        // }
    }

    update(...args) {
        super.update(...args);
        // this.scene.debugOut([this.bar.x, this.bar.y, this.x, this.y]);
        //this.bar.scaleX -= 1 / 25;
        //if (this.bar.scaleX < 0) this.bar.scaleX = 1;
        if (this.bars.top) {
            this.bars.top.scaleY -= 1 / this.scene.game.loop.actualFps;
            if (this.bars.top.scaleY < 0) this.bars.top.scaleY = 1;
        }
        if (this.bars.right) {
            this.bars.right.scaleX -= 1 / this.scene.game.loop.actualFps;
            if (this.bars.right.scaleX < 0) this.bars.right.scaleX = 1;
        }
        if (this.bars.bottom) {
            this.bars.bottom.scaleY -= 1 / this.scene.game.loop.actualFps;
            if (this.bars.bottom.scaleY < 0) this.bars.bottom.scaleY = 1;
        }
        if (this.bars.left) {
            this.bars.left.scaleX -= 1 / this.scene.game.loop.actualFps;
            if (this.bars.left.scaleX < 0) this.bars.left.scaleX = 1;
        }
    }
}
