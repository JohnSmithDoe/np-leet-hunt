import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

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

export class PixelDungeonInfoText extends Phaser.GameObjects.Text {
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
        const worldXY = engine.map.tilemap.tileToWorldXY(tile.x, tile.y);
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
