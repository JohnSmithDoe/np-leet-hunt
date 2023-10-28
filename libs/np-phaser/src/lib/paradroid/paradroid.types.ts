import { Utils } from '../sprites/paradroid/utils';

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

export enum EParadroidShapeAccess {
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

export enum EParadroidOwner {
    Player,
    Droid,
    Nobody,
}

export type EParadroidPlayer = EParadroidOwner.Player | EParadroidOwner.Droid;

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
    id: string;
    image: string;
    rotation: number;
    ins: TParadroidGatesIn;
    outs: TParadroidGatesOut;
}

export interface TParadroidShapeCol {
    top: EParadroidShape;
    mid: EParadroidShape;
    bot: EParadroidShape;
}

export interface TParadroidShapeGrid {
    incoming: TParadroidShapeCol;
    outgoing: TParadroidShapeCol;
}

export interface TParadroidTileAccessCol {
    top: EParadroidShapeAccess;
    mid: EParadroidShapeAccess;
    bot: EParadroidShapeAccess;
}

export interface TParadroidTileAccessGrid {
    incoming: TParadroidTileAccessCol;
    outgoing: TParadroidTileAccessCol;
}

export interface TParadroidTileInfo {
    id: string;
    rows: number;
    subgrid: TParadroidShapeGrid;
    access: TParadroidTileAccessGrid;
}

