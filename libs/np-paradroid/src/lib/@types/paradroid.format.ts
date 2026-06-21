/** Pure display formatting for the duel — no Phaser, so it unit-tests directly. */

/**
 * Render a whole-second count as a fixed-width binary block readout — the on-theme "binary clock" nod for
 * the grid-selection countdown (Leet-40). E.g. `toBinaryBlocks(5)` → `"▮ ▯ ▮"` (101), `toBinaryBlocks(3)`
 * → `"▯ ▮ ▮"` (011). Negative / fractional inputs clamp to a non-negative integer.
 */
export const toBinaryBlocks = (n: number, bits = 3): string =>
    Math.max(0, Math.trunc(n))
        .toString(2)
        .padStart(bits, '0')
        .split('')
        .map(bit => (bit === '1' ? '▮' : '▯'))
        .join(' ');
