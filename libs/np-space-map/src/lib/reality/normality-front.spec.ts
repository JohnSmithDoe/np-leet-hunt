import { NormalityFront } from './normality-front';

describe('NormalityFront', () => {
    // A horizontal sweep from x=0 makes the maths easy to read: a point's projection is just its x.
    const config = {
        origin: { x: 0, y: 0 },
        axis: { x: 1, y: 0 },
        initialPosition: 0,
        maxPosition: 100,
        step: 20,
    };
    const build = (overrides = {}) => new NormalityFront({ ...config, ...overrides });

    it('starts at its initial position with nothing closed', () => {
        const front = build();
        expect(front.position).toBe(0);
        expect(front.closedFraction).toBe(0);
    });

    it('reports points behind the front as swallowed (the line itself counts as inside)', () => {
        const front = build();
        const points = [
            { x: 0, y: 0, id: 'on-line' }, // exactly on the front → still distorted
            { x: 50, y: 999, id: 'ahead' }, // ahead of the front (y is irrelevant on a horizontal sweep)
            { x: -1, y: 0, id: 'behind' }, // just behind → swallowed
        ];
        expect(front.swallowed(points).map(p => p.id)).toEqual(['behind']);
    });

    it('swallows more nodes the further it sweeps (monotonic)', () => {
        const front = build();
        const points = [{ x: 10, y: 0 }, { x: 50, y: 0 }, { x: 90, y: 0 }];
        expect(front.swallowed(points)).toHaveLength(0);
        front.advance(); // 0 → 20: the node at x=10 falls behind
        expect(front.swallowed(points)).toHaveLength(1);
        front.advance(2); // 20 → 60: the node at x=50 falls behind too
        expect(front.swallowed(points)).toHaveLength(2);
    });

    it('advances by step per jump and clamps at the safe core', () => {
        const front = build();
        expect(front.advance()).toBe(20);
        expect(front.advance(2)).toBe(60);
        expect(front.advance()).toBe(80);
        expect(front.advance()).toBe(100); // would be 100 — clamped at maxPosition
        expect(front.advance()).toBe(100); // never past the core
        expect(front.closedFraction).toBe(1);
    });

    it('pushes the front back on distortion-battery feed, capped at entry', () => {
        const front = build();
        front.advance(3); // 0 → 60
        expect(front.pushFront()).toBe(40);
        expect(front.pushFront(1000)).toBe(0); // capped at the initial position
    });

    it('normalises the axis, so projection is independent of the vector length', () => {
        // axis (3,4) has length 5; the unit axis is (0.6, 0.8).
        const front = build({ axis: { x: 3, y: 4 }, initialPosition: 0, maxPosition: 100, step: 10 });
        // A point at (3,4) projects to (3*0.6 + 4*0.8) = 5, comfortably ahead of the front at 0.
        expect(front.contains({ x: 3, y: 4 })).toBe(true);
        front.advance(); // front sweeps to 10, past that point's projection of 5
        expect(front.contains({ x: 3, y: 4 })).toBe(false);
    });

    it('computes projection bounds that bracket every point plus margin', () => {
        const origin = { x: 0, y: 0 };
        const axis = { x: 1, y: 0 }; // projections collapse to the x coordinate
        const points = [{ x: 30, y: 40 }, { x: -10, y: 10 }];
        expect(NormalityFront.enclosingBounds(origin, axis, points)).toEqual({ min: -10, max: 30 });
        expect(NormalityFront.enclosingBounds(origin, axis, points, 25)).toEqual({ min: -35, max: 55 });
    });
});
