import { BESTIARY, DEFAULT_MOB_DEF } from '../bestiary/bestiary';
import { MobDef } from '../bestiary/mob.model';
import { CrewMember } from '../model/run-context';
import {
    DuelAiLevel,
    DuelAiParams,
    DuelBoardLevel,
    DuelBoardParams,
    DungeonAiParams,
    DungeonCombatParams,
    DungeonPlan,
    PET_BASE_CLASS,
    PET_CLASS_PER_NOTCH,
    Sector,
    SECTOR_COUNT,
    SECTOR_ORDER,
    SECTOR_RESCUE,
    SectorParams,
} from './balance.model';

/** AI ladder, easiest → hardest — the order the pet-class hook steps down (Leet-39). */
const AI_LADDER: readonly DuelAiLevel[] = ['easy', 'normal', 'hard', 'brutal'];

/**
 * The central balancing surface — the single place to tune the game. Today it holds the per-sector
 * difficulty curve; duel and dungeon resolvers (`duelParams`, `dungeonParams`) join this class as those
 * modes gain difficulty inputs. Pure and deterministic, so it unit-tests directly (cf. run.fsm.spec.ts).
 *
 * The sector curve (1→5): bigger maps, fewer bail-exits, a faster grey front, a sparser route graph, and
 * heavier Grey Fleet traffic the deeper you go (GDD §4 difficulty knobs / §5 grey gradient). Brackets the
 * old hard-coded values (12 planets, ~10 jumps, 3 routes). `linkDegree` eases off from 4 (sector 1,
 * generously connected) to 3 — never below 2, which risks stranding the graph. `interceptChance` climbs
 * 10→30% so en-route ambushes (Leet-35) stay rare early and common near the Hush.
 */
const SECTOR_CURVE: readonly SectorParams[] = [
    { planetCount: 10, exits: 5, frontSteps: 12, linkDegree: 4, interceptChance: 10 },
    { planetCount: 12, exits: 4, frontSteps: 11, linkDegree: 3, interceptChance: 15 },
    { planetCount: 14, exits: 4, frontSteps: 10, linkDegree: 3, interceptChance: 20 },
    { planetCount: 16, exits: 3, frontSteps: 9, linkDegree: 3, interceptChance: 25 },
    { planetCount: 18, exits: 3, frontSteps: 8, linkDegree: 3, interceptChance: 30 },
];

/** Clamp a (possibly out-of-range) sector number into 1..SECTOR_COUNT. */
const clampNumber = (sectorNumber: number): number => Math.min(SECTOR_COUNT, Math.max(1, Math.floor(sectorNumber)));

/**
 * Duel board size grows with sector depth (Leet-38): a {@link DUEL_MIN_ROWS}-row *mini-duel* in sector 1
 * up to a {@link DUEL_MAX_ROWS}-row full board in the final sector. Each row is one contested middle node,
 * so more rows = a bigger, longer fight. The span is linear across the run, so both endpoints stay fixed
 * even if {@link SECTOR_COUNT} changes.
 */
const DUEL_MIN_ROWS = 4;
const DUEL_MAX_ROWS = 12;

/**
 * Per-difficulty duel board knobs (changer / auto-fire chance). Harder boards weave in more
 * ownership-flipping changers; `<= 0` switches an effect off (e.g. easy has no changers).
 */
const DUEL_BOARD: Record<DuelBoardLevel, DuelBoardParams> = {
    debug: { changerRate: -7, autoFireRate: -2 },
    easy: { changerRate: -1, autoFireRate: 10 },
    normal: { changerRate: 5, autoFireRate: 5 },
    hard: { changerRate: -7, autoFireRate: -2 },
    brutal: { changerRate: 15, autoFireRate: 0 },
};

/**
 * Per-level droid-AI tuning. Up the ladder the AI reacts faster, plays cleaner (less noise,
 * fewer blunders) and starts timing its shots to land lit at the buzzer. `shotCooldownMs` is
 * the same human-click floor (250ms) at every level — difficulty never lets it out-click a person.
 */
