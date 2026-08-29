import { Balance } from '../balance/balance';
import { SECTOR_COUNT } from '../balance/balance.model';
import { BESTIARY } from './bestiary';

/** The LPC sheets that ship today — a bestiary entry's `lpcKey` must be one of these. */
const VALID_SHEETS = new Set(['brawler', 'skeleton', 'goblin']);

describe('BESTIARY catalog', () => {
    it('keys every entry by its own id', () => {
        for (const [key, def] of Object.entries(BESTIARY)) {
            expect(def.id).toBe(key);
        }
    });

    it('only references LPC sheets that actually ship (no new art)', () => {
        for (const def of Object.values(BESTIARY)) {
            expect(VALID_SHEETS.has(def.lpcKey), `unknown sheet "${def.lpcKey}" for "${def.id}"`).toBe(true);
        }
    });

    it('carries a player class (brawler) that is sturdy, full-speed and far-sighted', () => {
        const player = BESTIARY['brawler'];
        expect(player).toBeDefined();
        expect(player.energyGain).toBe(100); // acts every pump
        expect(player.visionRange).toBe(10);
        expect(player.maxHp).toBeGreaterThan(BESTIARY['skeleton'].maxHp); // tougher than a grunt
    });

    it('carries at least two enemy archetypes (a weak skeleton and a tougher goblin)', () => {
        const enemies = Object.values(BESTIARY).filter(def => def.id !== 'brawler');
        expect(enemies.length).toBeGreaterThanOrEqual(2);
        // the goblin is the tougher second enemy — it out-stats the basic skeleton
        expect(BESTIARY['goblin'].maxHp).toBeGreaterThan(BESTIARY['skeleton'].maxHp);
        expect(BESTIARY['goblin'].attack).toBeGreaterThan(BESTIARY['skeleton'].attack);
    });

    it('gives every entry well-formed positive stats and a non-empty label', () => {
        for (const def of Object.values(BESTIARY)) {
            expect(def.label.length).toBeGreaterThan(0);
            expect(def.maxHp).toBeGreaterThan(0);
            expect(def.energyGain).toBeGreaterThan(0);
            expect(def.visionRange).toBeGreaterThan(0);
            expect(def.attack).toBeGreaterThanOrEqual(0);
            expect(def.defense).toBeGreaterThanOrEqual(0);
        }
    });
});

describe('Balance.mobDef', () => {
    it('resolves a known archetype to its bestiary stats', () => {
        expect(Balance.mobDef('skeleton')).toEqual(BESTIARY['skeleton']);
    });

    it('falls back to a sane default for an unknown id (never crashes the factory)', () => {
        const def = Balance.mobDef('does-not-exist');
        expect(def.maxHp).toBeGreaterThan(0);
        expect(VALID_SHEETS.has(def.lpcKey)).toBe(true);
    });

    it('returns a fresh copy each call (mutating the result is safe)', () => {
        const a = Balance.mobDef('skeleton');
        a.maxHp = 999;
        expect(Balance.mobDef('skeleton').maxHp).not.toBe(999);
        expect(BESTIARY['skeleton'].maxHp).not.toBe(999);
    });
});

describe('Balance.dungeonRoster', () => {
    it('only spawns archetype ids that exist in the BESTIARY', () => {
        for (let n = 1; n <= SECTOR_COUNT; n++) {
            for (const id of Balance.dungeonRoster(n)) {
                expect(BESTIARY[id], `unknown roster id "${id}" at sector ${n}`).toBeDefined();
            }
        }
    });

    it('scales the count with depth — a deeper floor never spawns fewer than a shallower one', () => {
        const counts = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.dungeonRoster(i + 1).length);
        for (let i = 1; i < counts.length; i++) {
            expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
        }
        // and it genuinely grows over the run, not a flat line
        expect(counts[counts.length - 1]).toBeGreaterThan(counts[0]);
    });

    it('hardens the mix with depth — more of the tougher variant the deeper you go', () => {
        const warriors = Array.from(
            { length: SECTOR_COUNT },
            (_, i) => Balance.dungeonRoster(i + 1).filter(id => id === 'goblin').length
        );
        expect(warriors[0]).toBe(0); // sector 1 is all weak grunts
        for (let i = 1; i < warriors.length; i++) {
            expect(warriors[i]).toBeGreaterThanOrEqual(warriors[i - 1]);
        }
        expect(warriors[warriors.length - 1]).toBeGreaterThan(0); // the deepest floor has at least one
    });

    it('never spawns more tough variants than the floor holds', () => {
        for (let n = 1; n <= SECTOR_COUNT; n++) {
            const roster = Balance.dungeonRoster(n);
            const warriors = roster.filter(id => id === 'goblin').length;
            expect(warriors).toBeLessThanOrEqual(roster.length);
        }
    });

    it('clamps out-of-range sector numbers to the endpoints', () => {
        expect(Balance.dungeonRoster(0)).toEqual(Balance.dungeonRoster(1));
        expect(Balance.dungeonRoster(99)).toEqual(Balance.dungeonRoster(SECTOR_COUNT));
    });

    it('returns a fresh array each call (mutating the result is safe)', () => {
        const a = Balance.dungeonRoster(1);
        const length = a.length;
        a.push('skeleton');
        expect(Balance.dungeonRoster(1).length).toBe(length);
    });
});
