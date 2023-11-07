import { rngElement, rngPercentageHit } from '../sprites/paradroid/utils';
import {
    CParadroidModes,
    CParadroidShapeInfo,
    CParadroidTileInfo,
    EFlowTo,
    EParadroidAccess,
    EParadroidDifficulty,
    EParadroidOwner,
    EParadroidShape,
    EParadroidTileType,
} from './paradroid.consts';
import {
    TParadroidPath,
    TParadroidPlayer,
    TParadroidSubTile,
    TParadroidSubTileDefinition,
    TParadroidTile,
    TParadroidTileDefinition,
} from './paradroid.types';
import { getRowCount, getRowKeyByIndex, isCombineShape, isNextFlow, oppositeOwner } from './paradroid.utils';

export interface TParadroidFactoryOptions {
    rows: number;
    columns: number;
    tileWidth: number;
    tileHeight?: number;
    stretchFactor: number;
    changerRate: number;
    autoFireRate: number;
    tileSet: EParadroidTileType[];
    owner: TParadroidPlayer;
}

export const defaultFactoryOptions: TParadroidFactoryOptions = {
    rows: 8,
    columns: 12, // only use even values
    tileWidth: 64,
    tileHeight: 64,
    stretchFactor: 0, // put in # of straight tiles after each rnd tile to stretch out the level design
    autoFireRate: 10, // percentage chance 0 - 100
    changerRate: 50, // percentage chance 0 - 100
    tileSet: CParadroidModes[EParadroidDifficulty.Easy].tileSet,
    owner: EParadroidOwner.Player,
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

    constructor(options: TParadroidFactoryOptions) {
        this.#options = options;
    }

    generateGrid() {
        let isValid = false;
        let tryouts = 0;
        do {
            let tileColumn: TParadroidTile[];
            this.#initialize();
            for (let col: number = 0, j: number = Math.trunc(this.columns / 2); col < j; col++) {
                const tileSet = this.#adjustTileSetForColumn(col);
                tileColumn = this.#generateCol(col, tileSet);
                this.#tileGrid.push(tileColumn);
            }
            isValid = this.#validateGrid();
            tryouts++;
            if (tryouts > 100) throw new Error('Could not generate grid');
        } while (!isValid);

        this.#initializePaths();
        return this.#subTileGrid;
    }

    #validateGrid(minCount?: number) {
        const lastCol = this.#subTileGrid[this.#subTileGrid.length - 1];
        return (
            lastCol.reduce(
                (count, current) => (current.paths.find(p => p.to === EFlowTo.Right) ? count + 1 : count),
                0
            ) >= (minCount ?? lastCol.length / 2)
        );
    }

    #adjustTileSetForColumn(col: number) {
        return col % (this.#options.stretchFactor + 1) !== 0
            ? [EParadroidTileType.Empty, EParadroidTileType.Single]
            : this.#tileSet;
    }

    #adjustPathFx(path: TParadroidPath) {
        if (path.subTile.col === 0) return;
        if (path.to !== EFlowTo.Right) return;
        if (path.subTile.shape !== EParadroidShape.IShape) return;
        const prev = this.#getSubTile(path.subTile.col - 1, path.subTile.row);
        if (prev && prev.paths.find(p => p.fx !== 'none')) return;
        if (rngPercentageHit(this.#options.changerRate) && !hasCombineShapeOnPath(path)) {
            path.fx = 'fx-changer';
            this.#applyFxChanger(path);
        } else if (rngPercentageHit(this.#options.autoFireRate)) {
            path.fx = 'fx-autofire';
        }
    }

    #applyFxChanger(path: TParadroidPath) {
        path.owner = oppositeOwner(path.owner);
        path.next.forEach(p => this.#applyFxChanger(p));
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
        for (let i = 0; i < this.columns; i++) {
            this.#accessGrid[i] = [];
            this.#subTileGrid[i] = [];
            for (let j = 0; j < this.rows; j++) {
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
        while (currentrow < this.rows) {
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
            x: col * (2 * this.#tileWidth),
            y: row * this.#tileHeight,
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
            col: tile.col * 2 + subCol,
            row: tile.row + subRow,
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
                owner: this.#options.owner,
                fx: 'none',
                next: [],
                prev: [],
            };
            subTile.paths.push(path);
        }
        this.#paths.push(...subTile.paths);
    }

    get columns() {
        return this.#options.columns;
    }

    get rows() {
        return this.#options.rows;
    }

    get #tileWidth() {
        return this.#options.tileWidth;
    }

    get #tileHeight() {
        return this.#options.tileHeight;
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
        return rngElement(suitableTypes);
    };
}
