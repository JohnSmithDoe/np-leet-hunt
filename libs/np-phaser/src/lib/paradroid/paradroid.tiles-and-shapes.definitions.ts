import { TParadroidShapeInfo, TParadroidTile } from './paradroid.types';

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

export const CParadroidShapeInfo: Record<EParadroidShape, TParadroidShapeInfo> = {
    [EParadroidShape.Empty]: {
        ins: { left: false, bottom: false, top: false },
        outs: { right: false, bottom: false, top: false },
    },
    [EParadroidShape.Deadend]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: false, top: false },
    },
    [EParadroidShape.IShape]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.LShapeLeftDown]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: true, top: false },
    },
    [EParadroidShape.LShapeLeftUp]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: false, top: true },
    },

    [EParadroidShape.LShapeUpRight]: {
        ins: { left: false, bottom: true, top: false },
        outs: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.LShapeDownRight]: {
        ins: { left: false, bottom: false, top: true },
        outs: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.TShapeUpCombine]: {
        ins: { left: true, bottom: false, top: true },
        outs: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.TShapeDownCombine]: {
        ins: { left: true, bottom: true, top: false },
        outs: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.TShapeUpExpand]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: false, top: true },
    },
    [EParadroidShape.TShapeDownExpand]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: true, top: false },
    },

    [EParadroidShape.TShapeUpDownCombine]: {
        ins: { left: false, bottom: true, top: true },
        outs: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.TShapeUpDownExpand]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: true, top: true },
    },

    [EParadroidShape.XShapeExpand]: {
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: true, top: true },
    },
    [EParadroidShape.XShapeCombine]: {
        ins: { left: true, bottom: true, top: true },
        outs: { right: true, bottom: false, top: false },
    },
};

export const CParadroidTileInfo: Record<EParadroidTileType, TParadroidTile> = {
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
