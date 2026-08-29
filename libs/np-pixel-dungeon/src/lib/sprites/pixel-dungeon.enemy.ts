import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMob, TPixelDungeonMobOptions } from './pixel-dungeon.mob';
import { MobBrain } from './traits/mob-brain';

export interface TPixelDungeonEnemyOptions extends TPixelDungeonMobOptions {
    /**
     * The archetype id this enemy is — a key of np-config's `BESTIARY` (item #10). Loosened from the old
     * `'skeleton'` literal to a plain string now that archetypes are declarative data, not a closed union.
     * Set by `MobFactory` from the resolved `MobDef`.
     */
    type: string;
}

/**
 * Last-resort fallback options only (item #10): the real per-archetype stats now arrive from np-config's
 * `BESTIARY` via `MobFactory.defToOptions`. These keep the sheet + a safe energy/vision so a directly-newed
 * enemy (a test, an unexpected call) still constructs; `maxHp/attack/defense` deliberately fall back to
 * `mob.ts`'s minimal safety defaults rather than carrying placeholder numbers here.
 */
const defaultOptions: TPixelDungeonEnemyOptions = {
    lpcType: 'standard',
    moveRotate: false,
    type: 'skeleton',
    key: 'skeleton',
    energyGain: 50,
};

export class PixelDungeonEnemy extends PixelDungeonMob {
    override options!: TPixelDungeonEnemyOptions;
    #brain!: MobBrain;

    constructor(engine: PixelDungeonEngine, options?: TPixelDungeonEnemyOptions) {
        // options.energyGain = (Math.trunc(Math.random() * 5) + 1) * 10;
        super(engine, Object.assign({}, defaultOptions, options ?? {}));
    }

    override create() {
        super.create();
        // Build the brain after the vision trait exists (the base `create` builds it) — the brain queries
        // the mob's OWN vision each turn. The brain seed combines this enemy's archetype with its spawn
        // ordinal (its index in the engine roster) so two same-type skeletons get distinct, reproducible
        // wander streams off the dungeon seed (not `Math.random`).
        const ordinal = this.engine.mobs.indexOf(this);
        this.#brain = new MobBrain(this, `${this.options.type}#${ordinal}`);
    }

    /**
     * Decide this enemy's next action via its {@link MobBrain} (RPG cluster E). Replaces the old
     * mutation-on-read `get action()` → `#aiAction()` side-effect: the turn loop now calls this explicitly
     * before reading `action`, so the enemy's `action` getter is just the base mob's queued-action read.
     */
    override decide(): void {
        this.#brain.decide();
    }
}
