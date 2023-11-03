import { TParadroidShape, TParadroidTileDefinition } from './paradroid.types';

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
    Player,
    Droid,
    Nobody,
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

export const CParadroidShapeInfo: Record<EParadroidShape, TParadroidShape> = {
    [EParadroidShape.Empty]: {
        input: { left: false, bottom: false, top: false },
        output: { right: false, bottom: false, top: false },
        flows: [],
    },
    [EParadroidShape.Deadend]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: false, top: false },
        flows: [{ from: EFlowFrom.Left, to: EFlowTo.Mid }],
    },
    [EParadroidShape.IShape]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: false, top: false },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },

    [EParadroidShape.LShapeLeftDown]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: true, top: false },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
        ],
    },
    [EParadroidShape.LShapeLeftUp]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: false, top: true },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
        ],
    },

    [EParadroidShape.LShapeUpRight]: {
        input: { left: false, bottom: true, top: false },
        output: { right: true, bottom: false, top: false },
        flows: [
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
    [EParadroidShape.LShapeDownRight]: {
        input: { left: false, bottom: false, top: true },
        output: { right: true, bottom: false, top: false },
        flows: [
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },

    [EParadroidShape.TShapeUpCombine]: {
        input: { left: true, bottom: false, top: true },
        output: { right: true, bottom: false, top: false },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
    [EParadroidShape.TShapeDownCombine]: {
        input: { left: true, bottom: true, top: false },
        output: { right: true, bottom: false, top: false },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },

    [EParadroidShape.TShapeUpExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: false, top: true },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
        ],
    },
    [EParadroidShape.TShapeDownExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: true, top: false },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
        ],
    },

    [EParadroidShape.TShapeUpDownCombine]: {
        input: { left: false, bottom: true, top: true },
        output: { right: true, bottom: false, top: false },
        flows: [
            { from: EFlowFrom.Bottom, to: EFlowTo.Mid },
            { from: EFlowFrom.Top, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
        ],
    },
    [EParadroidShape.TShapeUpDownExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: true, top: true },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
        ],
    },

    [EParadroidShape.XShapeExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: true, top: true },
        flows: [
            { from: EFlowFrom.Left, to: EFlowTo.Mid },
            { from: EFlowFrom.Mid, to: EFlowTo.Right },
            { from: EFlowFrom.Mid, to: EFlowTo.Bottom },
            { from: EFlowFrom.Mid, to: EFlowTo.Top },
        ],
    },
    [EParadroidShape.XShapeCombine]: {
        input: { left: true, bottom: true, top: true },
        output: { right: true, bottom: false, top: false },
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

export const isCombineShape = (shape: EParadroidShape): boolean =>
    [
        EParadroidShape.XShapeCombine,
        EParadroidShape.TShapeUpDownCombine,
        EParadroidShape.TShapeUpCombine,
        EParadroidShape.TShapeDownCombine,
    ].indexOf(shape) >= 0;

export const isExpandShape = (shape: EParadroidShape): boolean =>
    [
        EParadroidShape.XShapeExpand,
        EParadroidShape.TShapeUpDownExpand,
        EParadroidShape.TShapeUpExpand,
        EParadroidShape.TShapeDownExpand,
    ].indexOf(shape) >= 0;

export const isEmptyShape = (shape: EParadroidShape): boolean => shape === EParadroidShape.Empty;

export const getRowCount = (info: TParadroidTileDefinition, incoming = true) => {
    const column = incoming ? info.incoming : info.outgoing;
    return column.bot ? 3 : column.mid ? 2 : 1;
};

export const getRowKeyByIndex = (index: number): 'top' | 'mid' | 'bot' =>
    index === 2 ? 'bot' : index === 1 ? 'mid' : 'top';
