export enum EDirection {
    NONE = 'none',
    N = 'north',
    NE = 'northeast',
    E = 'east',
    SE = 'southeast',
    S = 'south',
    SW = ' southwest',
    W = 'west',
    NW = 'northwest',
}

/// The eight cardinal and intercardinal directions.
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

export const rotateLeft45 = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return EDirection.NONE;
        case EDirection.N:
            return EDirection.NW;
        case EDirection.NE:
            return EDirection.N;
        case EDirection.E:
            return EDirection.NE;
        case EDirection.SE:
            return EDirection.E;
        case EDirection.S:
            return EDirection.SE;
        case EDirection.SW:
            return EDirection.S;
        case EDirection.W:
            return EDirection.SW;
        case EDirection.NW:
            return EDirection.W;
    }
};
export const rotateRight45 = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return EDirection.NONE;
        case EDirection.N:
            return EDirection.NE;
        case EDirection.NE:
            return EDirection.E;
        case EDirection.E:
            return EDirection.SE;
        case EDirection.SE:
            return EDirection.S;
        case EDirection.S:
            return EDirection.SW;
        case EDirection.SW:
            return EDirection.W;
        case EDirection.W:
            return EDirection.NW;
        case EDirection.NW:
            return EDirection.N;
    }
};
export const rotateLeft90 = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return EDirection.NONE;
        case EDirection.N:
            return EDirection.W;
        case EDirection.NE:
            return EDirection.NW;
        case EDirection.E:
            return EDirection.N;
        case EDirection.SE:
            return EDirection.NE;
        case EDirection.S:
            return EDirection.E;
        case EDirection.SW:
            return EDirection.SE;
        case EDirection.W:
            return EDirection.S;
        case EDirection.NW:
            return EDirection.SW;
    }
};
export const rotateRight90 = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return EDirection.NONE;
        case EDirection.N:
            return EDirection.E;
        case EDirection.NE:
            return EDirection.SE;
        case EDirection.E:
            return EDirection.S;
        case EDirection.SE:
            return EDirection.SW;
        case EDirection.S:
            return EDirection.W;
        case EDirection.SW:
            return EDirection.NW;
        case EDirection.W:
            return EDirection.N;
        case EDirection.NW:
            return EDirection.NE;
    }
};
export const rotate180 = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return EDirection.NONE;
        case EDirection.N:
            return EDirection.S;
        case EDirection.NE:
            return EDirection.SW;
        case EDirection.E:
            return EDirection.W;
        case EDirection.SE:
            return EDirection.NW;
        case EDirection.S:
            return EDirection.N;
        case EDirection.SW:
            return EDirection.NE;
        case EDirection.W:
            return EDirection.E;
        case EDirection.NW:
            return EDirection.SE;
    }
};

export const directionToString = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return 'NONE';
        case EDirection.N:
            return 'N';
        case EDirection.NE:
            return 'NE';
        case EDirection.E:
            return 'E';
        case EDirection.SE:
            return 'SE';
        case EDirection.S:
            return 'S';
        case EDirection.SW:
            return 'SW';
        case EDirection.W:
            return 'W';
        case EDirection.NW:
            return 'NW';
    }
};
