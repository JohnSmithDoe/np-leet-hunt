import { rngPercentageHit, Utils } from '../sprites/paradroid/utils';
import { CParadroidModes, EParadroidDifficulty, isNextFlow } from './paradroid.consts';
import {
    CParadroidShapeInfo,
    CParadroidTileInfo,
    EFlowFrom,
    EFlowTo,
    EParadroidAccess,
    EParadroidOwner,
    EParadroidShape,
    EParadroidTileType,
    getRowCount,
    getRowKeyByIndex,
    isCombineShape,
} from './paradroid.tiles-and-shapes.definitions';
import {
    TParadroidPath,
    TParadroidSubTile,
    TParadroidSubTileDefinition,
    TParadroidTile,
    TParadroidTileDefinition,
} from './paradroid.types';

export interface TParadroidFactoryOptions {
    rows: number;
    columns: number;
    shapeSize: number;
    stretchFactor: number;
    changerRate: number;
    autoFireRate: number;
    tileSet: EParadroidTileType[];
}

const defaultOptions: TParadroidFactoryOptions = {
    rows: 12,
    columns: 10,
    shapeSize: 64,
    stretchFactor: 0, // put in # of straight tiles after each rnd tile to stretch out the level design
    autoFireRate: 110, // percentage chance 0 - 100
    changerRate: 110, // percentage chance 0 - 100
    tileSet: CParadroidModes[EParadroidDifficulty.Brutal].tileSet,
};

const hasCombineShapeOnPath = (path: TParadroidPath) =>
    isCombineShape(path.subTile.shape) ||
    path.next.reduce((hasCombine, p) => hasCombine || hasCombineShapeOnPath(p), false);

export class ParadroidFactory {
    #options: TParadroidFactoryOptions;
    #tileGrid: TParadroidTile[][] = [];
    #subTileGrid: TParadroidSubTile[][] = [];
    #paths: TParadroidPath[] = [];
    #accessGrid: EParadroidAccess[][] = [];

    constructor(options?: TParadroidFactoryOptions) {
        this.#options = options ?? defaultOptions;
    }

