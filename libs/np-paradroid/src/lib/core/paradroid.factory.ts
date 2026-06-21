import { DuelBoardParams } from '@shared/np-config';
import { NPRng } from '@shared/np-library';

import {
    CParadroidShapeInfo,
    CParadroidTileInfo,
    CParadroidTileSets,
    EFlowTo,
    EParadroidAccess,
    EParadroidOwner,
    EParadroidShape,
    EParadroidTileType,
} from '../@types/paradroid.consts';
import {
    TParadroidPath,
    TParadroidPlayer,
    TParadroidSubTile,
    TParadroidSubTileDefinition,
    TParadroidTile,
    TParadroidTileDefinition,
} from '../@types/paradroid.types';
import { getRowCount, getRowKeyByIndex, isCombineShape, isNextFlow, oppositeOwner } from '../@types/paradroid.utils';

export interface TParadroidFactoryOptions {
    rows: number;
    columns: number;
    tileWidth: number;
    tileHeight: number;
    stretchFactor: number;
    changerRate: number;
    autoFireRate: number;
    tileSet: EParadroidTileType[];
    owner: TParadroidPlayer;
    /// Optional. Provide one for reproducible generation (tests, debugging).
    /// Omit it to get a fresh layout each time the factory is built.
    seed?: string;
}

/// The fixed board geometry of a duel — same at every difficulty (only the tileSet palette and the
/// fx rates vary). Exported so the app can assemble factory options alongside `Balance.duelBoardParams`.
export const DUEL_DIMS = {
    rows: 8,
    columns: 8, // only use even values
    tileWidth: 48,
    tileHeight: 48,
    stretchFactor: 0, // # of straight tiles after each rnd tile to stretch out the level design
} as const;

/// Assemble factory options from the central numeric board knobs (np-state `Balance.duelBoardParams`)
/// plus this mode's own tileSet palette (`CParadroidTileSets`). Pass `overrides` to tweak individual
/// fields, e.g. a fixed `seed` for reproducible generation.
export const paradroidFactoryOptions = (
    board: DuelBoardParams,
    tileSet: EParadroidTileType[],
    overrides: Partial<TParadroidFactoryOptions> = {}
): TParadroidFactoryOptions => ({
    ...DUEL_DIMS,
    tileSet,
    changerRate: board.changerRate, // percentage chance 0 - 100; <= 0 disables
    autoFireRate: board.autoFireRate, // percentage chance 0 - 100; <= 0 disables
    owner: EParadroidOwner.Player,
    // seed intentionally omitted: each factory gets a fresh layout (see constructor).
    ...overrides,
});

/// A self-contained default (brutal palette + rates) so the factory and its spec need no np-state at
/// runtime. The live game injects options resolved from `Balance` (see the app's run-conductor).
export const defaultFactoryOptions: TParadroidFactoryOptions = paradroidFactoryOptions(
    { changerRate: 15, autoFireRate: 0 },
    CParadroidTileSets.brutal
);

const hasCombineShapeOnPath = (path: TParadroidPath): boolean =>
    isCombineShape(path.subTile.shape) ||
    path.next.reduce((hasCombine, p) => hasCombine || hasCombineShapeOnPath(p), false);

export class ParadroidFactory {
    #options: TParadroidFactoryOptions;
    #tileGrid: TParadroidSubTile[][] = [];
    #paths: TParadroidPath[] = [];
    #accessGrid: EParadroidAccess[][] = [];
    #rng: NPRng;

    constructor(options: TParadroidFactoryOptions) {
        this.#options = options;
        // An explicit seed makes generation reproducible; without one we pick a
        // fresh seed per factory so e.g. the grid-selection "Re-Roll" yields a new layout.
        this.#rng = new NPRng(options.seed ?? new Date().toISOString());
    }

    generateGrid(owner: EParadroidOwner = EParadroidOwner.Player) {
        this.#options.owner = owner;
        let isValid = false;
        let tryouts = 0;
        // Each attempt keeps drawing from the seeded RNG (we deliberately do NOT
        // rewind it between attempts), so an invalid layout is followed by a
        // different one. Generation is reproducible per seed yet varied on retry.
        do {
            this.#initialize();
            this.#generateColumns();
            isValid = this.#validateGrid();
            if (++tryouts > 100) throw new Error('Could not generate grid');
        } while (!isValid);

        this.#initializePaths();
        return this.#tileGrid;
    }