export interface TParadroidMode {
    tileSet: EParadroidTileType[];
    changerRate: number;
    autofireRate: number;
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
const CImages = {
    Paradroid: {
        EmptyNode: './images/paradroid/EmptyNode.png',
        DNode: './images/paradroid/DNode.png',
        INode: './images/paradroid/INode.png',
        LNode: './images/paradroid/LNode.png',
        TNode: './images/paradroid/TNode.png',
        XNode: './images/paradroid/XNode.png',
        Middle_None: './images/paradroid/middle_none.png',
        Middle_Player: './images/paradroid/middle_player.png',
        Middle_Droid: './images/paradroid/middle_droid.png',
        Btn_Default: './images/paradroid/btn_default.png',
        Btn_Over: './images/paradroid/btn_over.png',
        Btn_Pressed: './images/paradroid/btn_pressed.png',
        SpecialFx_Autofire: './images/paradroid/specialfx_autofire.png',
        SpecialFx_Changer: './images/paradroid/specialfx_changer.png',
        SpecialFx_Combine: './images/paradroid/specialfx_combine.png',
        FlowBar_Player_Incoming: './images/paradroid/flowbar_player_incoming.png',
        FlowBar_Player_Outgoing: './images/paradroid/flowbar_player_outgoing.png',
        FlowBar_Droid_Incoming: './images/paradroid/flowbar_droid_incoming.png',
        FlowBar_Droid_Outgoing: './images/paradroid/flowbar_droid_outgoing.png',
        Shot_player: './images/paradroid/shot_player.png',
        Shot_droid: './images/paradroid/shot_droid.png',
        Background: './images/paradroid/background.png',
    },
};
export const CParadroidShapeInfo: { [shape: number]: TParadroidShapeInfo } = {
    [EParadroidShape.Empty]: {
        id: 'Empty',
        image: CImages.Paradroid.EmptyNode,
        rotation: 0,
        ins: { left: false, bottom: false, top: false },
        outs: { right: false, bottom: false, top: false },
    },
    [EParadroidShape.Deadend]: {
        id: 'EndShape',
        image: CImages.Paradroid.DNode,
        rotation: 0,
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: false, top: false },
    },
    [EParadroidShape.IShape]: {
        id: 'IShape',
        image: CImages.Paradroid.INode,
        rotation: 0,
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.LShapeLeftDown]: {
        id: 'LShapeLeftDown',
        image: CImages.Paradroid.LNode,
        rotation: Utils.DIR_LEFT,
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: true, top: false },
    },
    [EParadroidShape.LShapeLeftUp]: {
        id: 'LShapeLeftUp',
        image: CImages.Paradroid.LNode,
        rotation: 0,
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: false, top: true },
    },

    [EParadroidShape.LShapeUpRight]: {
        id: 'LShapeUpRight',
        image: CImages.Paradroid.LNode,
        rotation: Utils.DIR_DOWN,
        ins: { left: false, bottom: true, top: false },
        outs: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.LShapeDownRight]: {
        id: 'LShapeDownRight',
        image: CImages.Paradroid.LNode,
        rotation: Utils.DIR_RIGHT,
        ins: { left: false, bottom: false, top: true },
        outs: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.TShapeUpCombine]: {
        id: 'TShapeUpCombine',
        image: CImages.Paradroid.TNode,
        rotation: 0,
        ins: { left: true, bottom: false, top: true },
        outs: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.TShapeDownCombine]: {
        id: 'TShapeDownCombine',
        image: CImages.Paradroid.TNode,
        rotation: Utils.DIR_DOWN,
        ins: { left: true, bottom: true, top: false },
        outs: { right: true, bottom: false, top: false },
    },

    [EParadroidShape.TShapeUpExpand]: {
        id: 'TShapeUpExpand',
        image: CImages.Paradroid.TNode,
        rotation: Utils.DIR_UP,
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: false, top: true },
    },
    [EParadroidShape.TShapeDownExpand]: {
        id: 'TShapeDownExpand',
        image: CImages.Paradroid.TNode,
        rotation: Utils.DIR_DOWN,
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: true, top: false },
    },

    [EParadroidShape.TShapeUpDownCombine]: {
        id: 'TShapeUpDownCombine',
        image: CImages.Paradroid.TNode,
        rotation: Utils.DIR_RIGHT,
        ins: { left: false, bottom: true, top: true },
        outs: { right: true, bottom: false, top: false },
    },
    [EParadroidShape.TShapeUpDownExpand]: {
        id: 'TShapeUpDownExpand',
        image: CImages.Paradroid.TNode,
        rotation: Utils.DIR_LEFT,
        ins: { left: true, bottom: false, top: false },
        outs: { right: false, bottom: true, top: true },
    },

    [EParadroidShape.XShapeExpand]: {
        id: 'XShapeExpand',
        image: CImages.Paradroid.XNode,
        rotation: 0,
        ins: { left: true, bottom: false, top: false },
        outs: { right: true, bottom: true, top: true },
    },
    [EParadroidShape.XShapeCombine]: {
        id: 'XShapeCombine',
        image: CImages.Paradroid.XNode,
        rotation: 0,
        ins: { left: true, bottom: true, top: true },
        outs: { right: true, bottom: false, top: false },
    },
};
export const CParadroidTileInfo: { [type: number]: TParadroidTileInfo } = {
    //
    //
    //
    [EParadroidTileType.Empty]: {
        id: 'Empty',
        rows: 1,
        subgrid: {
            incoming: {
                top: EParadroidShape.Empty,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.Empty,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.unset,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.unset,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // -------
    //
    //
    [EParadroidTileType.Single]: {
        id: 'Single',
        rows: 1,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.unset,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.unset,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // ---X
    //
    //
    [EParadroidTileType.Deadend]: {
        id: 'Deadend',
        rows: 1,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.Deadend,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.unset,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.unset,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // ----|---
    //     |---
    //
    [EParadroidTileType.DoubleTopExpand]: {
        id: 'DoubleTopExpand',
        rows: 2,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.TShapeDownExpand,
                mid: EParadroidShape.LShapeDownRight,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.isBlocked,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // ----|---
    // --X |---
    //
    [EParadroidTileType.DoubleTopExpandDeadEnds]: {
        id: 'DoubleTopExpandDeadEnds',
        rows: 2,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Deadend,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.TShapeDownExpand,
                mid: EParadroidShape.LShapeDownRight,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    //     |---
    // ----|---
    //
    [EParadroidTileType.DoubleBottomExpand]: {
        id: 'DoubleBottomExpand',
        rows: 2,
        subgrid: {
            incoming: {
                top: EParadroidShape.Empty,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.LShapeUpRight,
                mid: EParadroidShape.TShapeUpExpand,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // --X |---
    // ----|---
    //
    [EParadroidTileType.DoubleBottomExpandDeadEnds]: {
        id: 'Empty',
        rows: 2,
        subgrid: {
            incoming: {
                top: EParadroidShape.Deadend,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.LShapeUpRight,
                mid: EParadroidShape.TShapeUpExpand,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // ----|----
    // ----|  X
    //
    [EParadroidTileType.DoubleTopCombine]: {
        id: 'DoubleTopCombine',
        rows: 2,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.TShapeDownCombine,
                mid: EParadroidShape.LShapeLeftUp,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.isBlocked,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    // ----|   X
    // ----|----
    //
    [EParadroidTileType.DoubleBottomCombine]: {
        id: 'DoubleBottomCombine',
        rows: 2,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.LShapeLeftDown,
                mid: EParadroidShape.TShapeUpCombine,
                bot: EParadroidShape.Empty,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
            outgoing: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.unset,
            },
        },
    },
    //     |----
    // ----|   X
    //     |----
    [EParadroidTileType.UpDownExpand]: {
        id: 'UpDownExpand',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.Empty,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.LShapeUpRight,
                mid: EParadroidShape.TShapeUpDownExpand,
                bot: EParadroidShape.LShapeDownRight,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.isBlocked,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.isBlocked,
                bot: EParadroidShapeAccess.hasPath,
            },
        },
    },
    // --X |----
    // ----|   X
    // --X |----
    [EParadroidTileType.UpDownExpandDeadEnds]: {
        id: 'UpDownExpandDeadEnds',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.Deadend,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Deadend,
            },
            outgoing: {
                top: EParadroidShape.LShapeUpRight,
                mid: EParadroidShape.TShapeUpDownExpand,
                bot: EParadroidShape.LShapeDownRight,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.hasPath,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.isBlocked,
                bot: EParadroidShapeAccess.hasPath,
            },
        },
    },
    // ----|   X
    //     |----
    // ----|   X
    [EParadroidTileType.UpDownCombine]: {
        id: 'UpDownCombine',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Empty,
                bot: EParadroidShape.IShape,
            },
            outgoing: {
                top: EParadroidShape.LShapeLeftDown,
                mid: EParadroidShape.TShapeUpDownCombine,
                bot: EParadroidShape.LShapeLeftUp,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.isBlocked,
                bot: EParadroidShapeAccess.hasPath,
            },
            outgoing: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.isBlocked,
            },
        },
    },
    // ----|   X
    // --X |----
    // ----|   X
    [EParadroidTileType.UpDownCombineDeadEnds]: {
        id: 'UpDownCombineDeadEnds',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.Deadend,
                bot: EParadroidShape.IShape,
            },
            outgoing: {
                top: EParadroidShape.LShapeLeftDown,
                mid: EParadroidShape.TShapeUpDownCombine,
                bot: EParadroidShape.LShapeLeftUp,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.hasPath,
            },
            outgoing: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.isBlocked,
            },
        },
    },
    //     |---
    // ----|---
    //     |---
    [EParadroidTileType.TrippleExpand]: {
        id: 'TrippleExpand',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.Empty,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Empty,
            },
            outgoing: {
                top: EParadroidShape.LShapeUpRight,
                mid: EParadroidShape.XShapeExpand,
                bot: EParadroidShape.LShapeDownRight,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.isBlocked,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.hasPath,
            },
        },
    },
    // --X |---
    // ----|---
    // --X |---
    [EParadroidTileType.TrippleExpandDeadEnds]: {
        id: 'TrippleExpandDeadEnds',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.Deadend,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.Deadend,
            },
            outgoing: {
                top: EParadroidShape.LShapeUpRight,
                mid: EParadroidShape.XShapeExpand,
                bot: EParadroidShape.LShapeDownRight,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.hasPath,
            },
            outgoing: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.hasPath,
            },
        },
    },
    // ----|   X
    // ----|----
    // ----|   X
    [EParadroidTileType.TrippleCombine]: {
        id: 'TrippleCombine',
        rows: 3,
        subgrid: {
            incoming: {
                top: EParadroidShape.IShape,
                mid: EParadroidShape.IShape,
                bot: EParadroidShape.IShape,
            },
            outgoing: {
                top: EParadroidShape.LShapeLeftDown,
                mid: EParadroidShape.XShapeCombine,
                bot: EParadroidShape.LShapeLeftUp,
            },
        },
        access: {
            incoming: {
                top: EParadroidShapeAccess.hasPath,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.hasPath,
            },
            outgoing: {
                top: EParadroidShapeAccess.isBlocked,
                mid: EParadroidShapeAccess.hasPath,
                bot: EParadroidShapeAccess.isBlocked,
            },
        },
    },
};
