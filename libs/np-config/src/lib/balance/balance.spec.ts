import { Balance } from './balance';
import { DungeonAiParams, DuelAiLevel, DuelBoardLevel, DungeonPlan, SECTOR_COUNT, SECTOR_ORDER } from './balance.model';

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

    it('exposes a route-density knob that stays connectable (>= 2 every sector)', () => {
        for (let n = 1; n <= SECTOR_COUNT; n++) {
            expect(Balance.sector(n).linkDegree).toBeGreaterThanOrEqual(2);
        }
    });

    it('raises the Grey Fleet intercept chance with depth, kept in 0..100', () => {
        const curve = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.sector(i + 1).interceptChance);
        for (const chance of curve) {
            expect(chance).toBeGreaterThanOrEqual(0);
            expect(chance).toBeLessThanOrEqual(100);
        }
        for (let i = 1; i < curve.length; i++) {
            expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1]);
        }
        expect(curve[curve.length - 1]).toBeGreaterThan(curve[0]); // it genuinely climbs
    });
});

describe('Balance.rescueForSector', () => {
    it('holds the sibling behind the final guardian (GDD §5), family across the rest', () => {
        expect(Balance.rescueForSector(SECTOR_COUNT)).toBe('sibling');
        const earlier = Array.from({ length: SECTOR_COUNT - 1 }, (_, i) => Balance.rescueForSector(i + 1));
        expect(earlier).not.toContain('sibling');
        expect(new Set(earlier).size).toBe(SECTOR_COUNT - 1); // each of mom/dad/grandma/grandpa exactly once
    });

    it('clamps out-of-range sector numbers like the rest of the curve', () => {
        expect(Balance.rescueForSector(0)).toBe(Balance.rescueForSector(1));
        expect(Balance.rescueForSector(99)).toBe('sibling');
    });
});

describe('Balance.duelAiForPet', () => {
    it('softens the AI one notch per tier of pet class, floored at easy (Leet-39)', () => {
        expect(Balance.duelAiForPet('brutal', 1)).toBe('brutal'); // base class = no easing
        expect(Balance.duelAiForPet('brutal', 3)).toBe('hard'); // +2 classes = 1 notch (PET_CLASS_PER_NOTCH=2)
        expect(Balance.duelAiForPet('brutal', 5)).toBe('normal'); // +4 classes = 2 notches
        expect(Balance.duelAiForPet('normal', 99)).toBe('easy'); // never eases below the easiest level
    });

    it('leaves an unknown level untouched', () => {
        expect(Balance.duelAiForPet('bogus' as DuelAiLevel, 9)).toBe('bogus');
    });
});