const DUEL_AI: Record<DuelAiLevel, DuelAiParams> = {
    easy: { reactionMs: 1500, shotCooldownMs: 250, scoreNoise: 6, blunderChance: 0.5, usesTiming: false },
    normal: { reactionMs: 1000, shotCooldownMs: 250, scoreNoise: 3, blunderChance: 0.25, usesTiming: false },
    hard: { reactionMs: 600, shotCooldownMs: 250, scoreNoise: 1, blunderChance: 0.1, usesTiming: true },
    brutal: { reactionMs: 250, shotCooldownMs: 250, scoreNoise: 0, blunderChance: 0, usesTiming: true },
};

/**
 * Dungeon combat numbers (Leet combat spine). Just the tuning — the `attack − defense` formula itself
 * lives in np-pixel-dungeon's pure `resolveDamage`. `minDamage: 1` guarantees every connecting hit
 * chips at least one HP, so a fully-armoured target can still be worn down. Depth scaling (a
 * per-sector `dungeonCombatParams(depth)`) is a later task; one flat table is enough for now.
 */
const DUNGEON_COMBAT: DungeonCombatParams = { minDamage: 1 };

/**
 * Dungeon floor-loot curve (RPG cluster A). A floor scatters a handful of coins that grows with depth,
 * so a deeper run pays out more — the loot analogue of the sector difficulty curve. `base` coins in
 * sector 1, `+perSector` for each sector deeper, capped at `maxCoins` so the floor never drowns in
 * pickups. One flavour `medkit` rides along from sector 2 on, proving the non-coin (inventory) path.
 */
const DUNGEON_LOOT_BASE_COINS = 3;
const DUNGEON_LOOT_COINS_PER_SECTOR = 2;
const DUNGEON_LOOT_MAX_COINS = 12;
/** From this sector on, a floor also drops a single medkit (the non-coin, inventory-granted pickup). */
const DUNGEON_LOOT_MEDKIT_FROM_SECTOR = 2;

/**
 * Dungeon world-content plan curve (RPG cluster C). The exit stairs are always exactly one per floor (no
 * field — see {@link DungeonPlan}); these counts are the depth-scaled budgets #14 will consume. They're
 * derived per sector so #14 inherits a realistic curve: more traps and more locked doors the deeper you go.
 * Step 0 places only the stairs, so these are carried but not yet read — kept conservative to stay sane.
 */
const DUNGEON_TRAPS_PER_SECTOR = 1; // 0 in sector 1, +1 per sector deeper
const DUNGEON_LOCKS_FROM_SECTOR = 3; // first locked door only from this sector on (needs the #14 key graph)

/**
 * Dungeon enemy-roster curve (RPG cluster E / item #10). A floor's enemy count grows with depth — the
 * monster analogue of the loot/difficulty curves — and the *mix* hardens too: shallow floors are all weak
 * `skeleton` grunts; from {@link DUNGEON_WARRIOR_FROM_SECTOR} on, the tougher `goblin` (its own sheet,
 * beefier stats) creeps in, one more each sector deeper. Both ids exist in {@link BESTIARY}. Counts are
 * clamped at {@link DUNGEON_MAX_ENEMIES} so a deep floor never floods.
 */
const DUNGEON_BASE_ENEMIES = 3; // sector 1 keeps the historical 3-skeleton floor
const DUNGEON_ENEMIES_PER_SECTOR = 1; // +1 enemy per sector deeper
const DUNGEON_MAX_ENEMIES = 9; // cap so a deep floor never floods
/** From this sector on, the roster swaps in one tougher `goblin` (one more each sector deeper). */
const DUNGEON_WARRIOR_FROM_SECTOR = 2;

/**
 * Dungeon mob-AI tuning (RPG cluster E / item #12) — the sector-1 baseline of the full behaviour state
 * machine, before depth scaling. The numbers; the FSM (Sleeping → Wandering → Hunting → Fleeing) lives in
 * np-pixel-dungeon's pure `decideDungeonAi`. Tuned shallow-and-forgiving: a modest sight, a sleepy floor that
 * only wakes when the player gets close, a short give-up memory (easy to shake), wanderers that mostly idle,
 * and monsters that fight to a quarter HP before breaking. {@link Balance.dungeonAiParams} scales the
 * difficulty knobs up with depth.
 */
