import { NPScene } from '@shared/np-phaser';
import BoardPlugin from 'phaser4-rex-plugins/plugins/board-plugin';

export enum ETileType {
    none = 'empty',
    floor = 'floor',
    wall = 'wall',
    room = 'room',
    junction = 'junction',
}

/**
 * The vocabulary for world-content features placed by the post-carve decorator (RPG cluster C).
 *
 * A *feature* is a gameplay entity that sits on the `ChessLayer.features` band ON TOP of the unchanged
 * floor (it is NOT a tile type — `ETileType` stays a closed 5-value enum and the autotiler is untouched).
 * This whole enum is the rule vocabulary the rest of cluster C will build on; **only `'stairs-down'` is
 * wired in this slice** — the others (`stairs-up`/`trap`/`chest`/`key`) are declared here so later tasks
 * (#14 traps/chests/locked-doors, #16 boss rooms) extend the model rather than redefine it.
 */
export enum EFeatureKind {
    stairsDown = 'stairs-down', // the exit — reaching it completes the run (this slice)
    stairsUp = 'stairs-up', // reserved: descend-to-deeper / return (#14 step 4)
    trap = 'trap', // reserved: stepped-on hazard (#14 step 1)
    chest = 'chest', // reserved: openable loot container (#14)
    key = 'key', // reserved: opens a locked door (#14 step 3, needs the region graph)
}

/**
 * The role a room plays, tagged by the decorator after the carve (RPG cluster C). Rule vocabulary for the
 * rest of the cluster; **only `'entrance'` (the start room) and `'exit'` (the stairs room) are meaningful
 * in this slice** — `treasure`/`shop`/`boss` are reserved for the adjacency-graph-driven special rooms of
 * #14/#16. Every room is `normal` until the decorator promotes it.
 */
export enum ERoomKind {
    entrance = 'entrance', // the start room (player spawn) — this slice
    exit = 'exit', // holds the exit stairs — this slice
    normal = 'normal', // an ordinary room (the default)
    treasure = 'treasure', // reserved: dead-end loot room (#14)
    shop = 'shop', // reserved: merchant room (cluster D)
    boss = 'boss', // reserved: guardian room (#16)
}

/**
 * The state of a door / junction (RPG cluster C). Today a junction is a plain `#open: boolean`; this enum
 * is the richer state the locked-door machine of #14 will move it to. **Nothing in this slice writes it**
 * — it is declared so the locked-door work extends a named vocabulary instead of inventing one. `locked`
 * is the one that will set a blocker so rex A\* routes around it until the matching `key` is used.
 */
export enum EDoorState {
    open = 'open',
    closed = 'closed',
    locked = 'locked', // reserved: requires a key; blocks pathing until opened (#14)
}

/**
 * The single source of truth for the rex-Board `z` discriminator.
 *
 * The board's `z` axis is not a height — it is overloaded as a *category* of chess so that
 * `addChess`/`tileXYZToChess`/`moveChess`/`getRandomEmptyTileXYInRange` can tell walls, doors,
 * items, features and actors apart on the same tile. These values were previously scattered as
 * raw literals (`'walls'`/`'objects'`/`1`) across five files; centralising them here removes the
 * silent-collision hazard (two bands accidentally sharing a value) the moment a new layer lands.
 *
 * To add a new gameplay layer, add ONE line here (and a matching honest getter on the board/level).
 */
export const ChessLayer = {
    walls: 'walls', // wall tiles (blockers)
    objects: 'objects', // doors / junctions
    items: 'items', // reserved: dropped loot / chests / keys (future task)
    features: 'features', // reserved: traps / stairs (future task)
    mob: 1, // actors (player + enemies) — numeric to match the existing placement
} as const;
export type ChessLayerValue = (typeof ChessLayer)[keyof typeof ChessLayer];

export interface TDungeonTile {
    type: ETileType;
    // The position in the dungeon grid
    x: number;
    y: number;
    // For each open position in the dungeon, the index of the connected region that that tile is a part of.
    region: number;
}

export interface TDungeonOptions {
    width: number;
    height: number;
    roomTries?: number;
    roomArea?: number;
    /// Increasing this allows rooms to be larger.
    roomExtraSize?: number;
    /// The inverse chance of adding a connector between two regions that have
    /// already been joined. Increasing this leads to more loosely connected
    /// dungeons. (oneIn(X))
    extraConnectorChance?: number;
    straightenPercentage?: number;
    seed?: string; // random seed
}

export interface SceneWithBoard {
    rexBoard: BoardPlugin; // Declare scene property 'rexBoard' as BoardPlugin type
}

export type NPSceneWithBoard = NPScene & SceneWithBoard;
