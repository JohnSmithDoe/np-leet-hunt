import { Balance } from './balance';
import { DuelAiLevel, DuelBoardLevel, SECTOR_COUNT, SECTOR_ORDER } from './balance.model';

describe('Balance.sector', () => {
    it('has five sectors in the grey-gradient order', () => {
        expect(SECTOR_COUNT).toBe(5);
        expect(SECTOR_ORDER).toEqual(['home-reach', 'frozen-drift', 'ember-belt', 'veiled-nebula', 'long-quiet']);
    });

    it('resolves id + number from the 1-based sector number', () => {
        for (let n = 1; n <= SECTOR_COUNT; n++) {
            const sector = Balance.sector(n);
            expect(sector.number).toBe(n);
            expect(sector.id).toBe(SECTOR_ORDER[n - 1]);
        }
    });

    it('clamps out-of-range numbers into 1..SECTOR_COUNT', () => {
        expect(Balance.sector(0).number).toBe(1);
        expect(Balance.sector(-3).number).toBe(1);
        expect(Balance.sector(99).number).toBe(SECTOR_COUNT);
    });

    it('scales difficulty monotonically with depth: planets up, exits down, grey faster', () => {
        const curve = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.sector(i + 1));
        for (let i = 1; i < curve.length; i++) {
            expect(curve[i].planetCount).toBeGreaterThan(curve[i - 1].planetCount);
            expect(curve[i].exits).toBeLessThanOrEqual(curve[i - 1].exits);
            expect(curve[i].frontSteps).toBeLessThan(curve[i - 1].frontSteps); // fewer jumps to cross = faster grey
        }
    });

    it('returns a detached copy of the params (mutating the result is safe)', () => {
        const a = Balance.sector(1);
        a.planetCount = 999;
        expect(Balance.sector(1).planetCount).not.toBe(999);
    });
});

describe('Balance duel params', () => {
    const BOARD_LEVELS: DuelBoardLevel[] = ['debug', 'easy', 'normal', 'hard', 'brutal'];
    const AI_LEVELS: DuelAiLevel[] = ['easy', 'normal', 'hard', 'brutal'];

    it('resolves board knobs per level and clamps unknown levels to normal', () => {
        expect(Balance.duelBoardParams('brutal')).toEqual({ changerRate: 15, autoFireRate: 0 });
        expect(Balance.duelBoardParams('easy')).toEqual({ changerRate: -1, autoFireRate: 10 });
        expect(Balance.duelBoardParams('bogus' as DuelBoardLevel)).toEqual(Balance.duelBoardParams('normal'));
    });

    it('caps the AI fire rate at the 250ms human floor on every level', () => {
        for (const level of AI_LEVELS) {
            expect(Balance.duelAiParams(level).shotCooldownMs).toBe(250);
        }
    });

    it('scales AI skill up the ladder: faster, cleaner, more deliberate', () => {
        const curve = AI_LEVELS.map(level => Balance.duelAiParams(level));
        for (let i = 1; i < curve.length; i++) {
            expect(curve[i].reactionMs).toBeLessThanOrEqual(curve[i - 1].reactionMs);
            expect(curve[i].scoreNoise).toBeLessThanOrEqual(curve[i - 1].scoreNoise);
            expect(curve[i].blunderChance).toBeLessThanOrEqual(curve[i - 1].blunderChance);
        }
        expect(Balance.duelAiParams('hard').usesTiming).toBe(true);
        expect(Balance.duelAiParams('easy').usesTiming).toBe(false);
        expect(Balance.duelAiParams('bogus' as DuelAiLevel)).toEqual(Balance.duelAiParams('normal'));
    });

    it('returns detached copies (mutating the result is safe)', () => {
        const a = Balance.duelAiParams('normal');
        a.reactionMs = 1;
        expect(Balance.duelAiParams('normal').reactionMs).not.toBe(1);
        expect(BOARD_LEVELS).toHaveLength(5);
    });
});
