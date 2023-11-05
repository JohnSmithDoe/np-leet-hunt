import {
    EFlowFrom,
    EFlowTo,
    EParadroidAccess,
    EParadroidOwner,
    EParadroidShape,
    EParadroidTileType,
} from './paradroid.consts';

export type TParadroidPlayer = EParadroidOwner.Player | EParadroidOwner.Droid;

export interface TParadroidShape {
    flows: { from: EFlowFrom; to: EFlowTo }[];
}

export interface TParadroidPath {
    subTile: TParadroidSubTile;
    from: EFlowFrom;
    to: EFlowTo;
    owner: EParadroidOwner;
    fx: 'none' | 'fx-autofire' | 'fx-changer';
    state: 'active' | 'none';
    next: TParadroidPath[];
    prev: TParadroidPath[];
}

export interface TParadroidSubTileDefinition {
    shape: EParadroidShape;
    access: EParadroidAccess;
}
export interface TParadroidSubTile extends TParadroidSubTileDefinition {
    tile: TParadroidTile;
    col: number;
    row: number;
    paths: TParadroidPath[];
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
