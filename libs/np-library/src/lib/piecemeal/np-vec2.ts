import { AllDirections, CardinalDirections, EDirection, IntercardinalDirections } from './np-direction';

export const directionToPos = (dir: EDirection) => {
    switch (dir) {
        case EDirection.NONE:
            return new NPVec2(0, 0);
        case EDirection.N:
            return new NPVec2(0, -1);
        case EDirection.NE:
            return new NPVec2(1, -1);
        case EDirection.E:
            return new NPVec2(1, 0);
        case EDirection.SE:
            return new NPVec2(1, 1);
        case EDirection.S:
            return new NPVec2(0, 1);
        case EDirection.SW:
            return new NPVec2(-1, 1);
        case EDirection.W:
            return new NPVec2(-1, 0);
        case EDirection.NW:
            return new NPVec2(-1, -1);
    }
};

export class NPVec2 {
    static readonly zero = new NPVec2(0, 0);

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /// Gets the area of a [Rect] whose corners are (0, 0) and this Vec.
    ///
    /// Returns a negative area if one of the Vec's coordinates are negative.
    get area() {
        return this.x * this.y;
    }

    /// Gets the rook length of the Vec, which is the number of squares a rook on
    /// a chessboard would need to move from (0, 0) to reach the endpoint of the
    /// Vec. Also known as Manhattan or taxicab distance.
    get rookLength() {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    /// Gets the king length of the Vec, which is the number of squares a king on
    /// a chessboard would need to move from (0, 0) to reach the endpoint of the
    /// Vec. Also known as Chebyshev distance.
    get kingLength() {
        return Math.max(Math.abs(this.x), Math.abs(this.y));
    }

    get lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    /// The Cartesian length of the vector.
    ///
    /// If you just need to compare the magnitude of two vectors, prefer using
    /// the comparison operators or [lengthSquared], both of which are faster
    /// than this.
    get length() {
        return Math.sqrt(this.lengthSquared);
    }

    /// The [Direction] that most closely approximates the angle of this Vec.
    ///
    /// In cases where two directions are equally close, chooses the one that is
    /// clockwise from this Vec's angle.
    ///
    /// In other words, it figures out which octant the vector's angle lies in
    /// (the dotted lines) and chooses the corresponding direction:
    ///
    ///               n
    ///      nw   2.0  -2.0  ne
    ///         \  '  |  '  /
    ///          \    |    /
    ///      0.5  \ ' | ' /   -0.5
    ///         '  \  |  /  '
    ///           ' \'|'/ '
    ///             '\|/'
    ///       w ------0------ e
    ///             '/|\'
    ///           ' /'|'\ '
    ///         '  /  |  \  '
    ///     -0.5  / ' | ' \   0.5
    ///          /    |    \
    ///         /  '  |  '  \
    ///       sw -2.0   2.0  se
    ///               s
    get nearestDirection() {
        if (this.x < 0) {
            if (this.y / this.x >= 2.0) return EDirection.N;
            if (this.y / this.x >= 0.5) return EDirection.NW;
            if (this.y / this.x >= -0.5) return EDirection.W;
            if (this.y / this.x >= -2.0) return EDirection.SW;
            return EDirection.S;
        } else if (this.x > 0) {
            if (this.y / this.x >= 2.0) return EDirection.S;
            if (this.y / this.x >= 0.5) return EDirection.SE;
            if (this.y / this.x >= -0.5) return EDirection.E;
            if (this.y / this.x >= -2.0) return EDirection.NE;
            return EDirection.N;
        } else if (this.y < 0) {
            return EDirection.N;
        } else if (this.y > 0) {
            return EDirection.S;
        } else {
            return EDirection.NONE;
        }
    }

    /// The eight Vecs surrounding this one to the north, south, east, and west
    /// and points in between.
    get neighbors() {
        return AllDirections.map(dir => this.add(directionToPos(dir)));
    }

    /// The four Vecs surrounding this one to the north, south, east, and west.
    get cardinalNeighbors() {
        return CardinalDirections.map(dir => this.add(directionToPos(dir)));
    }

    /// The four Vecs surrounding this one to the northeast, southeast, southwest,
    /// and northwest.
    get intercardinalNeighbors() {
        return IntercardinalDirections.map(dir => this.add(directionToPos(dir)));
    }

    /// Scales this Vec by [other].
    mul(value: number) {
        return new NPVec2(this.x * value, this.y * value);
    }

    /// Scales this Vec by [other].
    div(value: number) {
        return new NPVec2(Math.trunc(this.x / value), Math.trunc(this.y / value));
    }

    /// Adds [other] to this Vec.
    ///
    ///  *  If [other] is a [Vec] or [Direction], adds each pair of coordinates.
    ///  *  If [other] is an [int], adds that value to both coordinates.
    ///
    /// Any other type is an error.
    add(value: NPVec2 | number) {
        return typeof value === 'number'
            ? new NPVec2(this.x + value, this.y + value)
            : new NPVec2(this.x + value.x, this.y + value.y);
    }

    /// Substracts [other] from this Vec.
    ///
    ///  *  If [other] is a [Vec] or [Direction], subtracts each pair of
    ///     coordinates.
    ///  *  If [other] is an [int], subtracts that value from both coordinates.
    ///
    /// Any other type is an error.
    subtract(value: NPVec2 | number) {
        return typeof value === 'number'
            ? new NPVec2(this.x - value, this.y - value)
            : new NPVec2(this.x - value.x, this.y - value.y);
    }

    /// Returns `true` if the magnitude of this vector is greater than [other].
    grt(value: NPVec2 | number) {
        return typeof value === 'number'
            ? this.lengthSquared > value * value
            : this.lengthSquared > value.lengthSquared;
    }

    /// Returns `true` if the magnitude of this vector is greater than or equal
    /// to [other].
    grtEq(value: NPVec2 | number) {
        return typeof value === 'number'
            ? this.lengthSquared >= value * value
            : this.lengthSquared >= value.lengthSquared;
    }

    /// Returns `true` if the magnitude of this vector is less than [other].
    isSmaller(value: NPVec2 | number) {
        return typeof value === 'number'
            ? this.lengthSquared < value * value
            : this.lengthSquared < value.lengthSquared;
    }

    /// Returns `true` if the magnitude of this vector is less than or equal to
    /// [other].
    isSmallerOrEqual(value: NPVec2 | number) {
        return typeof value === 'number'
            ? this.lengthSquared <= value * value
            : this.lengthSquared <= value.lengthSquared;
    }

    equals(value: NPVec2 | number) {
        return typeof value === 'number'
            ? this.lengthSquared === value * value
            : this.x === value.x && this.y === value.y;
    }
    hashCode() {
        // Map negative coordinates to positive and spread out the positive ones to
        // make room for them.
        const a = this.x >= 0 ? 2 * this.x : -2 * this.x - 1;
        const b = this.y >= 0 ? 2 * this.y : -2 * this.y - 1;

        // Cantor pairing function.
        // https://en.wikipedia.org/wiki/Pairing_function
        return Math.trunc(((a + b) * (a + b + 1)) / 2) + b;
    }

    /// Returns `true` if [pos] is within a rectangle from (0,0) to this vector
    /// (half-inclusive).
    contains(pos: NPVec2) {
        const left = Math.min(0, this.x);
        if (pos.x < left) return false;

        const right = Math.max(0, this.x);
        if (pos.x >= right) return false;

        const top = Math.min(0, this.y);
        if (pos.y < top) return false;

        const bottom = Math.max(0, this.y);
        if (pos.y >= bottom) return false;

        return true;
    }

    /// Returns a new [Vec] with the absolute value of the coordinates of this
    /// one.
    abs() {
        return new NPVec2(Math.abs(this.x), Math.abs(this.y));
    }

    /// Returns a new [Vec] whose coordinates are this one's translated by [x] and
    /// [y].
    offset(x: number, y: number) {
        return new NPVec2(this.x + x, this.y + y);
    }

    /// Returns a new [Vec] whose coordinates are this one's but with the X
    /// coordinate translated by [x].
    offsetX(x: number) {
        return new NPVec2(this.x + x, this.y);
    }

    /// Returns a new [Vec] whose coordinates are this one's but with the Y
    /// coordinate translated by [y].
    offsetY(y: number) {
        return new NPVec2(this.x, this.y + y);
    }

    toString() {
        return `${this.x}, ${this.y}`;
    }
}
