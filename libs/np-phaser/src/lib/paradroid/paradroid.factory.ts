import { Utils } from '../sprites/paradroid/utils';
import { CParadroidModes, EFlow, EParadroidDifficulty } from './paradroid.consts';
import {
    CParadroidShapeInfo,
    CParadroidTileInfo,
    EParadroidAccess,
    EParadroidTileType,
    getRowCount,
    getRowKeyByIndex,
} from './paradroid.tiles-and-shapes.definitions';
import {
    TParadroidFlowbar,
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
    tileSet: EParadroidTileType[];
}

const defaultOptions: TParadroidFactoryOptions = {
    rows: 12,
    columns: 10,
    shapeSize: 64,
    stretchFactor: 0, // put in # of straight tiles after each rnd tile to stretch out the level design
    tileSet: CParadroidModes[EParadroidDifficulty.Brutal].tileSet,
};

export class ParadroidFactory {
    #options: TParadroidFactoryOptions;
    #tileGrid: TParadroidTile[][] = [];
    #accessGrid: EParadroidAccess[][] = [];

    constructor(options?: TParadroidFactoryOptions) {
        this.#options = options ?? defaultOptions;
    }

    generateGrid() {
        let tileColumn: TParadroidTile[];
        this.#initializeAccessGrid();
        for (let col: number = 0, j: number = Math.trunc(this.#columns / 2); col < j; col++) {
            const tileSet = this.#adjustTileSetForColumn(col);
            tileColumn = this.#generateCol(col, tileSet);
            this.#tileGrid.push(tileColumn);
        }
        console.log(this.#tileGrid, this.#accessGrid);
        return this.#tileGrid;
    }

    #adjustTileSetForColumn(col: number) {
        return col % (this.#options.stretchFactor + 1) !== 0
            ? [EParadroidTileType.Empty, EParadroidTileType.Single]
            : this.#tileSet;
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
        this.#accessGrid = [];
        for (let i: number = 0, j: number = this.#columns; i < j; i++) {
            const accessGridCol: EParadroidAccess[] = [];
            for (let k: number = 0, l: number = this.#rows; k < l; k++) {
                accessGridCol.push(i === 0 ? EParadroidAccess.hasPath : EParadroidAccess.unset);
            }
            this.#accessGrid.push(accessGridCol);
        }
    }

    #generateCol(col: number, aTypeSet: EParadroidTileType[]): TParadroidTile[] {
        let currentrow: number;
        let tile: TParadroidTile;
        const result: TParadroidTile[] = [];
        currentrow = 0;
        while (currentrow < this.#rows) {
            tile = this.#generateTile(aTypeSet, col, currentrow);
            const rows = tile.incoming.bot ? 3 : tile.incoming.mid ? 2 : 1;
            currentrow += rows;
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
            col: tile.col + subCol,
            row: tile.row + subRow,
            x: subCol * this.#shapeSize + this.#shapeSize / 2 + tile.x,
            y: subRow * this.#shapeSize + this.#shapeSize / 2 + tile.y,
            ...subTileDef,
            flow: {},
        };
        this.#generateFlow(subTile);
        return subTile;
    }

    #generateFlow(subTile: TParadroidSubTile) {
        const info = CParadroidShapeInfo[subTile.shape];
        subTile.flow = {
            [EFlow.FromLeft]: info.input.left
                ? this.#generateFlowbar(subTile, EFlow.FromLeft, true, true, false)
                : undefined,
            [EFlow.FromTop]: info.input.top
                ? this.#generateFlowbar(subTile, EFlow.FromTop, true, false, true)
                : undefined,
            [EFlow.FromBottom]: info.input.bottom
                ? this.#generateFlowbar(subTile, EFlow.FromBottom, true, false, false)
                : undefined,
            [EFlow.ToTop]: info.output.top
                ? this.#generateFlowbar(subTile, EFlow.ToTop, false, false, true)
                : undefined,
            [EFlow.ToBottom]: info.output.bottom
                ? this.#generateFlowbar(subTile, EFlow.ToBottom, false, false, false)
                : undefined,
            [EFlow.ToRight]: info.output.right
                ? this.#generateFlowbar(subTile, EFlow.FromLeft, false, true, false)
                : undefined,
        };
    }

    #generateFlowbar(
        subTile: TParadroidSubTile,
        flow: EFlow,
        incoming: boolean,
        horizontal: boolean,
        top: boolean
    ): TParadroidFlowbar {
        let direction: number;
        const barWidMid: number = this.#shapeSize / 2;
        const barHeight = 8;
        const width = horizontal ? barWidMid : barHeight;
        const height = horizontal ? barHeight : barWidMid;
        let x = barWidMid;
        let y = barWidMid;

        if (horizontal) {
            x = incoming ? 0 : barWidMid;
            direction = incoming ? Utils.DIR_RIGHT : Utils.DIR_RIGHT;
        } else {
            y = top ? 0 : barWidMid;
            direction = top ? Utils.DIR_UP : Utils.DIR_DOWN;
        }
        x += subTile.x;
        y += subTile.y;
        return { subTile, x, y, flow, direction, incoming, top, horizontal, width, height };
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
}
