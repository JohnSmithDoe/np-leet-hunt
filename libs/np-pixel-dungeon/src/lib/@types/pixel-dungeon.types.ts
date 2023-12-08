import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';

export enum ETileType {
    none = 'empty',
    floor = 'floor',
    wall = 'wall',
    room = 'room',
    junction = 'junction',
}

export enum EWallType {
    CORNER_BOTTOM_LEFT_OUTSIDE,
    CORNER_BOTTOM_RIGHT_OUTSIDE,
    CORNER_TOP_LEFT,
    CORNER_TOP_RIGHT_,
    CORNER_BOTTOM_RIGHT,
    CORNER_BOTTOM_LEFT,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
    STRAIGHT_VERT,
    STRAIGHT_HORIZ,
    TSHAPE_UP,
    TSHAPE_DOWN,
    TSHAPE_LEFT,
    TSHAPE_RIGHT,
    DEADEND_UP,
    DEADEND_DOWN,
    DEADEND_LEFT,
    DEADEND_RIGHT,
    CROSS,
}

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