    /// Fills the left half column by column; #generateTile mirrors each tile
    /// into the right half, so we only iterate to the midpoint.
    #generateColumns() {
        const midpoint = Math.trunc(this.columns / 2);
        for (let col = 0; col < midpoint; col++) {
            this.#generateCol(col, this.#adjustTileSetForColumn(col));
        }
    }

    /// A board is winnable when at least half of the final column carries a
    /// flow that reaches the right edge.
    #validateGrid() {
        const lastCol = this.#tileGrid[this.#tileGrid.length - 1];
        const rightBoundFlows = lastCol.filter(subTile => subTile.paths.some(p => p.to === EFlowTo.Right)).length;
        return rightBoundFlows >= lastCol.length / 2;
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
        if (this.#rng.percentageHit(this.#options.changerRate) && !hasCombineShapeOnPath(path)) {
            path.fx = 'fx-changer';
            this.#applyFxChanger(path);
        } else if (this.#rng.percentageHit(this.#options.autoFireRate)) {
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
        this.#accessGrid = [];
        this.#tileGrid = [];
        this.#paths = [];
        for (let i = 0; i < this.columns; i++) {
            this.#accessGrid[i] = [];
            this.#tileGrid[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.#accessGrid[i][j] = i === 0 ? EParadroidAccess.hasPath : EParadroidAccess.unset;
            }
        }
    }

    #initializePaths() {
        // next must be wired for every path before prev (prev is derived from it)
        // and before fx (fx walks downstream via next).
        this.#paths.forEach(path => this.#linkNext(path));
        this.#paths.forEach(path => this.#linkPrev(path));
        this.#paths.forEach(path => this.#adjustPathFx(path));
    }

    #linkNext(path: TParadroidPath) {
        const nextSubTile = this.#getNextSubTile(path.subTile, path.to);
        path.next = this.#paths.filter(p => p.subTile === nextSubTile && isNextFlow(path.to, p.from));
    }

    #linkPrev(path: TParadroidPath) {
        path.prev = this.#paths.filter(p => p.next.includes(path));
    }

    // #generateTile writes each tile into #tileGrid, so we only walk the rows.
    #generateCol(col: number, aTypeSet: EParadroidTileType[]) {
        let row = 0;
        while (row < this.rows) {
            row += getRowCount(this.#generateTile(aTypeSet, col, row));
        }
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
            const rowKey = getRowKeyByIndex(i);
            const incoming = tile.incoming[rowKey];
            const outgoing = tile.outgoing[rowKey];
            if (!incoming || !outgoing) {
                throw new Error(`No sub tile definition for row '${rowKey}' of tile type '${type}'`);
            }
            tile.subTiles.push(this.#generateSubTile(tile, incoming, i, 0));
            tile.subTiles.push(this.#generateSubTile(tile, outgoing, i, 1));
            accessCol[tile.row + i] = incoming.access;
            nextAccessCol[tile.row + i] = outgoing.access;
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
        this.#tileGrid[subTile.col][subTile.row] = subTile;
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
                triggeredBy: [],
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
        if (col < 0 || row < 0 || col >= this.#tileGrid.length || row >= this.#tileGrid[col].length) return null;
        return this.#tileGrid[col][row];
    }

    #getNextSubTile(subTile: TParadroidSubTile, flow: EFlowTo) {
        let result: TParadroidSubTile | null = null;
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
                    // i < getRowCount(info) guarantees the row key exists on info.incoming
                    const rowAccessByIndex = info.incoming[getRowKeyByIndex(i)]!.access;
                    result &&= nextAccess === EParadroidAccess.unset || nextAccess === rowAccessByIndex;
                }
            }
            return result;
        };
        const suitableTypes = aTileSet.filter(tileType => isFitting(CParadroidTileInfo[tileType]));
        return this.#rng.item(suitableTypes);
    };
}
