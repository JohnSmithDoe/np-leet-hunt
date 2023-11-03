import {
    EFlowFrom,
    EFlowTo,
    EParadroidAccess,
    EParadroidOwner,
    EParadroidShape,
    EParadroidTileType,
} from './paradroid.tiles-and-shapes.definitions';

export type TParadroidPlayer = EParadroidOwner.Player | EParadroidOwner.Droid;

export interface TParadroidShape {
    flows: { from: EFlowFrom; to: EFlowTo }[];
}

export interface TParadroidPath extends Phaser.Types.Math.Vector2Like {
    subTile: TParadroidSubTile;
    from: EFlowFrom;
    to: EFlowTo;
    width: number;
    height: number;
    owner: EParadroidOwner;
    fx: 'none' | 'fx-autofire' | 'fx-changer';
    next: TParadroidPath[];
    prev: TParadroidPath[];
}

export interface TParadroidSubTile extends Phaser.Types.Math.Vector2Like, TParadroidSubTileDefinition {
    tile: TParadroidTile;
    col: number;
    row: number;
    paths: TParadroidPath[];
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
