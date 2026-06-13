import { array2D, clamp } from './np-utils';

describe('clamp', () => {
    // NOTE: the signature is clamp(value, upper, lower) — upper comes before lower.
    it('returns the value when within bounds', () => {
        expect(clamp(5, 10, 0)).toBe(5);
    });

    it('caps at the upper bound', () => {
        expect(clamp(15, 10, 0)).toBe(10);
    });

    it('floors at the lower bound', () => {
        expect(clamp(-3, 10, 0)).toBe(0);
    });
});

describe('array2D', () => {
    it('builds a rows x cols grid from the generator', () => {
        const grid = array2D(2, 3, (row, col) => row * 10 + col);
        expect(grid).toEqual([
            [0, 1, 2],
            [10, 11, 12],
        ]);
    });

    it('invokes the generator for every cell', () => {
        const grid = array2D(3, 4, () => 0);
        expect(grid).toHaveLength(3);
        grid.forEach(row => expect(row).toHaveLength(4));
    });
});
