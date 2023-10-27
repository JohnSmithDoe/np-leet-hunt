// eslint-disable-next-line import/no-cycle
import { ParadroidShape } from './paradroid.shape';
// eslint-disable-next-line import/no-cycle
import { ParadroidTileGrid, TParadroidAccessGridCol } from './paradroid.tilegrid';
import {
    EFlowbarFlow,
    EParadroidShape,
    EParadroidShapeAccess,
    EParadroidTileType,
    TParadroidTileInfo,
} from './paradroid.types';

export class ParadroidTile {
    private subtiles: ParadroidShape[] = [];

    public static getAccessInfoByIndex(
        info: TParadroidTileInfo,
        incoming: boolean,
        index: number
    ): EParadroidShapeAccess {
        if (index === 0) {
            return incoming ? info.access.incoming.top : info.access.outgoing.top;
        } else if (index === 1) {
            return incoming ? info.access.incoming.mid : info.access.outgoing.mid;
        }
        return incoming ? info.access.incoming.bot : info.access.outgoing.bot;
    }

    constructor(
        public tileGrid: ParadroidTileGrid,
        private pos: Phaser.Types.Math.Vector2Like,
        private tileType: EParadroidTileType,
        public info: TParadroidTileInfo,
        public col: number,
        public row: number
    ) {
        this.info = info;
        this.generateSubTiles();
    }

    private generateSubTile(shape: EParadroidShape, row: number, col: number): void {
        const pos: Phaser.Types.Math.Vector2Like = this.getShapePosition(row, col);
        row += this.row;
        col = this.col * 2 + col;
        if (col < this.tileGrid.columns && row < this.tileGrid.rows) {
            const subTile: ParadroidShape = new ParadroidShape(pos, this, shape, row, col);
            this.subtiles.push(subTile);
            // this.addChild(subTile);
        }
    }

    private generateSubTiles(): void {
        this.generateSubTile(this.info.subgrid.incoming.top, 0, 0);
        this.generateSubTile(this.info.subgrid.incoming.mid, 1, 0);
        this.generateSubTile(this.info.subgrid.incoming.bot, 2, 0);

        this.generateSubTile(this.info.subgrid.outgoing.top, 0, 1);
        this.generateSubTile(this.info.subgrid.outgoing.mid, 1, 1);
        this.generateSubTile(this.info.subgrid.outgoing.bot, 2, 1);
    }

    private getShapePosition(row: number, col: number): Phaser.Types.Math.Vector2Like {
        return {
            x: col * this.tileGrid.shapeSize + this.tileGrid.shapeSize / 2,
            y: row * this.tileGrid.shapeSize + this.tileGrid.shapeSize / 2,
        };
    }

    /**
     * Returns the next row index that needs to be filled
     *
     * @param col
     * @param nextCol
     * @param row
     * @return
     */
    fillColumn(col: TParadroidAccessGridCol, nextCol: TParadroidAccessGridCol, row: number): number {
        for (let i: number = 0, j: number = this.info.rows; i < j; i++) {
            if (col && nextCol) {
                col[row + i] = ParadroidTile.getAccessInfoByIndex(this.info, true, i);
                nextCol[row + i] = ParadroidTile.getAccessInfoByIndex(this.info, false, i);
            }
        }
        return row + this.info.rows;
    }

    activateFlow(row: number, flow: EFlowbarFlow): void {
        const shape: ParadroidShape = this.getShape(0, row);
        shape.activateBar(flow);
    }

    deactivateFlow(row: number, flow: EFlowbarFlow): void {
        const shape: ParadroidShape = this.getShape(0, row);
        shape.deactivateBar(flow);
    }

    getShape(col: number, row: number): ParadroidShape {
        return this.subtiles.find((shape: ParadroidShape) => shape.row === row && shape.col === col);
    }

    canActivate(row: number, flow: EFlowbarFlow): boolean {
        const shape: ParadroidShape = this.getShape(0, row);
        return shape.canActivate(flow);
    }

    canDeActivate(row: number, flow: EFlowbarFlow): boolean {
        const shape: ParadroidShape = this.getShape(0, row);
        return shape.canDeActivate(flow);
    }
}
