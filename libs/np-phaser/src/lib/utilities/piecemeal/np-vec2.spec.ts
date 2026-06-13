import { EDirection } from './np-direction';
import { NPVec2 } from './np-vec2';

describe('NPVec2', () => {
    it('computes area, rook, king and euclidean lengths', () => {
        expect(new NPVec2(3, 4).area).toBe(12);
        expect(new NPVec2(3, -4).rookLength).toBe(7);
        expect(new NPVec2(3, -4).kingLength).toBe(4);
        expect(new NPVec2(3, 4).length).toBe(5);
    });

    it('adds and subtracts both vectors and scalars', () => {
        expect(new NPVec2(1, 2).add(new NPVec2(3, 4))).toMatchObject({ x: 4, y: 6 });
        expect(new NPVec2(1, 2).add(10)).toMatchObject({ x: 11, y: 12 });
        expect(new NPVec2(5, 5).subtract(new NPVec2(1, 2))).toMatchObject({ x: 4, y: 3 });
    });

    it('truncates towards zero on integer division', () => {
        expect(new NPVec2(7, 5).div(2)).toMatchObject({ x: 3, y: 2 });
        expect(new NPVec2(2, 3).mul(3)).toMatchObject({ x: 6, y: 9 });
    });

    it('equals compares coordinates for vectors and magnitude for numbers', () => {
        expect(new NPVec2(1, 2).equals(new NPVec2(1, 2))).toBe(true);
        expect(new NPVec2(1, 2).equals(new NPVec2(2, 1))).toBe(false);
        // magnitude comparison: |(3,4)| === 5
        expect(new NPVec2(3, 4).equals(5)).toBe(true);
    });

    it('exposes 8 neighbours and 4 cardinal neighbours', () => {
        expect(new NPVec2(0, 0).neighbors).toHaveLength(8);
        expect(new NPVec2(0, 0).cardinalNeighbors).toHaveLength(4);
    });

    it('maps the cardinal vectors to the nearest direction', () => {
        expect(new NPVec2(0, -1).nearestDirection).toBe(EDirection.N);
        expect(new NPVec2(1, 0).nearestDirection).toBe(EDirection.E);
        expect(new NPVec2(0, 1).nearestDirection).toBe(EDirection.S);
        expect(new NPVec2(-1, 0).nearestDirection).toBe(EDirection.W);
    });

    it('produces a unique hashCode per integer coordinate (Cantor pairing)', () => {
        const hashes = new Set<number>();
        for (let x = -5; x <= 5; x++) {
            for (let y = -5; y <= 5; y++) {
                hashes.add(new NPVec2(x, y).hashCode());
            }
        }
        expect(hashes.size).toBe(11 * 11);
    });
});
