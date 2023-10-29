import { EParadroidOwner } from './paradroid.consts';
import { ParadroidFlowbar } from './paradroid.flowbar';
import { EParadroidAccess, EParadroidShape, EParadroidTileType } from './paradroid.tiles-and-shapes.definitions';

export type TParadroidPlayer = EParadroidOwner.Player | EParadroidOwner.Droid;

export interface TParadroidGatesIn {
    left: boolean;
    top: boolean;
    bottom: boolean;
}

export interface TParadroidGatesOut {
    right: boolean;
    top: boolean;
    bottom: boolean;
}

export interface TParadroidShape {
    input: TParadroidGatesIn;
    output: TParadroidGatesOut;
}

export interface TParadroidSubTile extends Phaser.Types.Math.Vector2Like, TParadroidSubTileDefinition {
    tile?: TParadroidTile;
    pathInfo?: {
        activatedBy: number[];
        cost: number;
        changers: number;
        autofires: number;
    };
    bars?: ParadroidFlowbar[];
    isAutofire?: boolean;
    isBlocked?: boolean;
    isChanger?: boolean;
    col?: number;
    row?: number;
    outgoingOwner?: EParadroidOwner;
}

export interface TParadroidSubTileDefinition {
    shape: EParadroidShape;
    access: EParadroidAccess;
}

export interface TParadroidTileDefinition {
    incoming: {
        top: TParadroidSubTileDefinition;
        mid?: TParadroidSubTileDefinition;
        bot?: TParadroidSubTileDefinition;
    };
    outgoing: {
        top: TParadroidSubTileDefinition;
        mid?: TParadroidSubTileDefinition;
        bot?: TParadroidSubTileDefinition;
    };
}

/**
 * A tile is a 2 x 3 grid of shapes.
 * The first column is named incoming
 * The second column is named outgoing, according to the flow from left to right
 * The first row is named top. Then mid, then bot.
 */
export interface TParadroidTile extends Phaser.Types.Math.Vector2Like, TParadroidTileDefinition {
    col: number;
    row: number;
    type: EParadroidTileType;
    subTiles: TParadroidSubTile[];
}

export interface TParadroidMode {
    tileSet: EParadroidTileType[];
    changerRate: number;
    autofireRate: number;
}