    generateGrid() {
        let tileColumn: TParadroidTile[];
        this.#initialize();
        for (let col: number = 0, j: number = Math.trunc(this.#columns / 2); col < j; col++) {
            const tileSet = this.#adjustTileSetForColumn(col);
            tileColumn = this.#generateCol(col, tileSet);
            this.#tileGrid.push(tileColumn);
        }
        this.#initializePaths();
        return this.#subTileGrid;
    }

    #adjustTileSetForColumn(col: number) {
        return col % (this.#options.stretchFactor + 1) !== 0
            ? [EParadroidTileType.Empty, EParadroidTileType.Single]
            : this.#tileSet;
    }

    #adjustPathFx(path: TParadroidPath) {
        if (path.from !== EFlowFrom.Left) return;
        if (path.subTile.shape !== EParadroidShape.IShape) return;
        const prev = this.#getSubTile(path.subTile.col - 1, path.subTile.row);
        if (prev && prev.paths.find(p => p.fx !== 'none')) return;
        if (rngPercentageHit(this.#options.changerRate) && !hasCombineShapeOnPath(path)) {
            path.fx = 'fx-changer';
        } else if (rngPercentageHit(this.#options.autoFireRate)) {
            path.fx = 'fx-autofire';
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
    #initialize() {
        this.#tileGrid = [];
        this.#accessGrid = [];
        this.#subTileGrid = [];
        this.#paths = [];
        for (let i = 0; i < this.#columns; i++) {
            this.#accessGrid[i] = [];
            this.#subTileGrid[i] = [];
            for (let j = 0; j < this.#rows; j++) {
                this.#accessGrid[i][j] = i === 0 ? EParadroidAccess.hasPath : EParadroidAccess.unset;
                this.#subTileGrid[i][j] = undefined;
            }
        }
    }

    #initializePaths() {
        // set all next first
        for (const path of this.#paths) {
            const nextSubTile = this.#getNextSubTile(path.subTile, path.to);
            path.next = this.#paths.filter(p => p.subTile === nextSubTile && isNextFlow(path.to, p.from));
        }
        // set all other attributes afterward
        for (const path of this.#paths) {
            path.prev = this.#paths.filter(p => p.next.find(p2 => p2 === path));
            this.#adjustPathFx(path);
        }

        // const starts = this.#paths.filter(p => p.subTile.col === 0 && p.flowFrom === EFlowFrom.Left).shift();
    }

    #generateCol(col: number, aTypeSet: EParadroidTileType[]): TParadroidTile[] {
        let currentrow: number;
        let tile: TParadroidTile;
        const result: TParadroidTile[] = [];
        currentrow = 0;
        while (currentrow < this.#rows) {
            tile = this.#generateTile(aTypeSet, col, currentrow);
            currentrow += getRowCount(tile);
            result.push(tile);
        }
        return result;
    }

    #generateTile(aTileTypeSet: EParadroidTileType[], col: number, row: number): TParadroidTile {
        const type = this.#getRandomTileType(aTileTypeSet, this.#accessGrid[col], row);
        // Col multiplied by 2 for the tileColumn shapes included in the tile.
        const pos = {
            x: col * (2 * this.#shapeSize),
            y: row * this.#shapeSize,
        };
        const info = CParadroidTileInfo[type];
        const tile: TParadroidTile = { ...pos, ...info, type, col, row, subTiles: [] };
        const accessCol = this.#accessGrid[tile.col];
        const nextAccessCol = this.#accessGrid[tile.col + 1];
        const rows = getRowCount(tile);
        for (let i = 0, j = rows; i < j; i++) {
            tile.subTiles.push(this.#generateSubTile(tile, tile.incoming[getRowKeyByIndex(i)], i, 0));
            tile.subTiles.push(this.#generateSubTile(tile, tile.outgoing[getRowKeyByIndex(i)], i, 1));
            accessCol[tile.row + i] = tile.incoming[getRowKeyByIndex(i)].access;
            nextAccessCol[tile.row + i] = tile.outgoing[getRowKeyByIndex(i)].access;
        }
        return tile;
    }

    #generateSubTile(
        tile: TParadroidTile,
        subTileDef: TParadroidSubTileDefinition,
        subRow: number,
        subCol: number
    ): TParadroidSubTile {
        const subTile: TParadroidSubTile = {
            tile,
            col: tile.col * 2 + subCol,
            row: tile.row + subRow,
            x: subCol * this.#shapeSize + this.#shapeSize / 2 + tile.x,
            y: subRow * this.#shapeSize + this.#shapeSize / 2 + tile.y,
            ...subTileDef,
            paths: [],
        };
        this.#generateSubTilePaths(subTile);
        this.#subTileGrid[subTile.col][subTile.row] = subTile;
        return subTile;
    }

    #generateSubTilePaths(subTile: TParadroidSubTile) {
        const info = CParadroidShapeInfo[subTile.shape];
        for (const flow of Object.values(info.flows)) {
            const path: TParadroidPath = {
                subTile,
                ...flow,
                fx: 'none',
                owner: EParadroidOwner.Nobody,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                next: [],
                prev: [],
            };
            subTile.paths.push(path);
        }
        this.#paths.push(...subTile.paths);
    }

    get #columns() {
        return this.#options.columns;
    }

    get #rows() {
        return this.#options.rows;
    }

    get #shapeSize() {
        return this.#options.shapeSize;
    }

    get #tileSet() {
        return this.#options.tileSet;
    }

    #getSubTile(col: number, row: number) {
        if (col < 0 || row < 0 || col >= this.#subTileGrid.length || row >= this.#subTileGrid[col].length) return null;
        return this.#subTileGrid[col][row];
    }

    #getNextSubTile(subTile: TParadroidSubTile, flow: EFlowTo) {
        let result: TParadroidSubTile;
        if (flow === EFlowTo.Top) {
            result = this.#getSubTile(subTile.col, subTile.row - 1);
        } else if (flow === EFlowTo.Bottom) {
            result = this.#getSubTile(subTile.col, subTile.row + 1);
        } else if (flow === EFlowTo.Right) {
            result = this.#getSubTile(subTile.col + 1, subTile.row);
        } else if (flow === EFlowTo.Mid) {
            result = subTile;
        }
        return result;
    }

    #getRandomTileType = (aTileSet: EParadroidTileType[], col: EParadroidAccess[], row: number): EParadroidTileType => {
        const isFitting = (info: TParadroidTileDefinition): boolean => {
            const rows = getRowCount(info);
            let result: boolean = row + rows <= col.length;
            if (result) {
                for (let i: number = 0, j: number = rows; i < j; i++) {
                    const nextAccess = col[row + i];
                    const rowAccessByIndex = info.incoming[getRowKeyByIndex(i)].access;
                    result &&= nextAccess === EParadroidAccess.unset || nextAccess === rowAccessByIndex;
                }
            }
            return result;
        };
        const suitableTypes = aTileSet.filter(tileType => isFitting(CParadroidTileInfo[tileType]));
        return Utils.rngElement(suitableTypes);
    };
}
