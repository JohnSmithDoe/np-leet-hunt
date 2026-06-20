import { NPText } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';

export enum EMobInfoType {
    GainHealth,
    LoseHealth,
    Blocked,
    Doged,
}

const CMobInfoColors: Record<EMobInfoType, string> = {
    [EMobInfoType.GainHealth]: '#00FF00',
    [EMobInfoType.LoseHealth]: '#FF0000',
    [EMobInfoType.Blocked]: '#af641a',
    [EMobInfoType.Doged]: '#ece212',
};

export class PixelDungeonInfoText extends NPText {
    constructor(
        public engine: PixelDungeonEngine,
        tile: TileXYType,
        text: string | string[],
        type: EMobInfoType = EMobInfoType.GainHealth
    ) {
        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: 10,
            color: CMobInfoColors[type],
        };
        // mob tiles always lie within the tilemap bounds
        const worldXY = engine.level.tileToWorldXY(tile)!;
        super(engine.scene, worldXY.x + 8, worldXY.y, text, style);
        this.setOrigin(0.5);
        this.scene.tweens.add({
            targets: this,
            y: worldXY.y - 8,
            alpha: 0.3,
            ease: 'Power1',
            duration: 750,
            onComplete: () => {
                this.destroy(true);
            },
        });
    }
}