describe('Balance.duelRows', () => {
    it('grows the board with sector depth: a 4-row mini-duel up to a 12-row full board (Leet-38)', () => {
        expect(Balance.duelRows(1)).toBe(4);
        expect(Balance.duelRows(3)).toBe(8);
        expect(Balance.duelRows(SECTOR_COUNT)).toBe(12);
    });

    it('rises monotonically across the run', () => {
        const curve = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.duelRows(i + 1));
        for (let i = 1; i < curve.length; i++) expect(curve[i]).toBeGreaterThan(curve[i - 1]);
    });

    it('clamps out-of-range sectors to the endpoints', () => {
        expect(Balance.duelRows(0)).toBe(4);
        expect(Balance.duelRows(99)).toBe(12);
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

describe('Balance.dungeonCombatParams', () => {
    it('resolves the dungeon combat tuning with a minDamage floor of 1', () => {
        expect(Balance.dungeonCombatParams()).toEqual({ minDamage: 1 });
    });

    it('returns a detached copy each call (mutating the result is safe)', () => {
        const a = Balance.dungeonCombatParams();
        a.minDamage = 99;
        expect(Balance.dungeonCombatParams().minDamage).toBe(1);
    });
});

describe('Balance.dungeonPlan', () => {
    it('returns the expected DungeonPlan shape (trapCount + lockCount numbers)', () => {
        const plan: DungeonPlan = Balance.dungeonPlan(1);
        expect(Object.keys(plan).sort()).toEqual(['lockCount', 'trapCount']);
        expect(typeof plan.trapCount).toBe('number');
        expect(typeof plan.lockCount).toBe('number');
    });

    it('starts at zero traps/locks in sector 1 (step-0 floors are bare beyond the stairs)', () => {
        expect(Balance.dungeonPlan(1)).toEqual({ trapCount: 0, lockCount: 0 });
    });

    it('scales the budgets up with depth (more traps and locks the deeper you go)', () => {
        const curve = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.dungeonPlan(i + 1));
        for (let i = 1; i < curve.length; i++) {
            expect(curve[i].trapCount).toBeGreaterThanOrEqual(curve[i - 1].trapCount);
            expect(curve[i].lockCount).toBeGreaterThanOrEqual(curve[i - 1].lockCount);
        }
        // deepest sector strictly out-traps and out-locks sector 1 (the curve actually moves)
        expect(curve[SECTOR_COUNT - 1].trapCount).toBeGreaterThan(curve[0].trapCount);
        expect(curve[SECTOR_COUNT - 1].lockCount).toBeGreaterThan(curve[0].lockCount);
    });

    it('clamps out-of-range sector numbers like every other resolver', () => {
        expect(Balance.dungeonPlan(0)).toEqual(Balance.dungeonPlan(1));
        expect(Balance.dungeonPlan(99)).toEqual(Balance.dungeonPlan(SECTOR_COUNT));
    });

    it('returns a detached copy each call (mutating the result is safe)', () => {
        const a = Balance.dungeonPlan(3);
        a.trapCount = 999;
        a.lockCount = 999;
        const b = Balance.dungeonPlan(3);
        expect(b.trapCount).not.toBe(999);
        expect(b.lockCount).not.toBe(999);
    });
});

describe('Balance.dungeonAiParams', () => {
    const KEYS: (keyof DungeonAiParams)[] = [
        'sightRange',
        'wakeOnSpotRadius',
        'loseTargetAfterTurns',
        'wanderChance',
        'fleeBelowHpPct',
        'alertRadius',
    ];

    it('returns the full DungeonAiParams shape (all six numeric knobs)', () => {
        const params: DungeonAiParams = Balance.dungeonAiParams(1);
        expect(Object.keys(params).sort()).toEqual([...KEYS].sort());
        for (const key of KEYS) expect(typeof params[key]).toBe('number');
    });

    it('carries sane sector-1 baselines (forgiving floor: modest sight, fights to a quarter HP)', () => {
        const p = Balance.dungeonAiParams(1);
        expect(p.sightRange).toBe(4);
        expect(p.wakeOnSpotRadius).toBe(3);
        expect(p.loseTargetAfterTurns).toBe(4);
        expect(p.fleeBelowHpPct).toBeGreaterThan(0);
        expect(p.fleeBelowHpPct).toBeLessThan(1);
        expect(p.wanderChance).toBeGreaterThanOrEqual(0);
        expect(p.wanderChance).toBeLessThanOrEqual(1);
    });

    it('scales the difficulty knobs up with depth: farther sight, lighter sleep, flee sooner', () => {
        const curve = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.dungeonAiParams(i + 1));
        for (let i = 1; i < curve.length; i++) {
            expect(curve[i].sightRange).toBeGreaterThanOrEqual(curve[i - 1].sightRange);
            expect(curve[i].wakeOnSpotRadius).toBeGreaterThanOrEqual(curve[i - 1].wakeOnSpotRadius);
            expect(curve[i].fleeBelowHpPct).toBeGreaterThanOrEqual(curve[i - 1].fleeBelowHpPct);
        }
        // the curve actually moves over the run, not a flat line
        expect(curve[SECTOR_COUNT - 1].sightRange).toBeGreaterThan(curve[0].sightRange);
        expect(curve[SECTOR_COUNT - 1].fleeBelowHpPct).toBeGreaterThan(curve[0].fleeBelowHpPct);
    });

    it('keeps the feel knobs flat across depth (give-up memory + wander chance are not difficulty)', () => {
        const curve = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.dungeonAiParams(i + 1));
        for (const p of curve) {
            expect(p.loseTargetAfterTurns).toBe(curve[0].loseTargetAfterTurns);
            expect(p.wanderChance).toBe(curve[0].wanderChance);
        }
    });

    it('clamps the scaled knobs so a deep floor is never omniscient nor already-fleeing', () => {
        for (let n = 1; n <= 99; n++) {
            const p = Balance.dungeonAiParams(n);
            expect(p.sightRange).toBeLessThanOrEqual(9);
            expect(p.wakeOnSpotRadius).toBeLessThanOrEqual(9);
            expect(p.fleeBelowHpPct).toBeLessThan(1);
        }
    });

    it('clamps out-of-range sector numbers like every other resolver', () => {
        expect(Balance.dungeonAiParams(0)).toEqual(Balance.dungeonAiParams(1));
        expect(Balance.dungeonAiParams(99)).toEqual(Balance.dungeonAiParams(SECTOR_COUNT));
    });

    it('returns a detached copy each call (mutating the result is safe)', () => {
        const a = Balance.dungeonAiParams(2);
        a.sightRange = 999;
        a.fleeBelowHpPct = 999;
        const b = Balance.dungeonAiParams(2);
        expect(b.sightRange).not.toBe(999);
        expect(b.fleeBelowHpPct).not.toBe(999);
    });
});
