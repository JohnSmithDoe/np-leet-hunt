import { NPRng } from './np-rng';

describe('NPRng', () => {
    it('is reproducible: the same seed yields the same sequence', () => {
        const a = new NPRng('seed-42');
        const b = new NPRng('seed-42');
        const seqA = Array.from({ length: 50 }, () => a.inRange(0, 1000));
        const seqB = Array.from({ length: 50 }, () => b.inRange(0, 1000));
        expect(seqA).toEqual(seqB);
    });

    it('different seeds (almost certainly) diverge', () => {
        const one = new NPRng('one');
        const two = new NPRng('two');
        const s1 = Array.from({ length: 50 }, () => one.inRange(0, 1e9));
        const s2 = Array.from({ length: 50 }, () => two.inRange(0, 1e9));
        expect(s1).not.toEqual(s2);
    });

    it('inRange(min, max) stays within the inclusive bounds', () => {
        const rng = new NPRng('bounds');
        for (let i = 0; i < 500; i++) {
            const n = rng.inRange(5, 10);
            expect(n).toBeGreaterThanOrEqual(5);
            expect(n).toBeLessThanOrEqual(10);
        }
    });

    it('inRange(max) defaults the minimum to 0', () => {
        const rng = new NPRng('single-arg');
        for (let i = 0; i < 500; i++) {
            const n = rng.inRange(3);
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThanOrEqual(3);
        }
    });

    it('item() always returns an element of the array', () => {
        const rng = new NPRng('item');
        const arr = ['a', 'b', 'c', 'd'];
        for (let i = 0; i < 200; i++) {
            expect(arr).toContain(rng.item(arr));
        }
    });

    it('percentageHit(100) always succeeds', () => {
        const rng = new NPRng('pct');
        for (let i = 0; i < 200; i++) {
            expect(rng.percentageHit(100)).toBe(true);
        }
    });

    describe('round', () => {
        it('leaves an integer value unchanged', () => {
            const rng = new NPRng('round-int');
            for (let i = 0; i < 200; i++) {
                expect(rng.round(5)).toBe(5);
                expect(rng.round(-5)).toBe(-5);
            }
        });

        it('only ever rounds to the floor or the ceil of a fractional value', () => {
            const rng = new NPRng('round-frac');
            for (let i = 0; i < 200; i++) {
                expect([3, 4]).toContain(rng.round(3.2));
            }
        });

        it('rounds up with a probability equal to the fractional part', () => {
            const rng = new NPRng('round-dist');
            const samples = 5000;
            const ups = Array.from({ length: samples }, () => rng.round(3.2)).filter(n => n === 4).length;
            expect(ups / samples).toBeCloseTo(0.2, 1); // frac 0.2 => ~20% round up to 4
        });
    });
});
