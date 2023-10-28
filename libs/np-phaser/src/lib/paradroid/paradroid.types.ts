import { EParadroidOwner } from './paradroid.consts';
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

export interface TParadroidShapeInfo {
    ins: TParadroidGatesIn;
    outs: TParadroidGatesOut;
}

export interface TParadroidTileShape extends Phaser.Types.Math.Vector2Like {
    shape: EParadroidShape;
    access: EParadroidAccess;
}

/**
 * A tile is a 2 x 3 grid of shapes.
 * The first column is named incoming
 * The second column is named outgoing, according to the flow from left to right
 * The first row is named top. Then mid, then bot.
 */
export interface TParadroidTile extends Phaser.Types.Math.Vector2Like {
    incoming: {
        top: TParadroidTileShape;
        mid?: TParadroidTileShape;
        bot?: TParadroidTileShape;
    };
    outgoing: {
        top: TParadroidTileShape;
        mid?: TParadroidTileShape;
        bot?: TParadroidTileShape;
    };
}

export interface TParadroidMode {
    tileSet: EParadroidTileType[];
    changerRate: number;
    autofireRate: number;
}
