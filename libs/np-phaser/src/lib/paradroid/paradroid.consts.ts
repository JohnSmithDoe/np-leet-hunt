// noinspection JSSuspiciousNameCombination

import { EParadroidTileType } from './paradroid.tiles-and-shapes.definitions';
import { TParadroidMode } from './paradroid.types';

export enum EFlowbarFlow {
    FromTop,
    FromBottom,
    FromLeft,
    ToTop,
    ToBottom,
    ToRight,
}

export enum EFlowbarState {
    Deactive,
    Activating,
    Active,
    Deactivating,
}

export enum EParadroidSpecialFX {
    Combine,
    Changer,
    Autofire,
}

export enum EParadroidDifficulty {
    Debug,
    Easy,
    Normal,
    Hard,
    Brutal,
}

export enum EParadroidOwner {
    Player,
    Droid,
    Nobody,
}

const CDebugTileSet: EParadroidTileType[] = [
    EParadroidTileType.Empty,
    EParadroidTileType.Single,
    EParadroidTileType.Single,
    EParadroidTileType.Single,
    EParadroidTileType.Single,
    EParadroidTileType.Single,
    EParadroidTileType.UpDownExpand,
    EParadroidTileType.UpDownExpandDeadEnds,
    EParadroidTileType.UpDownCombine,
    EParadroidTileType.UpDownCombineDeadEnds,

    EParadroidTileType.DoubleTopExpand,
    EParadroidTileType.DoubleTopExpandDeadEnds,
    EParadroidTileType.DoubleBottomExpand,
    EParadroidTileType.DoubleBottomExpandDeadEnds,
    EParadroidTileType.DoubleTopCombine,
    EParadroidTileType.DoubleBottomCombine,

    EParadroidTileType.TrippleExpand,
    EParadroidTileType.TrippleExpandDeadEnds,
    EParadroidTileType.TrippleCombine,
];
const CSimpleTileSet: EParadroidTileType[] = [
    EParadroidTileType.Empty,
    EParadroidTileType.Single,

    EParadroidTileType.UpDownExpand,
    EParadroidTileType.UpDownExpandDeadEnds,
    EParadroidTileType.UpDownCombine,
    EParadroidTileType.UpDownCombineDeadEnds,
];
const CMediumTileSet: EParadroidTileType[] = [
    EParadroidTileType.Empty,
    EParadroidTileType.Single,

    EParadroidTileType.UpDownExpand,
    EParadroidTileType.UpDownExpandDeadEnds,
    EParadroidTileType.UpDownCombine,
    EParadroidTileType.UpDownCombineDeadEnds,

    EParadroidTileType.TrippleExpand,
    EParadroidTileType.TrippleExpandDeadEnds,
    EParadroidTileType.TrippleCombine,
];
const CHardTileSet: EParadroidTileType[] = [
    EParadroidTileType.Empty,
    EParadroidTileType.Single,

    EParadroidTileType.UpDownExpand,
    EParadroidTileType.UpDownExpandDeadEnds,
    EParadroidTileType.UpDownCombine,
    EParadroidTileType.UpDownCombineDeadEnds,

    EParadroidTileType.DoubleTopExpand,
    EParadroidTileType.DoubleTopExpandDeadEnds,
    EParadroidTileType.DoubleBottomExpand,
    EParadroidTileType.DoubleBottomExpandDeadEnds,
    EParadroidTileType.DoubleTopCombine,
    EParadroidTileType.DoubleBottomCombine,

    EParadroidTileType.TrippleExpand,
    EParadroidTileType.TrippleExpandDeadEnds,
    EParadroidTileType.TrippleCombine,
];
const CCrazyTileSet: EParadroidTileType[] = [
    EParadroidTileType.Empty,
    EParadroidTileType.Single,
    EParadroidTileType.Deadend,

    EParadroidTileType.UpDownExpand,
    EParadroidTileType.UpDownExpandDeadEnds,
    EParadroidTileType.UpDownCombine,
    EParadroidTileType.UpDownCombineDeadEnds,

    EParadroidTileType.DoubleTopExpand,
    EParadroidTileType.DoubleTopExpandDeadEnds,
    EParadroidTileType.DoubleBottomExpand,
    EParadroidTileType.DoubleBottomExpandDeadEnds,
    EParadroidTileType.DoubleTopCombine,
    EParadroidTileType.DoubleBottomCombine,

    EParadroidTileType.TrippleExpand,
    EParadroidTileType.TrippleExpandDeadEnds,
    EParadroidTileType.TrippleCombine,
];
export const CParadroidModes: { [difficulty: number]: TParadroidMode } = {
    [EParadroidDifficulty.Debug]: {
        tileSet: CDebugTileSet,
        changerRate: -7,
        autofireRate: -2,
    },
    [EParadroidDifficulty.Easy]: {
        tileSet: CSimpleTileSet,
        changerRate: -1,
        autofireRate: 10,
    },
    [EParadroidDifficulty.Normal]: {
        tileSet: CMediumTileSet,
        changerRate: 5,
        autofireRate: 5,
    },
    [EParadroidDifficulty.Hard]: {
        tileSet: CHardTileSet,
        changerRate: -7,
        autofireRate: -2,
    },
    [EParadroidDifficulty.Brutal]: {
        tileSet: CCrazyTileSet,
        changerRate: 15,
        autofireRate: 0,
    },
};
