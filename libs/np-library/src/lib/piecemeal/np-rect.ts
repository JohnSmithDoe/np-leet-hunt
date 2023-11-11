/// A two-dimensional immutable rectangle with integer coordinates.
///
/// Many operations treat a [Rect] as a collection of discrete points. In those
/// cases, the boundaries of the rect are two half-open intervals when
/// determining which points are inside the rect. For example, consider the
/// rect whose coordinates are (-1, 1)-(3, 4):
///
///      -2 -1  0  1  2  3  4
///       |  |  |  |  |  |  |
///     0-
///     1-   +-----------+
///     2-   |           |
///     3-   |           |
///     4-   +-----------+
///     5-
///
/// It contains all points within that region except for the ones that lie
/// directly on the right and bottom edges. (It's always right and bottom,
/// even if the rectangle has negative coordinates.) In the above examples,
/// that's these points:
///
///      -2 -1  0  1  2  3  4
///       |  |  |  |  |  |  |
///     0-
///     1-   *--*--*--*--+
///     2-   *  *  *  *  |
///     3-   *  *  *  *  |
///     4-   +-----------+
///     5-
///
/// This seems a bit odd, but does what you want in almost all respects. For
/// example, the width of this rect, determined by subtracting the left
/// coordinate (-1) from the right (3) is 4 and indeed it contains four columns
/// of points.

/// Creates a new rectangle that is the intersection of [a] and [b].
///
///     .----------.
///     | a        |
///     | .--------+----.
///     | | result |  b |
///     | |        |    |
///     '-+--------'    |
///       |             |
///       '-------------'
import { clamp } from '@shared/np-library';

import { Pos } from './np-pos';

export const intersect = (a: NPRect, b: NPRect) => {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);

    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    return new NPRect(left, top, width, height);
};

export const centerIn = (toCenter: NPRect, main: NPRect) => {
    const pos = main.pos.add(main.size.subtract(toCenter.size).div(2));
    return NPRect.posAndSize(pos, toCenter.size);
};

export class NPRect implements Iterable<Pos> {
    /// Gets the empty rectangle.
    static empty = NPRect.posAndSize(Pos.zero, Pos.zero);

    readonly pos: Pos;
    readonly size: Pos;

    static posAndSize(pos: Pos, size: Pos) {
        return new NPRect(pos.x, pos.y, size.x, size.y);
    }
    /// Creates a new rectangle a single row in height, as wide as [size],
    /// with its top left corner at [pos].
    static row(x: number, y: number, size: number) {
        return new NPRect(x, y, size, 1);
    }

    /// Creates a new rectangle a single column in width, as tall as [size],
    /// with its top left corner at [pos].
    static column = (x: number, y: number, size: number) => new NPRect(x, y, 1, size);

    *[Symbol.iterator](): Iterator<Pos> {
        for (let i = this.left; i < this.right; i++) {
            for (let j = this.top; j < this.bottom; j++) {
                yield new Pos(i, j);
            }
        }
        return undefined;
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.pos = new Pos(x, y);
        this.size = new Pos(width, height);
    }

    get x() {
        return this.pos.x;
    }

    get y() {
        return this.pos.y;
    }

    get width() {
        return this.size.x;
    }

    get height() {
        return this.size.y;
    }

    // Use min and max to handle negative sizes.

    get left(): number {
        return Math.min(this.x, this.x + this.width);
    }

    get top(): number {
        return Math.min(this.y, this.y + this.height);
    }

    get right(): number {
        return Math.max(this.x, this.x + this.width);
    }

    get bottom(): number {
        return Math.max(this.y, this.y + this.height);
    }

    get topLeft() {
        return new Pos(this.left, this.top);
    }

    get topRight() {
        return new Pos(this.right, this.top);
    }

    get bottomLeft() {
        return new Pos(this.left, this.bottom);
    }

    get bottomRight() {
        return new Pos(this.right, this.bottom);
    }

    get center() {
        return new Pos(Math.trunc((this.left + this.right) / 2), Math.trunc((this.top + this.bottom) / 2));
    }

    get area() {
        return this.size.area;
    }

    //  const Rect.posAndSize(this.pos, this.size);

    // Rect.leftTopRightBottom(int left, int top, int right, int bottom)
    //     : pos = Vec(left, top),
    //       size = Vec(right - left, bottom - top);

    // Rect(int x, int y, int width, int height)
    //     : pos = Vec(x, y),
    //       size = Vec(width, height);

    toString() {
        return `(${this.pos.toString()})-(${this.size.toString()})`;
    }

    inflate(distance: number) {
        return new NPRect(this.x - distance, this.y - distance, this.width + distance * 2, this.height + distance * 2);
    }

    offset(x: number, y: number) {
        return new NPRect(this.x + x, this.y + y, this.width, this.height);
    }

    contains(pos: Pos) {
        if (pos.x < this.pos.x) return false;
        if (pos.x >= this.pos.x + this.size.x) return false;
        if (pos.y < this.pos.y) return false;
        if (pos.y >= this.pos.y + this.size.y) return false;
        return true;
    }

    containsGrid(grid: NPRect) {
        if (grid.left < this.left) return false;
        if (grid.right > this.right) return false;
        if (grid.top < this.top) return false;
        if (grid.bottom > this.bottom) return false;
        return true;
    }

    /// Returns a new [Pos] that is as near to [pos] as possible while being in
    /// bounds.
    clamp(pos: Pos) {
        const x = clamp(pos.x, this.left, this.right);
        const y = clamp(pos.y, this.top, this.bottom);
        return new Pos(x, y);
    }

    // get iterator => RectIterator(this);

    /// Returns the distance between this Rect and [other]. This is minimum
    /// length that a corridor would have to be to go from one Rect to the other.
    /// If the two Rects are adjacent, returns zero. If they overlap, returns -1.
    distanceTo(other: NPRect) {
        const vertical =
            this.top >= other.bottom
                ? this.top - other.bottom
                : this.bottom <= other.top
                ? other.top - this.bottom
                : -1;
        const horizontal =
            this.left >= other.right
                ? this.left - other.right
                : this.right <= other.left
                ? other.left - this.right
                : -1;

        if (vertical === -1 && horizontal === -1) return -1;
        if (vertical === -1) return horizontal;
        if (horizontal === -1) return vertical;
        return horizontal + vertical;
    }

    /// Iterates over the points along the edge of the Rect.
    trace() {
        if (this.width > 1 && this.height > 1) {
            // TODO(bob): Implement an iterator class here if building the list is
            // slow.
            // Trace all four sides.
            const result = [] as Pos[];

            for (let x = this.left; x < this.right; x++) {
                result.push(new Pos(x, this.top));
                result.push(new Pos(x, this.bottom - 1));
            }

            for (let y = this.top + 1; y < this.bottom - 1; y++) {
                result.push(new Pos(this.left, y));
                result.push(new Pos(this.right - 1, y));
            }

            return result;
        } else if (this.width > 1 && this.height === 1) {
            // A single row.
            return NPRect.row(this.left, this.top, this.width);
        } else if (this.height >= 1 && this.width === 1) {
            // A single column, or one unit
            return NPRect.column(this.left, this.top, this.height);
        }

        // Otherwise, the rect doesn't have a positive size, so there's nothing to
        // trace.
        return [];
    }

    // TODO: Equality operator and hashCode.
}
