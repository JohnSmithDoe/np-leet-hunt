import { EFlow } from '../paradroid.consts';
import { EParadroidAccess, EParadroidShape, EParadroidTileType } from '../paradroid.tiles-and-shapes.definitions';
import { TParadroidTileDefinition } from '../paradroid.types';
import { ParadroidShape } from './paradroid.shape';
import { ParadroidTileGrid, TParadroidAccessGridCol } from './paradroid.tilegrid';

export class ParadroidTile {
    shapes: ParadroidShape[] = [];

    public static getAccessInfoByIndex(
        info: TParadroidTileDefinition,
        incoming: boolean,
        index: number
    ): EParadroidAccess {
        let result: EParadroidAccess;
        if (index === 0) {
            result = incoming ? info.incoming.top.access : info.outgoing.top.access;
        } else if (index === 1) {
            result = incoming ? info.incoming.mid?.access : info.outgoing.mid?.access;
        } else {
            result = incoming ? info.incoming.bot?.access : info.outgoing.bot?.access;
        }
        return result ?? EParadroidAccess.unset;
    }

    constructor(
        public tileGrid: ParadroidTileGrid,
        public pos: Phaser.Types.Math.Vector2Like,
        public tileType: EParadroidTileType,
        public info: TParadroidTileDefinition,
        public col: number,
        public row: number
    ) {
        this.info = info;
        this.generateSubTiles();
    }

    private generateSubTile(row: number, col: number, shape?: EParadroidShape): void {
        const pos: Phaser.Types.Math.Vector2Like = this.getShapePosition(row, col);
        row += this.row;
        col = this.col * 2 + col;
        if (col < this.tileGrid.columns && row < this.tileGrid.rows) {
            shape ??= EParadroidShape.Empty;
            const subTile: ParadroidShape = new ParadroidShape(pos, this, shape, row, col);
            this.shapes.push(subTile);
            // this.addChild(subTile);
        }
    }

    private generateSubTiles(): void {
        this.generateSubTile(0, 0, this.info.incoming.top.shape);
        this.generateSubTile(1, 0, this.info.incoming.mid?.shape);
        this.generateSubTile(2, 0, this.info.incoming.bot?.shape);

        this.generateSubTile(0, 1, this.info.outgoing.top.shape);
        this.generateSubTile(1, 1, this.info.outgoing.mid?.shape);
        this.generateSubTile(2, 1, this.info.outgoing.bot?.shape);
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
        const rows = this.info.incoming.bot ? 3 : this.info.incoming.mid ? 2 : 1;
        for (let i: number = 0, j: number = rows; i < j; i++) {
            if (col && nextCol) {
                col[row + i] = ParadroidTile.getAccessInfoByIndex(this.info, true, i);
                nextCol[row + i] = ParadroidTile.getAccessInfoByIndex(this.info, false, i);
            }
        }
        return row + rows;
    }

    activateFlow(row: number, flow: EFlow): void {
        const shape = this.getShape(0, row);
        shape?.activateBar(flow);
    }

    deactivateFlow(row: number, flow: EFlow): void {
        const shape = this.getShape(0, row);
        shape?.deactivateBar(flow);
    }

    getShape(col: number, row: number) {
        return this.shapes.find((shape: ParadroidShape) => shape.row === row && shape.col === col);
    }

    canActivate(row: number, flow: EFlow) {
        const shape = this.getShape(0, row);
        return !!shape?.canActivate(flow);
    }

    canDeActivate(row: number, flow: EFlow): boolean {
        const shape = this.getShape(0, row);
        return !!shape?.canDeActivate(flow);
    }
}
