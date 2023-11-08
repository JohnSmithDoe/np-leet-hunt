import { TParadroidMode, TParadroidShape, TParadroidTileDefinition } from './paradroid.types';

export enum EFlowFrom {
    Top = 'from-top',
    Bottom = 'from-bot',
    Left = 'from-left',
    Mid = 'from-mid',
}

export enum EFlowTo {
    Top = 'to-top',
    Bottom = 'to-bot',
    Right = 'to-right',
    Mid = 'to-mid',
}

export enum EParadroidOwner {
    Player = 'player',
    Droid = 'droid',
}

export enum EParadroidAccess {
    hasPath,
    isBlocked,
    unset,
}

export enum EParadroidShape {
    Empty,
    IShape,
    Deadend,

    LShapeLeftUp,
    LShapeLeftDown,
    LShapeUpRight,
    LShapeDownRight,

    TShapeDownCombine,
    TShapeDownExpand,
    TShapeUpCombine,
    TShapeUpExpand,
    TShapeUpDownExpand,
    TShapeUpDownCombine,

    XShapeExpand,
    XShapeCombine,
}

export enum EParadroidTileType {
    Empty,
    Single,
    Deadend,

    DoubleTopExpand,
    DoubleTopExpandDeadEnds,
    DoubleBottomExpand,
    DoubleBottomExpandDeadEnds,

    DoubleTopCombine,
    DoubleBottomCombine,

    UpDownExpand,
    UpDownExpandDeadEnds,
    UpDownCombine,
    UpDownCombineDeadEnds,

    TrippleExpand,
    TrippleExpandDeadEnds,
    TrippleCombine,
}

export enum EParadroidDifficulty {
    Debug,
    Easy,
    Normal,
    Hard,
    Brutal,
}
export const CParadroidShapeInfo: Record<EParadroidShape, TParadroidShape> = {
    [EParadroidShape.Empty]: {
        flows: [],
    },
    [EParadroidShape.Deadend]: {
        flows: [{ from: EFlowFrom.Left, to: EFlowTo.Mid }],
    },
    [EParadroidShape.IShape]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },

    [EParadroidShape.LShapeLeftDown]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
        ],
    },
    [EParadroidShape.LShapeLeftUp]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
        ],
    },

    [EParadroidShape.LShapeUpRight]: {
        flows: [
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
    [EParadroidShape.LShapeDownRight]: {
        flows: [
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },

    [EParadroidShape.TShapeUpCombine]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
    [EParadroidShape.TShapeDownCombine]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },

    [EParadroidShape.TShapeUpExpand]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
        ],
    },
    [EParadroidShape.TShapeDownExpand]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
        ],
    },

    [EParadroidShape.TShapeUpDownCombine]: {
        flows: [
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
    [EParadroidShape.TShapeUpDownExpand]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
        ],
    },

    [EParadroidShape.XShapeExpand]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
        ],
    },
    [EParadroidShape.XShapeCombine]: {
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
};

export const CParadroidTileInfo: Record<EParadroidTileType, TParadroidTileDefinition> = {
    //
    //
    //
    [EParadroidTileType.Empty]: {
        incoming: {
            top: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
        },
        outgoing: {
            top: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
        },
    },
    // -------
    //
    //
    [EParadroidTileType.Single]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
    },
    // ---X
    //
    //
    [EParadroidTileType.Deadend]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.Deadend, access: EParadroidAccess.isBlocked },
        },
    },
    // ----|---
    //     |---
    //
    [EParadroidTileType.DoubleTopExpand]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
        },
        outgoing: {
            top: { shape: EParadroidShape.TShapeDownExpand, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.LShapeDownRight, access: EParadroidAccess.hasPath },
        },
    },
    // ----|---
    // --X |---
    //
    [EParadroidTileType.DoubleTopExpandDeadEnds]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.TShapeDownExpand, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.LShapeDownRight, access: EParadroidAccess.hasPath },
        },
    },
    //     |---
    // ----|---
    //
    [EParadroidTileType.DoubleBottomExpand]: {
        incoming: {
            top: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeUpRight, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.TShapeUpExpand, access: EParadroidAccess.hasPath },
        },
    },
    // --X |---
    // ----|---
    //
    [EParadroidTileType.DoubleBottomExpandDeadEnds]: {
        incoming: {
            top: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeUpRight, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.TShapeUpExpand, access: EParadroidAccess.hasPath },
        },
    },
    // ----|----
    // ----|  X
    //
    [EParadroidTileType.DoubleTopCombine]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.TShapeDownCombine, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.LShapeLeftUp, access: EParadroidAccess.isBlocked },
        },
    },
    // ----|   X
    // ----|----
    //
    [EParadroidTileType.DoubleBottomCombine]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeLeftDown, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.TShapeUpCombine, access: EParadroidAccess.hasPath },
        },
    },
    //     |----
    // ----|   X
    //     |----
    [EParadroidTileType.UpDownExpand]: {
        incoming: {
            top: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeUpRight, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.TShapeUpDownExpand, access: EParadroidAccess.isBlocked },
            bot: { shape: EParadroidShape.LShapeDownRight, access: EParadroidAccess.hasPath },
        },
    },
    // --X |----
    // ----|   X
    // --X |----
    [EParadroidTileType.UpDownExpandDeadEnds]: {
        incoming: {
            top: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeUpRight, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.TShapeUpDownExpand, access: EParadroidAccess.isBlocked },
            bot: { shape: EParadroidShape.LShapeDownRight, access: EParadroidAccess.hasPath },
        },
    },
    // ----|   X
    //     |----
    // ----|   X
    [EParadroidTileType.UpDownCombine]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
            bot: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeLeftDown, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.TShapeUpDownCombine, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.LShapeLeftUp, access: EParadroidAccess.isBlocked },
        },
    },
    // ----|   X
    // --X |----
    // ----|   X
    [EParadroidTileType.UpDownCombineDeadEnds]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeLeftDown, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.TShapeUpDownCombine, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.LShapeLeftUp, access: EParadroidAccess.isBlocked },
        },
    },
    //     |---
    // ----|---
    //     |---
    [EParadroidTileType.TrippleExpand]: {
        incoming: {
            top: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.Empty, access: EParadroidAccess.isBlocked },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeUpRight, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.XShapeExpand, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.LShapeDownRight, access: EParadroidAccess.hasPath },
        },
    },
    // --X |---
    // ----|---
    // --X |---
    [EParadroidTileType.TrippleExpandDeadEnds]: {
        incoming: {
            top: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.Deadend, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeUpRight, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.XShapeExpand, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.LShapeDownRight, access: EParadroidAccess.hasPath },
        },
    },
    // ----|   X
    // ----|----
    // ----|   X
    [EParadroidTileType.TrippleCombine]: {
        incoming: {
            top: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            mid: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.IShape, access: EParadroidAccess.hasPath },
        },
        outgoing: {
            top: { shape: EParadroidShape.LShapeLeftDown, access: EParadroidAccess.isBlocked },
            mid: { shape: EParadroidShape.XShapeCombine, access: EParadroidAccess.hasPath },
            bot: { shape: EParadroidShape.LShapeLeftUp, access: EParadroidAccess.isBlocked },
        },
    },
};

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
            // EParadroidTileType.Deadend, // comment out for better grid?

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
