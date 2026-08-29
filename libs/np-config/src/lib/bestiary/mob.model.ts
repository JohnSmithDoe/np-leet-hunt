/**
 * How a mob makes decisions, as a coarse archetype tag. **Reserved for the AI tasks (#11/#12)** — the
 * `MobBrain` trait will branch on it (`melee` walks-and-hits, `ranged` keeps distance and fires, `caster`
 * lobs effects). It is *declared now* so the bestiary already speaks the vocabulary and the data lands with
 * the roster, but nothing reads it yet; every entry defaults to `melee`. A closed string union, the np-state
 * idiom (cf. `EItemKind`, `DuelAiLevel`), so every consumer speaks the same words.
 */
export type EBehaviourTag = 'melee' | 'ranged' | 'caster';

/**
 * One entry in the {@link BESTIARY} — the single declarative description of a dungeon actor, keyed by id.
 * Pure data (plain numbers + a sheet key + tags), so np-config stays free of any np-pixel-dungeon type: the
 * mode lib's `MobFactory` maps a `MobDef` into engine options, it never imports an engine class through here.
 *
 * These ARE the per-archetype combat/movement numbers that used to live as placeholder defaults inline in
 * the mode lib (`mob.ts`/`player.ts`/`enemy.ts`, marked `// TODO (item #10)`); they now live here, the way
 * {@link ITEMS} owns the loot numbers — "balance is central, data in np-config". Both player classes and
 * enemies share the shape: the player is just a `MobDef` the engine resolves to build `PixelDungeonPlayer`.
 *
 * `lpcKey` selects one of the LPC sheets that ship today (`brawler` / `skeleton` / `goblin`). A new
 * archetype usually reuses an existing sheet (different stats, same pixels); add a sheet only when a
 * genuinely new creature is introduced (as `goblin` was).
 */
export interface MobDef {
    /** Stable catalog key — also the archetype id the roster carries and the mob's `type`. */
    id: string;
    /** Human-readable name (for floaters / debug). */
    label: string;
    /** Which LPC spritesheet to draw with. One of the sheets that ship today. */
    lpcKey: 'brawler' | 'skeleton' | 'goblin';
    /** Maximum hit points (the combat-spine HP). Full on spawn. */
    maxHp: number;
    /** Attack power — the `attack` side of the pure `resolveDamage(attack − defense)`. */
    attack: number;
    /** Defense — the `defense` side; soaks damage down to the `minDamage` floor. */
    defense: number;
    /**
     * Energy gained per turn pump (the speed economy): 100 = acts every pump (the player), 50 = every other
     * pump, etc. So a "fast" enemy is pure data — a higher `energyGain`, not a control-flow branch.
     */
    energyGain: number;
    /** How many tiles the mob can see (its field-of-view radius). */
    visionRange: number;
    /**
     * Reserved (#11/#12 — ranged/caster AI): how far the mob can strike without stepping adjacent. Absent
     * today (every archetype is melee); `RangedAttackAction` will read it when ranged combat lands. Carried
     * now so the bestiary shape is forward-compatible and the data can be filled before the code that uses it.
     */
    attackRange?: number;
    /**
     * Reserved (#11/#12 — AI): the decision archetype ({@link EBehaviourTag}). The `MobBrain` will branch on
     * it. Optional; absent means `melee` (today's only behaviour). Declared now so the roster carries it.
     */
    behaviour?: EBehaviourTag;
    /**
     * Reserved (#10+ — weighted spawning): relative likelihood this archetype is picked when a floor's roster
     * is drawn by weight rather than a fixed list. `Balance.dungeonRoster` returns a deterministic list today,
     * so this is carried but unread; it exists so a future weighted draw needs no schema change.
     */
    spawnWeight?: number;
    /**
     * Reserved (#10+ — spawn caps): the most of this archetype a single floor may hold, for a future capped
     * weighted draw. Unread today (the roster is an explicit list); carried for forward-compatibility.
     */
    maxPerFloor?: number;
}
