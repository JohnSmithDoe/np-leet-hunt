import { DungeonCombatParams } from '@shared/np-config';

import { resolveDamage } from './combat';

describe('resolveDamage', () => {
    const params = (minDamage: number): DungeonCombatParams => ({ minDamage });

    it('deals attack minus defense in the normal case', () => {
        expect(resolveDamage(5, 2, params(1))).toBe(3);
    });

    it('floors at minDamage when defense outweighs attack', () => {
        // 2 - 5 = -3, but a connecting hit always chips at least minDamage (1 here).
        expect(resolveDamage(2, 5, params(1))).toBe(1);
    });

    it('honours a minDamage of 0 (a fully-blocked hit can deal nothing)', () => {
        expect(resolveDamage(2, 5, params(0))).toBe(0);
        expect(resolveDamage(2, 2, params(0))).toBe(0);
    });
});
