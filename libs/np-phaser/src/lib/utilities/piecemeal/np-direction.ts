export enum EDirection {
    NONE = 'none',
    N = 'north',
    NE = 'northeast',
    E = 'east',
    SE = 'southeast',
    S = 'south',
    SW = 'southwest',
    W = 'west',
    NW = 'northwest',
}

/// The eight cardinal and intercardinal directions, in clockwise order. This
/// ordering is load-bearing: every rotation below is a step around this cycle.
export const AllDirections = [
    EDirection.N,
    EDirection.NE,
    EDirection.E,
    EDirection.SE,
    EDirection.S,
    EDirection.SW,
    EDirection.W,
    EDirection.NW,
];

/// The four cardinal directions: north, south, east, and west.
export const CardinalDirections = [EDirection.N, EDirection.E, EDirection.S, EDirection.W];

/// The four directions between the cardinal ones: northwest, northeast,
/// southwest and southeast.
export const IntercardinalDirections = [EDirection.NE, EDirection.SE, EDirection.SW, EDirection.NW];

/// Steps `steps` eighths clockwise around the compass (negative = anticlockwise).
/// NONE has no angle, so it never rotates.
const rotate =
    (steps: number) =>
    (dir: EDirection): EDirection => {
        if (dir === EDirection.NONE) return EDirection.NONE;
        const turned = (AllDirections.indexOf(dir) + steps) % AllDirections.length;
        return AllDirections[(turned + AllDirections.length) % AllDirections.length];
    };

export const rotateLeft45 = rotate(-1);
export const rotateRight45 = rotate(1);
export const rotateLeft90 = rotate(-2);
export const rotateRight90 = rotate(2);
export const rotate180 = rotate(4);

const DirectionLabels: Record<EDirection, string> = {
    [EDirection.NONE]: 'NONE',
    [EDirection.N]: 'N',
    [EDirection.NE]: 'NE',
    [EDirection.E]: 'E',
    [EDirection.SE]: 'SE',
    [EDirection.S]: 'S',
    [EDirection.SW]: 'SW',
    [EDirection.W]: 'W',
    [EDirection.NW]: 'NW',
};

export const directionToString = (dir: EDirection) => DirectionLabels[dir];

/// The rex movement plugin enumerates directions by index; this is that order.
const RexDirections = [
    EDirection.E,
    EDirection.S,
    EDirection.W,
    EDirection.N,
    EDirection.SE,
    EDirection.SW,
    EDirection.NW,
    EDirection.NE,
];

export const mapRexPluginDirection = (dir: number): EDirection => RexDirections[dir] ?? EDirection.NONE;

export const mapToRexPluginDirection = (dir: EDirection): number | undefined => {
    const code = RexDirections.indexOf(dir);
    return code === -1 ? undefined : code;
};
