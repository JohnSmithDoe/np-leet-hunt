// noinspection JSSuspiciousNameCombination

import { EParadroidTileType } from './paradroid.tiles-and-shapes.definitions';
import { TParadroidMode } from './paradroid.types';

export enum EFlow {
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

export const CParadroidModes: { [difficulty: number]: TParadroidMode } = {
    [EParadroidDifficulty.Debug]: {
        tileSet: [
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
        ],
        changerRate: -7,
        autofireRate: -2,
    },
    [EParadroidDifficulty.Easy]: {
        tileSet: [
            EParadroidTileType.Empty,
            EParadroidTileType.Single,

            EParadroidTileType.UpDownExpand,
            EParadroidTileType.UpDownExpandDeadEnds,
            EParadroidTileType.UpDownCombine,
            EParadroidTileType.UpDownCombineDeadEnds,
        ],
        changerRate: -1,
        autofireRate: 10,
    },
    [EParadroidDifficulty.Normal]: {
        tileSet: [
            EParadroidTileType.Empty,
            EParadroidTileType.Single,

            EParadroidTileType.UpDownExpand,
            EParadroidTileType.UpDownExpandDeadEnds,
            EParadroidTileType.UpDownCombine,
            EParadroidTileType.UpDownCombineDeadEnds,

            EParadroidTileType.TrippleExpand,
            EParadroidTileType.TrippleExpandDeadEnds,
            EParadroidTileType.TrippleCombine,
        ],
        changerRate: 5,
        autofireRate: 5,
    },
    [EParadroidDifficulty.Hard]: {
        tileSet: [
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
        ],
        changerRate: -7,
        autofireRate: -2,
    },
    [EParadroidDifficulty.Brutal]: {
        tileSet: [
            EParadroidTileType.Empty,
            EParadroidTileType.Single,
            // EParadroidTileType.Deadend,

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
        ],
        changerRate: 15,
        autofireRate: 0,
    },
};
export const getOppositeFlow = (flow: EFlow): EFlow => {
    if (flow === EFlow.FromLeft) {
        return EFlow.ToRight;
    } else if (flow === EFlow.FromBottom) {
        return EFlow.ToTop;
    } else if (flow === EFlow.FromTop) {
        return EFlow.ToBottom;
    } else if (flow === EFlow.ToRight) {
        return EFlow.FromLeft;
    } else if (flow === EFlow.ToBottom) {
        return EFlow.FromTop;
    } else if (flow === EFlow.ToTop) {
        return EFlow.FromBottom;
    }
};

export const getOppositeOwner = (owner: EParadroidOwner): EParadroidOwner => {
    if (owner === EParadroidOwner.Player) {
        return EParadroidOwner.Droid;
    } else if (owner === EParadroidOwner.Droid) {
        return EParadroidOwner.Player;
    } else {
        return EParadroidOwner.Nobody;
    }
};
