import { CrewMember, SectorId } from '../model/run-context';

/**
 * Difficulty tier — a future global knob over the whole balance surface. Only `normal` is tuned today;
 * the type exists so the balance table and its callers already speak tiers. (GDD §4 difficulty knobs.)
 */
export type DifficultyTier = 'story' | 'normal' | 'hard';

/** The fixed sector order of a run — the grey gradient, vivid → drained (GDD §5). Index 0 = sector 1. */
export const SECTOR_ORDER: readonly SectorId[] = [
    'home-reach',
    'frozen-drift',
    'ember-belt',
    'veiled-nebula',
    'long-quiet',
];

/** Number of sectors in a run. */
export const SECTOR_COUNT = SECTOR_ORDER.length;

/** The robo-pet's class at the start of every run (Paradroid 001→999), before any duel takeovers (Leet-39). */
export const PET_BASE_CLASS = 1;

/** Pet-class steps per AI-difficulty notch eased — every this-many classes above base softens the duel by one level. */
export const PET_CLASS_PER_NOTCH = 2;

/**
 * Which captive each sector's guardian holds (GDD §5 / Leet-34). The sibling is *always* the Hush's
 * most-prized piece in sector 5; mom/dad/grandma/grandpa fill sectors 1–4. The GDD shuffles those four
 * per run for crew-ability build variety — that randomisation is deferred to Phase 4 (crew abilities);
 * for now the order is fixed and deterministic. Aligned 1:1 with {@link SECTOR_ORDER} (index 0 = sector 1).
 */
export const SECTOR_RESCUE: readonly CrewMember[] = ['grandma', 'grandpa', 'dad', 'mom', 'sibling'];

/**
 * Mode-agnostic generation parameters for one sector — plain numbers only. np-space-map turns these
 * into a map (inner planets + rim suns) and the normality-front step; the event pool is keyed by
 * `Sector.id` over there. Keeping these primitive is what lets np-state stay free of any mode lib.
 */
export interface SectorParams {
    /** Inner travel-graph planets to generate. Rises with depth (bigger maps). */
    planetCount: number;
    /** Rim boundary suns (bail-exits) to generate. Falls with depth (fewer ways out). */
    exits: number;
    /** Jumps for the normality front to cross the sector — lower = the grey closes faster. */
    frontSteps: number;
    /**
     * Route density: how many nearest inner planets each inner planet links to (the old hard-coded "3
     * nearest" in np-space-map, Leet-34). Higher = more interconnected = more ways to route around the
     * grey. Denser early sectors are more forgiving; lower bound is 2 (1 risks a disconnected graph).
     */
    linkDegree: number;
    /**
     * Chance (0–100%) a jump is intercepted by the Grey Fleet before arrival (Leet-35 / GDD §3). Rises
     * with depth — the Fleet thickens the closer you get to the Hush. `<= 0` disables intercepts.
     */
    interceptChance: number;
}

/** A fully-resolved sector: its identity plus its generation parameters. */
export interface Sector extends SectorParams {
    id: SectorId;
    /** 1-based index within the run. */
    number: number;
}

/**
 * Duel (paradroid) difficulty selectors. Two independent axes — board complexity and AI
 * skill — chosen separately (a hard AI can run on an easy board). String unions to match
 * the np-state idiom ({@link DifficultyTier}, {@link SectorId}); `debug` is dev-only.
 */
export type DuelBoardLevel = 'debug' | 'easy' | 'normal' | 'hard' | 'brutal';
export type DuelAiLevel = 'easy' | 'normal' | 'hard' | 'brutal';

/**
 * The *numeric* board knobs for a duel difficulty — plain numbers only. np-paradroid pairs
 * these with its own tile-shape palette (the `EParadroidTileType[]` per level, which is
 * mode-domain content and stays over there, the way np-space-map owns the planet shapes
 * behind {@link SectorParams}). Both are percentage chances (0–100); `<= 0` disables.
 */
export interface DuelBoardParams {
    /** Chance an eligible straight tile becomes an ownership-flipping changer. */
    changerRate: number;
    /** Chance an eligible straight tile auto-fires (a permanently-lit path). */
    autoFireRate: number;
}

/**
 * Dungeon combat tuning — all primitive, so np-state stays free of np-pixel-dungeon. The mode's pure
 * `resolveDamage(attack, defense, params)` consumes this verbatim (`attack − defense`, floored at
 * `minDamage`); the app resolves it via {@link Balance.dungeonCombatParams}. Mirrors the
 * {@link DuelAiParams} split exactly: the *math* lives in the mode lib, only the *numbers* live here.
 */
