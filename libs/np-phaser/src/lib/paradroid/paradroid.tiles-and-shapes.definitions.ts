import { TParadroidShape, TParadroidTileDefinition } from './paradroid.types';

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
    },
    [EParadroidShape.Deadend]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: false, top: false },
    },
    [EParadroidShape.IShape]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.LShapeLeftDown]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: true, top: false },
    },
    [EParadroidShape.LShapeLeftUp]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: false, top: true },
    },

    [EParadroidShape.LShapeUpRight]: {
        input: { left: false, bottom: true, top: false },
        output: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.LShapeDownRight]: {
        input: { left: false, bottom: false, top: true },
        output: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.TShapeUpCombine]: {
        input: { left: true, bottom: false, top: true },
        output: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.TShapeDownCombine]: {
        input: { left: true, bottom: true, top: false },
        output: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.TShapeUpExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: false, top: true },
    },
    [EParadroidShape.TShapeDownExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: true, top: false },
    },

    [EParadroidShape.TShapeUpDownCombine]: {
        input: { left: false, bottom: true, top: true },
        output: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.TShapeUpDownExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: false, bottom: true, top: true },
    },

    [EParadroidShape.XShapeExpand]: {
        input: { left: true, bottom: false, top: false },
        output: { right: true, bottom: true, top: true },
    },
    [EParadroidShape.XShapeCombine]: {
        input: { left: true, bottom: true, top: true },
        output: { right: true, bottom: false, top: false },
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

export const getRowsFromDefinition = (info: TParadroidTileDefinition, incoming = true) => {
    const column = incoming ? info.incoming : info.outgoing;
    return column.bot ? 3 : column.mid ? 2 : 1;
};

export const getRowAccessByIndex = (
    info: TParadroidTileDefinition,
    incoming: boolean,
    index: number
): EParadroidAccess =>
    (incoming ? info.incoming : info.outgoing)[getRowKeyByIndex(index)]?.access ?? EParadroidAccess.unset;

export const getRowKeyByIndex = (index: number): 'top' | 'mid' | 'bot' =>
    index === 2 ? 'bot' : index === 1 ? 'mid' : 'top';

export const getRowAccessByKey = (
    info: TParadroidTileDefinition,
    incoming: boolean,
    key: 'top' | 'mid' | 'bot'
): EParadroidAccess => (incoming ? info.incoming : info.outgoing)[key]?.access ?? EParadroidAccess.unset;

export const getRowKeysFromDefinition = (info: TParadroidTileDefinition, incoming = true): ['top', 'mid'?, 'bot'?] => {
    const column = incoming ? info.incoming : info.outgoing;
    return column.bot ? ['top', 'mid', 'bot'] : column.mid ? ['top', 'mid'] : ['top'];
};