const DUNGEON_AI: DungeonAiParams = {
    sightRange: 4,
    wakeOnSpotRadius: 3,
    loseTargetAfterTurns: 4,
    wanderChance: 0.6,
    fleeBelowHpPct: 0.25,
    alertRadius: 4,
};

/**
 * Depth scaling for the mob-AI knobs (item #12). Deeper floors hold sharper, twitchier, more cowardly
 * monsters: per sector beyond the first, +{@link DUNGEON_AI_SIGHT_PER_SECTOR} sight and wake radius, and
 * +{@link DUNGEON_AI_FLEE_PER_SECTOR} to the flee fraction (they bolt sooner). The give-up memory and wander
 * chance stay flat — feel knobs, not difficulty ones. Sight/wake are clamped so a deep floor doesn't grant
 * floor-wide omniscience; the flee fraction is clamped below 1 so a mob never spawns already-fleeing.
 */
const DUNGEON_AI_SIGHT_PER_SECTOR = 1;
const DUNGEON_AI_FLEE_PER_SECTOR = 0.04;
const DUNGEON_AI_MAX_SIGHT = 9; // never floor-wide omniscient, however deep
const DUNGEON_AI_MAX_FLEE_PCT = 0.6; // never so cowardly it spawns already-fleeing

export class Balance {
    /** The generation parameters for a sector by its 1-based number (clamped to a valid sector). */
    static sectorParams(sectorNumber: number): SectorParams {
        return { ...SECTOR_CURVE[clampNumber(sectorNumber) - 1] };
    }

    /** A fully-resolved {@link Sector}: id (from {@link SECTOR_ORDER}) + 1-based number + resolved params. */
    static sector(sectorNumber: number): Sector {
        const number = clampNumber(sectorNumber);
        return { id: SECTOR_ORDER[number - 1], number, ...Balance.sectorParams(number) };
    }

    /** The captive freed by beating a sector's guardian (Leet-34 / GDD §5); sibling is always sector 5. */
    static rescueForSector(sectorNumber: number): CrewMember {
        return SECTOR_RESCUE[clampNumber(sectorNumber) - 1];
    }

    /**
     * The robo-pet's "stronger duel position" hook (Leet-39 / GDD §4): a higher pet class softens the
     * opposing AI, one ladder notch per {@link PET_CLASS_PER_NOTCH} classes above the base. Returns the
     * eased AI level (never below `easy`). The board level is untouched — only the droid's play eases.
     */
    static duelAiForPet(aiLevel: DuelAiLevel, petClass: number): DuelAiLevel {
        const notches = Math.max(0, Math.floor((petClass - PET_BASE_CLASS) / PET_CLASS_PER_NOTCH));
        const index = AI_LADDER.indexOf(aiLevel);
        if (index < 0) return aiLevel; // unknown level: leave it be
        return AI_LADDER[Math.max(0, index - notches)];
    }

    /** The numeric board knobs for a duel board difficulty (unknown levels fall back to `normal`). */
    static duelBoardParams(level: DuelBoardLevel): DuelBoardParams {
        return { ...(DUEL_BOARD[level] ?? DUEL_BOARD.normal) };
    }

    /**
     * Duel board rows for a sector (Leet-38): the board grows with depth, from a {@link DUEL_MIN_ROWS}-row
     * mini-duel in sector 1 to a {@link DUEL_MAX_ROWS}-row full board in the last sector, linearly between.
     * More rows = more contested middle nodes = a bigger fight. The app passes this to the paradroid
     * factory; the board palette and AI stay their own difficulty axes (`duelBoardParams` / `duelAiParams`).
     */
    static duelRows(sectorNumber: number): number {
        const number = clampNumber(sectorNumber);
        const span = SECTOR_COUNT > 1 ? (DUEL_MAX_ROWS - DUEL_MIN_ROWS) / (SECTOR_COUNT - 1) : 0;
        return Math.round(DUEL_MIN_ROWS + (number - 1) * span);
    }

