import { Utils } from '../sprites/paradroid/utils';
import { CParadroidModes, EFlow, EParadroidDifficulty, EParadroidOwner } from './paradroid.consts';
import { ParadroidFlowbar } from './paradroid.flowbar';
import { TParadroidAccessGridCol } from './paradroid.tilegrid';
import {
    CParadroidTileInfo,
    EParadroidAccess,
    EParadroidTileType,
    getRowAccessByIndex,
    getRowKeyByIndex,
    getRowsFromDefinition,
    isCombineShape,
    isEmptyShape,
    isExpandShape,
} from './paradroid.tiles-and-shapes.definitions';
import { TParadroidSubTile, TParadroidTile, TParadroidTileDefinition } from './paradroid.types';

export class ParadroidFactory {
    private rows = 12;
    private columns = 12;
    private shapeSize = 64;
    private tileSet: EParadroidTileType[] = CParadroidModes[EParadroidDifficulty.Brutal].tileSet;

    tileGrid: TParadroidTile[][] = [];
    private accessGrid: EParadroidAccess[][] = [];
    private owner: EParadroidOwner = EParadroidOwner.Player;

    generateGrid(): void {
        let tileColumn: TParadroidTile[];
        this.#initializeAccessGrid();
        for (let col: number = 0, j: number = Math.trunc(this.columns / 2); col < j; col++) {
            tileColumn = this.genertateNewColumn(col);
            this.tileGrid.push(tileColumn);
        }
        console.log(this.tileGrid, this.accessGrid);
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
    #initializeAccessGrid() {
        this.accessGrid = [];
        for (let i: number = 0, j: number = this.columns; i < j; i++) {
            const accessGridCol: TParadroidAccessGridCol = [];
            for (let k: number = 0, l: number = this.rows; k < l; k++) {
                accessGridCol.push(i === 0 ? EParadroidAccess.hasPath : EParadroidAccess.unset);
            }
            this.accessGrid.push(accessGridCol);
        }
    }

