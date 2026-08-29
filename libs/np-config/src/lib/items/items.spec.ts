import { Balance } from '../balance/balance';
import { SECTOR_COUNT } from '../balance/balance.model';
import { ITEMS } from './items';

describe('ITEMS catalog', () => {
    it('keys every entry by its own id', () => {
        for (const [key, def] of Object.entries(ITEMS)) {
            expect(def.id).toBe(key);
        }
    });

    it('has a coin worth a positive marble value', () => {
        expect(ITEMS['coin']).toBeDefined();
        expect(ITEMS['coin'].kind).toBe('coin');
        expect(ITEMS['coin'].value).toBeGreaterThan(0);
    });

    it('carries at least one non-coin item with a usable effect (the inventory path)', () => {
        const nonCoins = Object.values(ITEMS).filter(def => def.kind !== 'coin');
        expect(nonCoins.length).toBeGreaterThan(0);
        // the medkit proves the effect shape (a heal that the dungeon reads later)
        expect(ITEMS['medkit'].effect?.heal).toBeGreaterThan(0);
    });

    it('gives every entry a kind and a non-empty label', () => {
        for (const def of Object.values(ITEMS)) {
            expect(def.kind).toBeTruthy();
            expect(def.label.length).toBeGreaterThan(0);
        }
    });

    it('carries equipment entries that are well-formed (a slot + mods)', () => {
        // Equipment is distinguished by the presence of a `slot` (item #13) — not a dedicated EItemKind.
        const equipment = Object.values(ITEMS).filter(def => def.slot !== undefined);
        expect(equipment.length).toBeGreaterThan(0);
        for (const def of equipment) {
            expect(['weapon', 'armor', 'trinket']).toContain(def.slot);
            expect(def.mods).toBeDefined();
            // At least one stat modifier present, and every present modifier is a finite number.
            const mods = def.mods!;
            const present = [mods.attack, mods.defense, mods.maxHp].filter(v => v !== undefined);
            expect(present.length).toBeGreaterThan(0);
            for (const v of present) expect(Number.isFinite(v)).toBe(true);
        }
    });

    it('keeps non-equipment items free of slot/mods', () => {
        // A coin / potion / key-without-gear / food omits both, so its presence is the equipment marker.
        expect(ITEMS['coin'].slot).toBeUndefined();
        expect(ITEMS['coin'].mods).toBeUndefined();
        expect(ITEMS['medkit'].slot).toBeUndefined();
        expect(ITEMS['medkit'].mods).toBeUndefined();
    });

    it('has a weapon granting +attack and armor granting +defense/+maxHp', () => {
        expect(ITEMS['rustyBlade'].slot).toBe('weapon');
        expect(ITEMS['rustyBlade'].mods?.attack).toBeGreaterThan(0);
        expect(ITEMS['scrapVest'].slot).toBe('armor');
        expect(ITEMS['scrapVest'].mods?.defense).toBeGreaterThan(0);
        expect(ITEMS['scrapVest'].mods?.maxHp).toBeGreaterThan(0);
    });
});

describe('Balance.startingEquipment', () => {
    it('returns ids that all exist in the ITEMS catalog and are equipment (carry a slot)', () => {
        const ids = Balance.startingEquipment();
        expect(ids.length).toBeGreaterThan(0);
        for (const id of ids) {
            expect(ITEMS[id], `unknown starting-equipment id "${id}"`).toBeDefined();
            expect(ITEMS[id].slot, `starting-equipment id "${id}" is not equipment`).toBeDefined();
        }
    });

    it('returns a fresh array each call (mutating the result is safe)', () => {
        const a = Balance.startingEquipment();
        const length = a.length;
        a.push('coin');
        expect(Balance.startingEquipment().length).toBe(length);
    });

    it('accepts a pet class without changing the well-formed contract', () => {
        for (const id of Balance.startingEquipment(7)) {
            expect(ITEMS[id]).toBeDefined();
        }
    });
});

describe('Balance.dungeonLoot', () => {
    it('only scatters ids that exist in the ITEMS catalog', () => {
        for (let n = 1; n <= SECTOR_COUNT; n++) {
            for (const id of Balance.dungeonLoot(n)) {
                expect(ITEMS[id], `unknown loot id "${id}" at sector ${n}`).toBeDefined();
            }
        }
    });

    it('scales loot with depth — a deeper floor never pays less than a shallower one', () => {
        const counts = Array.from({ length: SECTOR_COUNT }, (_, i) => Balance.dungeonLoot(i + 1).length);
        for (let i = 1; i < counts.length; i++) {
            expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
        }
        // and it genuinely grows over the run, not a flat line
        expect(counts[counts.length - 1]).toBeGreaterThan(counts[0]);
    });

    it('clamps out-of-range sector numbers to the endpoints', () => {
        expect(Balance.dungeonLoot(0)).toEqual(Balance.dungeonLoot(1));
        expect(Balance.dungeonLoot(99)).toEqual(Balance.dungeonLoot(SECTOR_COUNT));
    });

    it('returns a fresh array each call (mutating the result is safe)', () => {
        const a = Balance.dungeonLoot(1);
        const length = a.length;
        a.push('coin');
        expect(Balance.dungeonLoot(1).length).toBe(length);
    });
});
