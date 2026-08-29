import { MobDef } from './mob.model';

/**
 * The bestiary — the single source of truth for every dungeon actor, keyed by id. This is the **extension
 * point** for monsters and player classes: to add an archetype, add one entry here (reusing an existing LPC
 * sheet — no new art). The engine resolves the player from a class entry and each enemy from its archetype
 * id; `Balance.dungeonRoster` decides which enemy ids a floor spawns, scaling with depth.
 *
 * These numbers ARE the per-archetype stats that were placeholder defaults inline in the mode lib
 * (`mob.ts`/`player.ts`/`enemy.ts`, marked `// TODO (item #10)`); they now live here alongside the other
 * declarative content (the loot catalog, the balance curve) so the mode lib stays generic and imports the
 * data rather than hard-coding it.
 *
 * Two kinds of entry share the {@link MobDef} shape:
 *  - **player classes** (e.g. `brawler`): sturdy, fast (`energyGain: 100` = acts every pump), far-sighted.
 *  - **enemies** (`skeleton`, `goblin`, …): the archetypes a floor's roster draws from. `attackRange`
 *    and `behaviour` are *reserved* for the AI tasks (#11/#12) — every archetype is melee today.
 */
export const BESTIARY: Record<string, MobDef> = {
    /**
     * The player class (relocated from `player.ts`'s placeholder defaults): sturdy and capable — far more
     * HP than a grunt, the strongest hit, a point of armour, full speed (`energyGain: 100` → acts every
     * pump), and the longest vision so the player reveals the floor. Equipment will fold into these later
     * (item #13); for now this block IS the player's stat line.
     */
    brawler: {
        id: 'brawler',
        label: 'Brawler',
        lpcKey: 'brawler',
        maxHp: 20,
        attack: 4,
        defense: 1,
        energyGain: 100,
        visionRange: 10,
        behaviour: 'melee',
    },

    /**
     * The bread-and-butter enemy (relocated from `enemy.ts`'s placeholder skeleton stats): a weak, fast
     * grunt the player out-trades one-on-one. `energyGain: 50` = acts every *other* pump, so it's half the
     * player's speed. The shallow-floor staple.
     */
    skeleton: {
        id: 'skeleton',
        label: 'Skeleton',
        lpcKey: 'skeleton',
        maxHp: 6,
        attack: 2,
        defense: 0,
        energyGain: 50,
        visionRange: 4,
        behaviour: 'melee',
        spawnWeight: 10,
    },

    /**
     * The tougher second enemy — a goblin on its **own LPC sheet** (`goblin.png`), beefier than a skeleton:
     * more HP, a harder hit, a point of armour, and a wider gaze, at the cost of being slower still
     * (`energyGain: 40`). The deep-floor threat the roster mixes in as you descend.
     */
    goblin: {
        id: 'goblin',
        label: 'Goblin',
        lpcKey: 'goblin',
        maxHp: 12,
        attack: 3,
        defense: 1,
        energyGain: 40,
        visionRange: 5,
        behaviour: 'melee',
        spawnWeight: 4,
    },
};

/**
 * The fallback archetype for an unknown id — a sane, modest melee grunt so a stale roster id can never crash
 * the factory (`Balance.mobDef` returns a copy of this for any id not in {@link BESTIARY}). Kept out of the
 * bestiary proper so it can't be spawned by name; it only ever surfaces as a defensive default.
 */
export const DEFAULT_MOB_DEF: MobDef = {
    id: 'unknown',
    label: 'Unknown',
    lpcKey: 'skeleton',
    maxHp: 5,
    attack: 1,
    defense: 0,
    energyGain: 50,
    visionRange: 3,
    behaviour: 'melee',
};
