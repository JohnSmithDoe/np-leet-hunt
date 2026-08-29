import { MobDef } from '@shared/np-config';

import { MobFactory } from './mob-factory';

// `defToOptions` is the pure half of the factory: a plain MobDef in, plain options out, no engine/scene/
// Phaser — so it tests headless (the style of the bestiary / combat specs). We stand up a literal def and
// assert every bestiary field lands on the right option, which is the contract the engine relies on.
const def: MobDef = {
    id: 'goblin',
    label: 'Goblin',
    lpcKey: 'goblin',
    maxHp: 12,
    attack: 3,
    defense: 1,
    energyGain: 40,
    visionRange: 5,
    behaviour: 'melee',
};

describe('MobFactory.defToOptions', () => {
    it('maps a MobDef onto the enemy options field-for-field', () => {
        const options = MobFactory.defToOptions(def);
        expect(options.type).toBe('goblin'); // the archetype id becomes the enemy type
        expect(options.key).toBe('goblin'); // lpcKey picks the spritesheet
        expect(options.maxHp).toBe(12);
        expect(options.attack).toBe(3);
        expect(options.defense).toBe(1);
        expect(options.energyGain).toBe(40);
        expect(options.visionRange).toBe(5);
    });

    it('carries the combat numbers straight through (no placeholder defaults applied here)', () => {
        const weak: MobDef = { ...def, id: 'skeleton', maxHp: 6, attack: 2, defense: 0, energyGain: 50 };
        const options = MobFactory.defToOptions(weak);
        expect(options.maxHp).toBe(6);
        expect(options.attack).toBe(2);
        expect(options.defense).toBe(0);
        expect(options.energyGain).toBe(50);
    });

    it('is pure — does not mutate the source def', () => {
        const snapshot = { ...def };
        MobFactory.defToOptions(def);
        expect(def).toEqual(snapshot);
    });
});
