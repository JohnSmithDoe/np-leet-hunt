import { describe, expect, it } from 'vitest';

import { toBinaryBlocks } from './paradroid.format';

describe('toBinaryBlocks', () => {
    it('renders the count as fixed-width binary blocks (▮ = 1, ▯ = 0)', () => {
        expect(toBinaryBlocks(5)).toBe('▮ ▯ ▮'); // 101
        expect(toBinaryBlocks(3)).toBe('▯ ▮ ▮'); // 011
        expect(toBinaryBlocks(0)).toBe('▯ ▯ ▯'); // 000
    });

    it('pads to the requested bit width', () => {
        expect(toBinaryBlocks(1)).toBe('▯ ▯ ▮');
        expect(toBinaryBlocks(8, 4)).toBe('▮ ▯ ▯ ▯'); // 1000
    });

    it('clamps negative and fractional inputs to a non-negative integer', () => {
        expect(toBinaryBlocks(-2)).toBe('▯ ▯ ▯');
        expect(toBinaryBlocks(2.9)).toBe('▯ ▮ ▯'); // truncated to 2 → 010
    });
});
