import { intersect, NPRect } from './np-rect';
import { NPVec2 } from './np-vec2';

describe('NPRect', () => {
    it('reports edges, area and center', () => {
        const r = new NPRect(0, 0, 4, 3);
        expect([r.left, r.top, r.right, r.bottom]).toEqual([0, 0, 4, 3]);
        expect(r.area).toBe(12);
        expect(r.center).toMatchObject({ x: 2, y: 1 });
    });

    it('iterates over its discrete points (half-open on the right/bottom edges)', () => {
        const points = [...new NPRect(0, 0, 4, 3)];
        expect(points).toHaveLength(12);
    });

    it('contains points with half-open right/bottom edges', () => {
        const r = new NPRect(0, 0, 4, 3);
        expect(r.contains(new NPVec2(0, 0))).toBe(true);
        expect(r.contains(new NPVec2(3, 2))).toBe(true);
        expect(r.contains(new NPVec2(4, 0))).toBe(false); // right edge excluded
        expect(r.contains(new NPVec2(-1, 0))).toBe(false);
    });

    it('intersects two overlapping rects', () => {
        const result = intersect(new NPRect(0, 0, 4, 4), new NPRect(2, 2, 4, 4));
        expect(result.x).toBe(2);
        expect(result.y).toBe(2);
        expect(result.width).toBe(2);
        expect(result.height).toBe(2);
    });

    it('measures corridor distance between rects', () => {
        const a = new NPRect(0, 0, 2, 2);
        expect(a.distanceTo(new NPRect(5, 0, 2, 2))).toBe(3); // gap of 3
        expect(a.distanceTo(new NPRect(2, 0, 2, 2))).toBe(0); // adjacent
        expect(a.distanceTo(new NPRect(1, 1, 2, 2))).toBe(-1); // overlapping
    });

    it('traces the perimeter points of a rect', () => {
        // 4x3 grid of points => 12 total, 2 interior, 10 on the edge
        expect(new NPRect(0, 0, 4, 3).trace()).toHaveLength(10);
    });
});