    /** The droid-AI tuning for a difficulty level (unknown levels fall back to `normal`). */
    static duelAiParams(level: DuelAiLevel): DuelAiParams {
        return { ...(DUEL_AI[level] ?? DUEL_AI.normal) };
    }

    /**
     * The dungeon combat tuning (Leet combat spine). A fresh copy each call (like {@link duelAiParams})
     * so a consumer mutating the result can't poison the shared table. The app injects this into the
     * dungeon engine; the mode's pure `resolveDamage` reads `minDamage` from it.
     */
    static dungeonCombatParams(): DungeonCombatParams {
        return { ...DUNGEON_COMBAT };
    }

    /**
     * The item ids to scatter on a dungeon floor at this sector depth (RPG cluster A). Scales with depth
     * like the rest of the curve: a handful of coins in sector 1, more the deeper you go (clamped at
     * {@link DUNGEON_LOOT_MAX_COINS} so a floor never floods), plus a single medkit from
     * {@link DUNGEON_LOOT_MEDKIT_FROM_SECTOR} on. The sector number is clamped like every other resolver.
     *
     * Every id returned is a key of np-config's `ITEMS` catalog — the engine resolves each through it.
     * Returns a fresh array each call (the mutate-safe idiom), so the engine can splice/shuffle freely.
     */
    static dungeonLoot(sectorNumber: number): string[] {
        const number = clampNumber(sectorNumber);
        const coinCount = Math.min(
            DUNGEON_LOOT_MAX_COINS,
            DUNGEON_LOOT_BASE_COINS + (number - 1) * DUNGEON_LOOT_COINS_PER_SECTOR
        );
        const loot = Array.from({ length: coinCount }, () => 'coin');
        if (number >= DUNGEON_LOOT_MEDKIT_FROM_SECTOR) loot.push('medkit');
        return loot;
    }

    /**
     * The world-content plan for a dungeon floor at this sector depth (RPG cluster C). Returns a fresh copy
     * each call (the mutate-safe idiom, like {@link duelAiParams} / {@link dungeonLoot}) so the decorator
     * can't poison a shared object. Scales with depth: `trapCount` grows from 0 in sector 1, `lockCount`
     * stays 0 until {@link DUNGEON_LOCKS_FROM_SECTOR}. **Step 0 reads none of these** (it places exactly one
     * exit stairs); they exist so #14 inherits a realistic curve rather than back-filling one.
     */
    static dungeonPlan(sectorNumber: number): DungeonPlan {
        const number = clampNumber(sectorNumber);
        return {
            trapCount: (number - 1) * DUNGEON_TRAPS_PER_SECTOR,
            lockCount: number >= DUNGEON_LOCKS_FROM_SECTOR ? number - DUNGEON_LOCKS_FROM_SECTOR + 1 : 0,
        };
    }

    /**
     * The equipment the player begins a dungeon run carrying (item #13 / equipment & combat stats). Item ids
     * — keys of np-config's `ITEMS` catalog, each an *equipment* entry (carries a `slot` + `mods`). The app
     * injects these into the dungeon scene; the engine resolves each through `ITEMS` and folds its mods into
     * the player's `MobCombat` stats. A **fresh array** each call (the mutate-safe idiom, like
     * {@link dungeonLoot}), so the engine can splice/shuffle freely.
     *
     * Modest at first — a starter blade + vest. `petClass` is the seam for the pet's "stronger position"
     * hook (a higher class could grant better starting gear); it's accepted now but not yet read, so the
     * loadout scales with run progress (and the run's own equipped set, item #17) without a signature change.
     */
    static startingEquipment(petClass?: number): string[] {
        void petClass; // forward-compat seam (a higher class → better starter gear); accepted, not yet read
        return ['rustyBlade', 'scrapVest'];
    }

