import { EFlowFrom, EFlowTo, EParadroidOwner, EParadroidShape } from './paradroid.consts';
import { TParadroidTileDefinition } from './paradroid.types';

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
export const getNextFlow = (flow: EFlowTo): EFlowFrom => {
    switch (flow) {
        case EFlowTo.Mid:
            return EFlowFrom.Mid;
        case EFlowTo.Top:
            return EFlowFrom.Bottom;
        case EFlowTo.Bottom:
            return EFlowFrom.Top;
        case EFlowTo.Right:
            return EFlowFrom.Left;
    }
};
export const isNextFlow = (flow: EFlowTo, next: EFlowFrom) => next === getNextFlow(flow);
export const getOppositeOwner = (owner: EParadroidOwner): EParadroidOwner => {
    if (owner === EParadroidOwner.Player) {
        return EParadroidOwner.Droid;
    } else if (owner === EParadroidOwner.Droid) {
        return EParadroidOwner.Player;
    } else {
        return EParadroidOwner.Nobody;
    }
};
