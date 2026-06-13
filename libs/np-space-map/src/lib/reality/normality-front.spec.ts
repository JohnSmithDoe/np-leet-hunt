import { NormalityFront } from './normality-front';

describe('NormalityFront', () => {
    const config = { center: { x: 0, y: 0 }, initialRadius: 100, step: 20, minRadius: 20 };
    const build = (overrides = {}) => new NormalityFront({ ...config, ...overrides });

    it('starts at its initial radius with nothing closed', () => {
        const front = build();
        expect(front.radius).toBe(100);
        expect(front.closedFraction).toBe(0);
    });

    it('reports points outside the bubble as swallowed (boundary counts as inside)', () => {
        const front = build();
        const points = [
            { x: 0, y: 0, id: 'core' },
            { x: 100, y: 0, id: 'edge' }, // exactly on the radius → still distorted
            { x: 101, y: 0, id: 'rim' }, // just outside → swallowed
            { x: 0, y: 200, id: 'far' },
        ];
        expect(front.swallowed(points).map(p => p.id)).toEqual(['rim', 'far']);
    });

    it('swallows more nodes the further it collapses (monotonic)', () => {
        const front = build();
        const points = [{ x: 30, y: 0 }, { x: 70, y: 0 }, { x: 95, y: 0 }];
        expect(front.swallowed(points)).toHaveLength(0);
        front.advance(); // 100 → 80: the node at 95 falls outside
        expect(front.swallowed(points)).toHaveLength(1);
        front.advance(); // 80 → 60: the node at 70 falls outside too
        expect(front.swallowed(points)).toHaveLength(2);
    });

    it('shrinks by step per jump and clamps at the safe core', () => {
        const front = build();
        expect(front.advance()).toBe(80);
        expect(front.advance(2)).toBe(40);
        expect(front.advance()).toBe(20); // would be 20 — clamped at minRadius
        expect(front.advance()).toBe(20); // never below the core
        expect(front.closedFraction).toBe(1);
    });

    it('pushes the front back on distortion-battery feed, capped at entry', () => {
        const front = build();
        front.advance(3); // 100 → 40
        expect(front.pushFront()).toBe(60);
        expect(front.pushFront(1000)).toBe(100); // capped at the initial radius
    });

    it('computes an enclosing radius that covers every point plus margin', () => {
        const center = { x: 0, y: 0 };
        const points = [{ x: 30, y: 40 }, { x: 0, y: 10 }]; // 30/40 → distance 50
        expect(NormalityFront.enclosingRadius(center, points)).toBe(50);
        expect(NormalityFront.enclosingRadius(center, points, 25)).toBe(75);
    });
});