export interface DungeonCombatParams {
    /** Damage floor: the least a connecting hit can deal, however high the target's defense. */
    minDamage: number;
}

/**
 * The world-content plan for one dungeon floor (RPG cluster C). All primitive, so np-state/np-config stay
 * free of np-pixel-dungeon — the mode's `PixelDungeonDecorator` consumes it; the app resolves it via
 * {@link Balance.dungeonPlan}. Depth-scalable like every other curve here.
 *
 * **Step 0 reads NONE of these fields** — the exit stairs are always exactly one per floor, so they need
 * no plan field. The counts below are reserved for #14 (traps / locked doors): they exist now so the
 * decorator signature and the balance surface already speak the vocabulary, and they scale with depth so
 * #14 inherits a realistic curve rather than back-filling one. A room-archetype budget (treasure/shop/boss
 * counts) joins this interface when special rooms land (#14/#16).
 */
export interface DungeonPlan {
    /** Reserved (#14): non-damaging→damaging traps to scatter on the floor. Unused in step 0. */
    trapCount: number;
    /** Reserved (#14): locked doors (each needing a solvably-placed key) to introduce. Unused in step 0. */
    lockCount: number;
}

/**
 * The dungeon mob-AI tuning (RPG cluster E / item #12) — all primitive, so np-state/np-config stay free of
 * np-pixel-dungeon. The mode's pure `decideDungeonAi(obs, state, memory, params, rng)` consumes this verbatim;
 * the app resolves it via {@link Balance.dungeonAiParams}. Mirrors the {@link DuelAiParams} split exactly: the
 * full behaviour state machine (Sleeping → Wandering → Hunting → Fleeing) lives in the mode lib, only the
 * *numbers* live here. Depth-scalable like every other curve — deeper floors hold sharper, twitchier monsters.
 */
export interface DungeonAiParams {
    /**
     * How far (in tiles) a mob can register the player as visible — the AI's effective sight radius. The
     * brain clamps its line-of-sight check by this on top of the mob's own field of view, so an open
     * corridor doesn't let a mob lock on from across the whole floor. Grows with depth (sharper-eyed
     * monsters the deeper you go).
     */
    sightRange: number;
    /**
     * The proximity (in tiles) at which a *sleeping* mob jolts awake even without line of sight — the player
     * stumbled close enough to be heard/felt. Independent of `sightRange`: a mob wakes when the player is
     * within this radius OR is actually seen. Grows with depth (lighter sleepers the deeper you go).
     */
    wakeOnSpotRadius: number;
    /**
     * How many turns a hunting mob keeps chasing the player's *last known tile* after losing sight before it
     * gives up and drops back to wandering. Higher = more persistent pursuit. A short memory makes a mob easy
     * to shake around a corner; a long one makes it dog the player.
     */
    loseTargetAfterTurns: number;
    /**
     * The 0..1 probability that a *wandering* mob takes a random step on a given turn (vs. waiting in place),
     * so idle mobs aren't in perpetual motion. Lower = more sedentary roamers. Not depth-scaled — it's a feel
     * knob, not a difficulty one.
     */
    wanderChance: number;
    /**
     * The HP fraction (0..1) below which a mob breaks off and flees instead of fighting. A mob at or above
     * this fraction stands its ground; once damage drops it under, it runs from the player. Grows with depth,
     * i.e. deeper monsters flee *sooner* (at a higher remaining-HP fraction) — they value their skins more.
     */
    fleeBelowHpPct: number;
    /**
     * Reserved (alert propagation): the radius within which a mob entering the hunt wakes nearby sleeping
     * mobs (a shout that rouses the room). Carried so the balance surface speaks the vocabulary and scales it
     * with depth; whether the brain acts on it is its choice (see `MobBrain`). Unread when propagation is off.
     */
    alertRadius: number;
}

/**
 * The droid-AI tuning for a difficulty — all primitive, so np-state stays free of np-paradroid.
 * The mode's pure `ParadroidAi` consumes this verbatim; the app resolves it via {@link Balance}.
 */
export interface DuelAiParams {
    /** How often (ms of match time) the AI re-evaluates and may fire. */
    reactionMs: number;
    /** Hard floor between shots (ms) so the AI can never out-click a human. */
    shotCooldownMs: number;
    /** Random perturbation added to candidate move scores — higher = sloppier. */
    scoreNoise: number;
    /** 0..1 probability of picking a random legal move instead of the best one. */
    blunderChance: number;
    /** Whether the AI holds/plans its shots so its rows are still lit at timeout. */
    usesTiming: boolean;
}