    /**
     * The full {@link MobDef} for an archetype id (RPG cluster E / item #10) — a **fresh copy** each call
     * (the mutate-safe idiom, like {@link duelAiParams}), so a consumer mutating the result can't poison the
     * shared {@link BESTIARY} table. An unknown id falls back to a copy of {@link DEFAULT_MOB_DEF} (a sane
     * modest grunt) so a stale roster id never crashes the factory. The mode lib's `MobFactory` reads this
     * to build a mob; the app reads `BESTIARY.brawler` directly for the player class.
     */
    static mobDef(id: string): MobDef {
        return { ...(BESTIARY[id] ?? DEFAULT_MOB_DEF) };
    }

    /**
     * The enemy archetype ids to spawn on a dungeon floor at this sector depth (RPG cluster E / item #10).
     * Scales with depth on **both axes**: the count grows ({@link DUNGEON_BASE_ENEMIES} in sector 1,
     * `+{@link DUNGEON_ENEMIES_PER_SECTOR}` per sector deeper, capped at {@link DUNGEON_MAX_ENEMIES}), and the
     * *mix* hardens (from {@link DUNGEON_WARRIOR_FROM_SECTOR} on, one more weak `skeleton` is swapped for the
     * tougher `goblin` each sector deeper, never more of them than the floor holds). The sector
     * number is clamped like every other resolver.
     *
     * Every id returned is a key of {@link BESTIARY} — the engine resolves each through {@link mobDef}.
     * Returns a fresh array each call (the mutate-safe idiom), so the engine can splice/shuffle freely.
     */
    static dungeonRoster(sectorNumber: number): string[] {
        const number = clampNumber(sectorNumber);
        const count = Math.min(DUNGEON_MAX_ENEMIES, DUNGEON_BASE_ENEMIES + (number - 1) * DUNGEON_ENEMIES_PER_SECTOR);
        // How many of the floor's slots are the tougher warrior: 0 until DUNGEON_WARRIOR_FROM_SECTOR, then
        // one more per sector deeper, never exceeding the floor's total slots (the rest stay weak skeletons).
        const warriors = Math.min(count, Math.max(0, number - DUNGEON_WARRIOR_FROM_SECTOR + 1));
        const roster: string[] = [];
        for (let i = 0; i < count; i++) roster.push(i < warriors ? 'goblin' : 'skeleton');
        return roster;
    }

    /**
     * The mob-AI tuning for a dungeon floor at this sector depth (RPG cluster E / item #12). Returns a
     * **fresh copy** each call (the mutate-safe idiom, like {@link duelAiParams} / {@link dungeonPlan}) so a
     * consumer mutating the result can't poison the shared {@link DUNGEON_AI} baseline. Scales the difficulty
     * knobs with depth: deeper monsters see farther, wake to a closer player, and flee sooner (a higher
     * remaining-HP fraction) — clamped so sight never goes floor-wide and the flee fraction never reaches 1.
     * The give-up memory and wander chance stay flat (feel, not difficulty). The sector number is clamped
     * like every other resolver. The mode lib's pure `decideDungeonAi` reads this verbatim.
     */
    static dungeonAiParams(sectorNumber: number): DungeonAiParams {
        const number = clampNumber(sectorNumber);
        const deeper = number - 1; // sectors beyond the first
        return {
            ...DUNGEON_AI,
            sightRange: Math.min(DUNGEON_AI_MAX_SIGHT, DUNGEON_AI.sightRange + deeper * DUNGEON_AI_SIGHT_PER_SECTOR),
            wakeOnSpotRadius: Math.min(
                DUNGEON_AI_MAX_SIGHT,
                DUNGEON_AI.wakeOnSpotRadius + deeper * DUNGEON_AI_SIGHT_PER_SECTOR
            ),
            fleeBelowHpPct: Math.min(
                DUNGEON_AI_MAX_FLEE_PCT,
                DUNGEON_AI.fleeBelowHpPct + deeper * DUNGEON_AI_FLEE_PER_SECTOR
            ),
        };
    }
}
