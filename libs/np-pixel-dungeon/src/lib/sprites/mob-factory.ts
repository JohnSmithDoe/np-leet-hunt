import { MobDef } from '@shared/np-config';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonEnemy, TPixelDungeonEnemyOptions } from './pixel-dungeon.enemy';

/**
 * Turns a declarative {@link MobDef} (np-config's bestiary entry) into a live dungeon enemy (item #10 / F3).
 * This is the seam that replaces the engine's old hard-coded `new PixelDungeonEnemy({type:'skeleton'})`
 * loop: the *data* (which monster, what stats) lives in np-config, the *construction* lives here, and the
 * engine just hands a list of archetype ids to spawn. Adding a monster is now a bestiary entry, not an
 * engine edit.
 *
 * The mapping half ({@link defToOptions}) is deliberately **pure and Phaser-free** — it takes a plain
 * `MobDef` and returns plain options, touching no engine or scene — so it unit-tests headless (cf.
 * `mob-factory.spec.ts`), the way `resolveDamage` / the bestiary resolvers test. Only {@link spawn}
 * touches the engine, by constructing the actual `PixelDungeonEnemy`.
 */
export class MobFactory {
    /**
     * Map a bestiary {@link MobDef} to the enemy options that carry its stats into the mob (item #10). Pure:
     * no engine, no scene, no Phaser — just a field copy, so it tests in isolation. The def's `lpcKey` picks
     * the spritesheet, `id` becomes the enemy's archetype `type`, and the combat/movement numbers
     * (`maxHp/attack/defense`, `energyGain`, `visionRange`) flow straight through — these are the values
     * that used to be placeholder defaults inline in `enemy.ts`, now sourced from np-config.
     */
    static defToOptions(def: MobDef): TPixelDungeonEnemyOptions {
        return {
            type: def.id,
            key: def.lpcKey,
            maxHp: def.maxHp,
            attack: def.attack,
            defense: def.defense,
            energyGain: def.energyGain,
            visionRange: def.visionRange,
        };
    }

    /**
     * Build a live enemy for an archetype on the given engine (item #10): the impure half — it constructs a
     * `PixelDungeonEnemy` against the engine, mapping the def through {@link defToOptions}. The engine pushes
     * the result onto `this.mobs`; placement on a spawn tile is the engine's job (`#addMobs`), unchanged.
     */
    static spawn(engine: PixelDungeonEngine, def: MobDef): PixelDungeonEnemy {
        return new PixelDungeonEnemy(engine, MobFactory.defToOptions(def));
    }
}