    #generateCol(col: number, aTypeSet: EParadroidTileType[]): TParadroidTile[] {
        let currentrow: number;
        let tile: TParadroidTile;
        const result: TParadroidTile[] = [];
        currentrow = 0;
        while (currentrow < this.rows) {
            tile = this.#generateTile(aTypeSet, col, currentrow);
            const rows = tile.incoming.bot ? 3 : tile.incoming.mid ? 2 : 1;
            currentrow += rows;
            result.push(tile);
        }
        return result;
    }

    #generateTile(aTileTypeSet: EParadroidTileType[], col: number, row: number): TParadroidTile {
        const type = this.getRandomTileType(aTileTypeSet, this.accessGrid[col], row);
        // Col multiplied by 2 for the tileColumn shapes included in the tile.
        const pos = {
            x: col * (2 * this.shapeSize),
            y: row * this.shapeSize,
        };
        const info = CParadroidTileInfo[type];
        const result: TParadroidTile = { ...pos, ...info, type, col, row, subTiles: [] };
        this.#generateSubTiles(result);
        return result;
    }

    /**
     * Returns the next row index that needs to be filled
     */
    #generateSubTiles(tile: TParadroidTile) {
        const accessCol = this.accessGrid[tile.col];
        const nextAccessCol = this.accessGrid[tile.col + 1];
        const rows = getRowsFromDefinition(tile);
        for (let i = 0, j = rows; i < j; i++) {
            tile.subTiles.push({
                tile,
                col: tile.col,
                row: tile.row + i,
                ...this.getSubTilePosition(tile, i, 0),
                access: getRowAccessByIndex(tile, true, i),
                shape: tile.incoming[getRowKeyByIndex(i)].shape,
            });
            tile.subTiles.push({
                tile,
                col: tile.col + 1,
                row: tile.row + i,
                ...this.getSubTilePosition(tile, i, 1),
                access: getRowAccessByIndex(tile, false, i),
                shape: tile.outgoing[getRowKeyByIndex(i)].shape,
            });
            nextAccessCol[tile.row + i] = getRowAccessByIndex(tile, false, i);
            accessCol[tile.row + i] = getRowAccessByIndex(tile, true, i);
        }
    }

    private getSubTilePosition(tile: TParadroidTile, row: number, col: number): Phaser.Types.Math.Vector2Like {
        return {
            x: col * this.shapeSize + this.shapeSize / 2 + tile.x,
            y: row * this.shapeSize + this.shapeSize / 2 + tile.y,
        };
    }

    private isFitting(type: EParadroidTileType, col: TParadroidAccessGridCol, row: number): boolean {
        const info = CParadroidTileInfo[type];
        const rows = getRowsFromDefinition(info);
        let result: boolean = row + rows <= this.rows;
        if (result) {
            for (let i: number = 0, j: number = rows; i < j; i++) {
                result =
                    result &&
                    (col[row + i] === EParadroidAccess.unset || getRowAccessByIndex(info, true, i) === col[row + i]); // + 1
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

    /**
     * Returns the next row index that needs to be filled
     */
    fillColumn(
        info: TParadroidTileDefinition,
        col: TParadroidAccessGridCol,
        nextCol: TParadroidAccessGridCol,
        row: number
    ): number {
        const rows = getRowsFromDefinition(info);
        for (let i = 0, j = rows; i < j; i++) {
            if (col && nextCol) {
                col[row + i] = getRowAccessByIndex(info, true, i);
                nextCol[row + i] = getRowAccessByIndex(info, false, i);
            }
        }
        return row + rows;
    }

    private genertateNewColumn(col: number) {
        if (col % 1 !== 0) {
            // && this.difficulty < EParadroidDifficulty.Hard
            return this.#generateCol(col, [EParadroidTileType.Empty, EParadroidTileType.Single]);
        } else {
            return this.#generateCol(col, this.tileSet);
        }
    }

    // TODO combine with update flow
    updatePathInfoOnSubTile(subTile: TParadroidSubTile): void {
        subTile.pathInfo.autofires = subTile.isAutofire ? 1 : 0;
        subTile.pathInfo.changers = subTile.isChanger ? 1 : 0;
        subTile.pathInfo.cost = 0;
        subTile.bars.forEach((bar: ParadroidFlowbar): void => {
            if (bar.incoming) {
                const last = this.getNextSubTile(subTile, bar.flow);
                if (last) {
                    subTile.pathInfo.changers += last.pathInfo.changers;
                    subTile.pathInfo.autofires += last.pathInfo.autofires;

                    if (isCombineShape(subTile.shape)) {
                        subTile.pathInfo.cost += last.pathInfo.cost;
                    } else if (isExpandShape(subTile.shape)) {
                        const rows = subTile.tile.incoming.bot ? 3 : subTile.tile.incoming.mid ? 2 : 1;
                        subTile.pathInfo.cost = last.pathInfo.cost / rows;
                    } else {
                        subTile.pathInfo.cost = last.pathInfo.cost;
                    }
                    if (subTile.outgoingOwner !== EParadroidOwner.Nobody && subTile.pathInfo.autofires === 0) {
                        subTile.pathInfo.activatedBy = Utils.mergeArrays(
                            subTile.pathInfo.activatedBy,
                            last.pathInfo.activatedBy
                        );
                    } else {
                        subTile.pathInfo.activatedBy = [];
                    }
                } else {
                    subTile.pathInfo.cost = Math.pow(2, this.columns / 2);
                    subTile.pathInfo.activatedBy = [subTile.row];
                }
            }
        });
        if (subTile.outgoingOwner === EParadroidOwner.Nobody) {
            subTile.pathInfo.activatedBy = [];
        }
    }

    /**
     * Iterate the first column and update the path info from there
     */
    private updatePathInfo(minCol: number): void {
        const combines: TParadroidSubTile[] = [];
        const others: TParadroidSubTile[] = [];
        for (let col: number = minCol, j: number = this.columns; col < j; col++) {
            // first update all expanding shapes and collect combining and other shapes during iteration
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const subTile = this.getSubTile(col, row);
                if (isExpandShape(subTile.shape)) {
                    this.updatePathInfoOnSubTile(subTile);
                } else if (isCombineShape(subTile.shape)) {
                    combines.push(subTile);
                } else {
                    others.push(subTile);
                }
            }
            // then update the flow of the not combining shapes
            others.forEach((subTile): void => {
                this.updatePathInfoOnSubTile(subTile);
            });
            // after every other shape is updated -> update the combining shapes
            combines.forEach((subTile): void => {
                this.updatePathInfoOnSubTile(subTile);
            });
        }
    }

    generateGridStructure(): void {
        // initialize all shapes before the structure is created
        for (let col: number = 1, j: number = this.columns; col < j; col++) {
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const subTile = this.getSubTile(col, row);
                this.initBefore(subTile);
            }
            this.updatePathInfo(col - 1);
        }
        // the first col is allways a fromLeft toRight Flow only shape (initialize GridAccess takes care of that)
        // so set the owner of the shape to the tile grid owner
        for (let row: number = 0, l: number = this.rows; row < l; row++) {
            const shape = this.getSubTile(0, row);
            this.updateIncomingFlow(shape, EFlow.FromLeft, this.owner);
        }

        // then walk through the shapes and update their owner accordingly
        for (let col: number = 0, j: number = this.columns; col < j; col++) {
            const combines: TParadroidSubTile[] = [];
            const others: TParadroidSubTile[] = [];
            // first update all expanding shapes and collect combining and other shapes during iteration
            for (let row: number = 0, l: number = this.rows; row < l; row++) {
                const subTile = this.getSubTile(col, row);
                if (isExpandShape(subTile.shape)) {
                    this.updateOutgoingFlow(subTile);
                } else if (isCombineShape(subTile.shape)) {
                    combines.push(subTile);
                } else {
                    others.push(subTile);
                }
            }
            // then update the flow of the not combining shapes
            others.forEach((subTile): void => {
                this.updateOutgoingFlow(subTile);
            });
            // after every other shape is updated update the combining shapes
            combines.forEach((subTile): void => {
                this.updateOutgoingFlow(subTile);
            });
        }
        // then initialize all SpecialFX that need to be created after the structure is created
        for (let col = 1, j = this.columns; col < j; col++) {
            for (let row = 0, l = this.rows; row < l; row++) {
                const subTile = this.getSubTile(col, row);
                this.initAfter(subTile);
                this.updatePathInfo(col - 1);
            }
        }
    }

    initBefore(subTile: TParadroidSubTile): void {
        console.log(subTile);

        // if (
        //     !isEmptyShape(subTile.shape) &&
        //     subTile.shape !== EParadroidShape.Deadend &&
        //     !subTile.specialFX
        // ) {
        //     if (!subTile.shapeInfo.input.bottom) {
        //         if (Utils.rngPercentageHit(CParadroidModes[this.tileGrid.difficulty].changerRate)) {
        //             subTile.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Changer);
        //             subTile.isChanger = true;
        //             subTile.pathInfo.changers++;
        //             // this.addChild(this.specialFX);
        //         }
        //     }
        // }
    }

    updateOutgoingFlow(subTile: TParadroidSubTile): void {
        if (!isEmptyShape(subTile.shape)) {
            const incomingOwners: boolean[] = [];
            let incomingOwner: EParadroidOwner = EParadroidOwner.Nobody;
            subTile.bars.forEach((bar: ParadroidFlowbar): void => {
                if (bar.incoming) {
                    incomingOwner = bar.owner;
                    incomingOwners[incomingOwner] = true;
                }
            });
            const incomingOwnerCount: number = Object.keys(incomingOwners).length;
            if (incomingOwnerCount === 0) {
                throw new Error('Incoming Flow is not set');
            } else if (incomingOwnerCount >= 2) {
                incomingOwner = EParadroidOwner.Nobody;
            }
            subTile.outgoingOwner = subTile.isChanger
                ? ParadroidFlowbar.getOppositeOwner(incomingOwner)
                : incomingOwner;
            subTile.isBlocked = subTile.outgoingOwner === EParadroidOwner.Nobody;
            subTile.bars.forEach((bar: ParadroidFlowbar): void => {
                if (!bar.incoming) {
                    bar.setOwner(subTile.outgoingOwner);
                    const next = this.getNextSubTile(subTile, bar.flow);
                    if (next) {
                        this.updateIncomingFlow(
                            next,
                            ParadroidFlowbar.getOppositeFlow(bar.flow),
                            subTile.outgoingOwner
                        );
                    }
                }
            });
        }
    }

    getNextSubTile(subTile: TParadroidSubTile, flow: EFlow): TParadroidSubTile {
        let result: TParadroidSubTile;
        if (flow === EFlow.ToTop) {
            result = this.getSubTile(subTile.col, subTile.row - 1);
        } else if (flow === EFlow.ToBottom) {
            result = this.getSubTile(subTile.col, subTile.row + 1);
        } else if (flow === EFlow.ToRight) {
            result = this.getSubTile(subTile.col + 1, subTile.row);
        } else if (flow === EFlow.FromTop) {
            result = this.getSubTile(subTile.col, subTile.row - 1);
        } else if (flow === EFlow.FromBottom) {
            result = this.getSubTile(subTile.col, subTile.row + 1);
        } else if (flow === EFlow.FromLeft) {
            result = this.getSubTile(subTile.col - 1, subTile.row);
        }
        return result;
    }

    updateIncomingFlow(subTile: TParadroidSubTile, incomingFlow: EFlow, owner: EParadroidOwner): void {
        subTile.bars[incomingFlow].setOwner(owner);
    }

    initAfter(subTile: TParadroidSubTile): void {
        const shape = subTile.shape;
        console.log(shape);
        // if (!isEmptyShape(shape) && shape !== EParadroidShape.Deadend && !subTile.specialFX) {
        //     if (!subTile.shapeInfo.input.bottom) {
        //         if (Utils.rngPercentageHit(CParadroidModes[this.difficulty].autofireRate)) {
        //             if (subTile.pathInfo.changers === 0) {
        //                 if (subTile.pathInfo.autofires === 0) {
        //                     // subTile.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Autofire);
        //                     // subTile.isAutofire = true;
        //                     // this.addChild(this.specialFX);
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    getTile(col: number, row: number): TParadroidTile {
        let result: TParadroidTile;
        let currentRow: number = 0;
        const tileCol: number = Math.trunc(col / 2);
        const columTiles = this.tileGrid[tileCol];
        if (columTiles) {
            for (let i: number = 0, j: number = columTiles.length; i < j; i++) {
                const tile = columTiles[i];
                const rows = tile.incoming.bot ? 3 : tile.incoming.mid ? 2 : 1;
                currentRow += rows;
                if (currentRow > row) {
                    result = tile;
                    break;
                }
            }
        }
        return result;
    }

    getSubTile(col: number, row: number) {
        const tile = this.getTile(col, row);
        const shapeCol = col - tile.col === 0 ? tile.incoming : tile.outgoing;
        return row - tile.row === 2 ? shapeCol.bot : row - tile.row === 1 ? shapeCol.mid : shapeCol.top;
    }
}
