import { ItemDef } from '@shared/np-config';

import { resolveDamage } from '../../engine/combat';
import { PixelDungeonMob } from '../pixel-dungeon.mob';
import { MobCombat } from './mob-combat';

// A stub mob exposing only the options MobCombat reads — the trait is deliberately Phaser-free, so it
// constructs and tests headless (no scene, no board).
const stubMob = (maxHp: number, attack: number, defense: number) =>
    ({ options: { maxHp, attack, defense } }) as unknown as PixelDungeonMob;

// Minimal equipment defs for the fold tests — just the fields MobCombat reads (slot + mods).
const weapon = (attack: number): ItemDef => ({ id: 'w', kind: 'key', label: 'Blade', slot: 'weapon', mods: { attack } });
const armor = (defense: number, maxHp: number): ItemDef => ({
    id: 'a',
    kind: 'key',
    label: 'Vest',
    slot: 'armor',
    mods: { defense, maxHp },
});

describe('MobCombat', () => {
    it('starts at full health and exposes its stats from the mob options', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        expect(combat.maxHp).toBe(10);
        expect(combat.hp).toBe(10);
        expect(combat.attack).toBe(3);
        expect(combat.defense).toBe(1);
        expect(combat.fraction).toBe(1);
        expect(combat.isDead).toBe(false);
    });

    it('applyDamage reduces hp and clamps at 0 (never negative)', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.applyDamage(4);
        expect(combat.hp).toBe(6);
        expect(combat.fraction).toBeCloseTo(0.6);
        combat.applyDamage(100);
        expect(combat.hp).toBe(0);
        expect(combat.isDead).toBe(true);
    });

    it('isDead flips the moment hp reaches 0', () => {
        const combat = new MobCombat(stubMob(5, 1, 0));
        expect(combat.isDead).toBe(false);
        combat.applyDamage(5);
        expect(combat.isDead).toBe(true);
    });

    it('heal restores hp but clamps to maxHp (no overfill)', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.applyDamage(7);
        expect(combat.hp).toBe(3);
        combat.heal(2);
        expect(combat.hp).toBe(5);
        combat.heal(100);
        expect(combat.hp).toBe(10);
    });

    it('guards a zero maxHp so fraction never NaNs', () => {
        const combat = new MobCombat(stubMob(0, 1, 0));
        expect(combat.fraction).toBe(0);
        expect(combat.isDead).toBe(true);
    });
});

describe('MobCombat equipment fold (item #13)', () => {
    it('reads base stats with nothing equipped (the fold is a no-op)', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        expect(combat.equipped).toEqual({});
        expect(combat.attack).toBe(3);
        expect(combat.defense).toBe(1);
        expect(combat.maxHp).toBe(10);
    });

    it('equipping a weapon raises attack by its mod, leaving defense/maxHp untouched', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip(weapon(2));
        expect(combat.attack).toBe(5); // 3 base + 2 mod
        expect(combat.defense).toBe(1); // unchanged
        expect(combat.maxHp).toBe(10); // unchanged
    });

    it('equipping armor raises defense and maxHp by its mods', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip(armor(2, 5));
        expect(combat.defense).toBe(3); // 1 base + 2 mod
        expect(combat.maxHp).toBe(15); // 10 base + 5 mod
        expect(combat.attack).toBe(3); // unchanged
    });

    it('folds across both slots at once (weapon + armor add independently)', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip(weapon(2));
        combat.equip(armor(1, 4));
        expect(combat.attack).toBe(5);
        expect(combat.defense).toBe(2);
        expect(combat.maxHp).toBe(14);
    });

    it('unequip reverts the stat to base', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip(weapon(2));
        expect(combat.attack).toBe(5);
        combat.unequip('weapon');
        expect(combat.attack).toBe(3);
        expect(combat.equipped).toEqual({});
    });

    it('re-equipping a slot replaces its occupant (no double-stacking)', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip(weapon(2));
        combat.equip(weapon(5)); // same slot — replaces, not adds
        expect(combat.attack).toBe(8); // 3 base + 5 mod (not 3 + 2 + 5)
    });

    it('ignores a non-equipment item (no slot) — base stats stand', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip({ id: 'coin', kind: 'coin', label: 'Marble', value: 1 });
        expect(combat.equipped).toEqual({});
        expect(combat.attack).toBe(3);
    });

    it('does NOT refill current HP when a +maxHp item is equipped (only the cap moves)', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.applyDamage(4); // hp 6 / 10
        combat.equip(armor(0, 5)); // cap → 15, but current hp stays at 6
        expect(combat.maxHp).toBe(15);
        expect(combat.hp).toBe(6);
    });

    it('clamps current HP down if an unequip lowers the cap below it', () => {
        const combat = new MobCombat(stubMob(10, 3, 1));
        combat.equip(armor(0, 5)); // cap 15
        combat.heal(100); // hp 15 / 15
        combat.unequip('armor'); // cap back to 10 → hp clamps to 10
        expect(combat.maxHp).toBe(10);
        expect(combat.hp).toBe(10);
    });

    it('an equipped attacker deals more via resolveDamage — the formula stays untouched', () => {
        const params = { minDamage: 1 };
        const attacker = new MobCombat(stubMob(10, 3, 0));
        const defender = new MobCombat(stubMob(10, 0, 1));

        const baseDamage = resolveDamage(attacker.attack, defender.defense, params); // 3 - 1 = 2
        attacker.equip(weapon(2)); // attack 3 → 5
        const armedDamage = resolveDamage(attacker.attack, defender.defense, params); // 5 - 1 = 4

        expect(baseDamage).toBe(2);
        expect(armedDamage).toBe(4);
        expect(armedDamage).toBeGreaterThan(baseDamage);
    });
});
