import { EventEmitter } from '@angular/core';

import { Utils } from '../../sprites/paradroid/utils';
import { CParadroidModes, EFlow, EParadroidDifficulty } from '../paradroid.consts';
import { CParadroidTileInfo, EParadroidAccess, EParadroidTileType } from '../paradroid.tiles-and-shapes.definitions';
import { TParadroidPlayer, TParadroidTileDefinition } from '../paradroid.types';
import { ParadroidButton } from './paradroid.button';
import { ParadroidEngine } from './paradroid.engine';
import { ParadroidShape } from './paradroid.shape';
import { ParadroidTile } from './paradroid.tile';

export type TParadroidAccessGridCol = EParadroidAccess[];
type TParadroidAccessGrid = TParadroidAccessGridCol[];

type TParadroidTileCol = ParadroidTile[];
type TParadroidTileGrid = TParadroidTileCol[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CParadroidImages: string[] = [
    // CImages.Paradroid.FlowBar_Droid_Incoming,
    // CImages.Paradroid.FlowBar_Droid_Outgoing,
    // CImages.Paradroid.FlowBar_Player_Incoming,
    // CImages.Paradroid.FlowBar_Player_Outgoing,
    //
    // CImages.Paradroid.SpecialFx_Autofire,
    // CImages.Paradroid.SpecialFx_Changer,
    // CImages.Paradroid.SpecialFx_Combine,
    //
    // CImages.Paradroid.EmptyNode,
    // CImages.Paradroid.DNode,
    // CImages.Paradroid.INode,
    // CImages.Paradroid.LNode,
    // CImages.Paradroid.TNode,
    // CImages.Paradroid.XNode,
];
const CParadroidShotImages: string[] = [
    // CImages.Paradroid.Shot_player, CImages.Paradroid.Shot_droid
];

export class ParadroidTileGrid {
    private tileGrid: TParadroidTileGrid = [];
    private accessGrid: TParadroidAccessGrid = [];
    shots = [];
    onFlowReachedMiddleRow: EventEmitter<ParadroidShape> = new EventEmitter<ParadroidShape>();
    activeRows: number[];
    buttonContainer = [];
    children: ParadroidTile[];

    constructor(
        public engine: ParadroidEngine,
        public owner: TParadroidPlayer,
        public difficulty: EParadroidDifficulty,
        public columns: number,
        public rows: number,
        public shapeSize: number
    ) {
        this.buttonContainer = [];
        this.shots = [];
        // create shots
        for (let i: number = 0; i < this.rows; i++) {
            const pos: Phaser.Types.Math.Vector2Like = { x: 0, y: i * this.shapeSize + 16 };
            const shot = { x: pos.x, y: pos.y, image: CParadroidShotImages[owner] };
            this.shots.push(shot);
        }
        // Create Button Column for this grid
        for (let i: number = 0; i < this.rows; i++) {
            const pos: Phaser.Types.Math.Vector2Like = { x: 0, y: i * this.shapeSize + 16 };
            const paradroidButton: ParadroidButton = new ParadroidButton(pos, engine, i, owner);
            this.buttonContainer.push(paradroidButton);
        }
    }

    createTileGrid(): void {
        this.generateGridAccess();
        this.generateGrid();
        this.generateGridStructure();
        this.generateBoard();
    }

    // check each row of the last column
    // true if there are more than this.rows / 2 shapes that get activated
    // tests if the grid is interesting enough
    checkGridStructure(): boolean {
        let canBeActivated: number = 0;
        const lastColumn: number = this.columns - 1;
        for (let row: number = 0, j: number = this.rows; row < j; row++) {
            const shape: ParadroidShape = this.getShape(lastColumn, row);
            if (shape && shape.pathInfo.activatedBy.length) {
                canBeActivated++;
            }
        }
        return canBeActivated > this.rows / 2;
    }

    ready(): void {
        //
    }

    // adds the generated tileGrid sprites
    private generateBoard(): void {
        this.children = [];
        for (let col = 0, colmax = this.tileGrid.length; col < colmax; col++) {
            const colum = this.tileGrid[col];
            for (let row = 0, rowmax = colum.length; row < rowmax; row++) {
                const tile = colum[row];
                this.children.push(tile);
            }
        }
    }

    /**
     * Create a Grid with path access in the first column. The rest is unset
     * - X X X
     * - X X X
     * - X X X
     * - X X X
     *
     * @return
     */
    private generateGridAccess(): void {
        this.accessGrid = [];
        for (let i: number = 0, j: number = this.columns; i < j; i++) {
            const accessGridCol: TParadroidAccessGridCol = [];
            for (let k: number = 0, l: number = this.rows; k < l; k++) {
                if (i === 0) {
                    accessGridCol.push(EParadroidAccess.hasPath);
                } else {
                    accessGridCol.push(EParadroidAccess.unset);
                }
            }
            this.accessGrid.push(accessGridCol);
        }
    }

    /**
     * Col multiplied by 2 for the tileColumn shapes included in the tile.
     *
     * @param col
     * @param row
     * @return
     */
    private getTilePosition(col: number, row: number): Phaser.Types.Math.Vector2Like {
        return {
            x: col * (2 * this.shapeSize),
            y: row * this.shapeSize,
        };
    }

    private addTileColumn(column: TParadroidTileCol): void {
        this.tileGrid.push(column);
    }

    private getTileColum(col: number): TParadroidTileCol {
        return this.tileGrid[col];
    }

    getAccessGrid(): TParadroidAccessGrid {
        return this.accessGrid;
    }

    getTile(col: number, row: number): ParadroidTile {
        let result: ParadroidTile;
        let currentRow: number = 0;
        const tileCol: number = Math.trunc(col / 2);
        const columTiles: TParadroidTileCol = this.getTileColum(tileCol);
        if (columTiles) {
            for (let i: number = 0, j: number = columTiles.length; i < j; i++) {
                const tile: ParadroidTile = columTiles[i];
                const rows = tile.info.incoming.bot ? 3 : tile.info.incoming.mid ? 2 : 1;
                currentRow += rows;
                if (currentRow > row) {
                    result = tile;
                    break;
                }
            }
        }
        return result;
    }

    getShape(col: number, row: number): ParadroidShape {
        const tile: ParadroidTile = this.getTile(col, row);
        return tile ? tile.getShape(col, row) : null;
    }

    activateFlow(col: number, row: number, flow?: EFlow): void {
        flow = flow || EFlow.FromLeft;
        const tile: ParadroidTile = this.getTile(col, row);
        if (tile.canActivate(row, flow)) {
            tile.activateFlow(row, flow);
        }
    }

    deactivateFlow(col: number, row: number, flow?: EFlow): void {
        flow = flow || EFlow.FromLeft;
        const tile: ParadroidTile = this.getTile(col, row);
        if (tile.canDeActivate(row, flow)) {
            tile.deactivateFlow(row, flow);
        }
    }

    // <editor-fold desc="*** Generate the Grid ***">

    reset(): void {
        this.tileGrid = [];
        this.activeRows = [];
    }

    private generateGrid(): void {
        this.reset();
        let aGrid: TParadroidAccessGrid;
        let tiles: ParadroidTile[];
        // eslint-disable-next-line prefer-const
        aGrid = this.getAccessGrid();
        for (let col: number = 0, j: number = aGrid.length / 2; col < j; col++) {
            if (col % 3 !== 0 && this.difficulty < EParadroidDifficulty.Hard) {
                tiles = this.generateCol(col, [EParadroidTileType.Empty, EParadroidTileType.Single]);
            } else {
                tiles = this.generateCol(col, CParadroidModes[this.difficulty].tileSet);
            }
            this.addTileColumn(tiles);
        }
    }

    private isFitting(type: EParadroidTileType, col: TParadroidAccessGridCol, row: number): boolean {
        const info = CParadroidTileInfo[type];
        const rows = info.incoming.bot ? 3 : info.incoming.mid ? 2 : 1;
        let result: boolean = row + rows <= this.rows;
        if (result) {
            for (let i: number = 0, j: number = rows; i < j; i++) {
                result =
                    result &&
                    (col[row + i] === EParadroidAccess.unset ||
                        ParadroidTile.getAccessInfoByIndex(info, true, i) === col[row + i]); // + 1
            }
        }
        return result;
    }

    private getSuitableTileTypes(
        aTileSet: EParadroidTileType[],
        col: TParadroidAccessGridCol,
        row: number
    ): EParadroidTileType[] {
        let tileType: EParadroidTileType;
        const suitableTypes: EParadroidTileType[] = [];
        for (let i: number = 0, j: number = aTileSet.length; i < j; i++) {
            tileType = aTileSet[i];
            if (this.isFitting(tileType, col, row)) {
                suitableTypes.push(tileType);
            }
        }
        return suitableTypes;
    }

    private getRandomTileType(
        aTileSet: EParadroidTileType[],
        col: TParadroidAccessGridCol,
        row: number
    ): EParadroidTileType {
        const suitableTypes: EParadroidTileType[] = this.getSuitableTileTypes(aTileSet, col, row);
        return Utils.rngElement(suitableTypes);
    }

    private generateTile(aTileTypeSet: EParadroidTileType[], col: number, row: number): ParadroidTile {
        const aGrid: TParadroidAccessGrid = this.getAccessGrid();
        const randomTileType: EParadroidTileType = this.getRandomTileType(aTileTypeSet, aGrid[col], row);
        const pos = this.getTilePosition(col, row);
        const info: TParadroidTileDefinition = CParadroidTileInfo[randomTileType];
        const result: ParadroidTile = new ParadroidTile(this, pos, randomTileType, info, col, row);
        result.fillColumn(aGrid[col], aGrid[col + 1], row);
        return result;
    }

    private generateCol(col: number, aTypeSet: EParadroidTileType[]): TParadroidTileCol {
        let currentrow: number;
        let tile: ParadroidTile;
        const result: TParadroidTileCol = [];
        currentrow = 0;
        while (currentrow < this.rows) {
            tile = this.generateTile(aTypeSet, col, currentrow);
            const rows = tile.info.incoming.bot ? 3 : tile.info.incoming.mid ? 2 : 1;
            currentrow += rows;
            result.push(tile);
        }
        return result;
    }

    /**
     * Iterate the first column and update the path info from there
     */
    private updatePathInfo(minCol: number): void {
        const combines: ParadroidShape[] = [];
        const others: ParadroidShape[] = [];
        for (let col: number = minCol, j: number = this.columns; col < j; col++) {
            // first update all expanding shapes and collect combining and other shapes during iteration
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const shape: ParadroidShape = this.getShape(col, row);
                if (shape.isExpandShape()) {
                    shape.updatePathInfo();
                } else if (shape.isCombineShape()) {
                    combines.push(shape);
                } else {
                    others.push(shape);
                }
            }
            // then update the flow of the not combining shapes
            others.forEach((shape: ParadroidShape): void => {
                shape.updatePathInfo();
            });
            // after every other shape is updated update the combining shapes
            combines.forEach((shape: ParadroidShape): void => {
                shape.updatePathInfo();
            });
        }
    }

    private generateGridStructure(): void {
        // initialize all shapes before the structure is created
        for (let col: number = 1, j: number = this.columns; col < j; col++) {
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const shape: ParadroidShape = this.getShape(col, row);
                shape.initBefore();
            }
            this.updatePathInfo(col - 1);
        }
        // the first col is allways a fromLeft toRight Flow only shape (initialize GridAccess takes care of that)
        // so set the owner of the shape to the tile grid owner
        for (let row: number = 0, l: number = this.rows; row < l; row++) {
            const shape: ParadroidShape = this.getShape(0, row);
            shape.updateIncomingFlow(EFlow.FromLeft, this.owner);
        }

        // then walk through the shapes and update their owner accordingly
        for (let col: number = 0, j: number = this.columns; col < j; col++) {
            const combines: ParadroidShape[] = [];
            const others: ParadroidShape[] = [];
            // first update all expanding shapes and collect combining and other shapes during iteration
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const shape: ParadroidShape = this.getShape(col, row);
                if (shape.isExpandShape()) {
                    shape.updateOutgoingFlow();
                } else if (shape.isCombineShape()) {
                    combines.push(shape);
                } else {
                    others.push(shape);
                }
            }
            // then update the flow of the not combining shapes
            others.forEach((shape: ParadroidShape): void => {
                shape.updateOutgoingFlow();
            });
            // after every other shape is updated update the combining shapes
            combines.forEach((shape: ParadroidShape): void => {
                shape.updateOutgoingFlow();
            });
        }
        // then initialize all SpecialFX that need to be created after the structure is created
        for (let col: number = 1, j: number = this.columns; col < j; col++) {
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const shape: ParadroidShape = this.getShape(col, row);
                shape.initAfter();
                this.updatePathInfo(col - 1);
            }
        }
    }

    // </editor-fold>

    getNextShape(shape: ParadroidShape, flow: EFlow): ParadroidShape {
        let result: ParadroidShape;
        if (flow === EFlow.ToTop) {
            result = this.getShape(shape.col, shape.row - 1);
        } else if (flow === EFlow.ToBottom) {
            result = this.getShape(shape.col, shape.row + 1);
        } else if (flow === EFlow.ToRight) {
            result = this.getShape(shape.col + 1, shape.row);
        } else if (flow === EFlow.FromTop) {
            result = this.getShape(shape.col, shape.row - 1);
        } else if (flow === EFlow.FromBottom) {
            result = this.getShape(shape.col, shape.row + 1);
        } else if (flow === EFlow.FromLeft) {
            result = this.getShape(shape.col - 1, shape.row);
        }
        return result;
    }
}
