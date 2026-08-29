import { DuelAiLevel, DuelBoardLevel } from '@shared/np-config';

/**
 * The mode hand-off contract (Leet-29). A run is the map plus excursions into transient modes (a duel, a
 * dungeon). This is the typed boundary between the two: the conductor hands a mode a {@link ModeLaunch}
 * when it starts, and the mode hands back a {@link ModeResult} on exit. Pure data — no Phaser, no Angular
 * — so np-state stays free of the mode libs; the mode libs import these types and code against them.
 */

/** Which transient mode a launch/result refers to. */
export type ModeKind = 'duel' | 'dungeon';

/** Start a Paradroid duel. Difficulty is two independent axes; the app resolves the params via Balance. */
export interface DuelLaunch {
    kind: 'duel';
    boardLevel: DuelBoardLevel;
    aiLevel: DuelAiLevel;
    /** The dueled droid's robo-pet class (Paradroid 001→999). Echoed into {@link DuelResult.absorbedClass} on a win (Leet-39). */
    droidClass?: number;
}

/** Dungeon goals land in Phase 3 (GDD §3); the type carries the intent from day one. */
export type DungeonObjective = 'retrieve' | 'sabotage' | 'hunt';

export interface DungeonLaunch {
    kind: 'dungeon';
    objective: DungeonObjective;
    /**
     * The sector/floor depth this excursion sits at — the seam for depth-scaled dungeon content (loot, roster,
     * AI, combat). Optional: the conductor falls back to the run's current sector number when a launch omits it.
     */
    depth?: number;
    /**
     * The equipment the kid carries into this dungeon (item #13): item ids — keys of np-config's `ITEMS`,
     * each an equipment entry. The typed seam for the run to declare its loadout. A run-managed equipped set
     * (kept across excursions) is item #17; until then the conductor supplies a starting set via
     * `Balance.startingEquipment`, and a launch may override it here.
     */
    equippedItemIds?: string[];
}

/** What the conductor passes a mode when launching it. */
export type ModeLaunch = DuelLaunch | DungeonLaunch;

export interface DuelResult {
    kind: 'duel';
    outcome: 'win' | 'lose';
    /** Robo-pet class absorbed on a takeover win (Paradroid) — wired in Phase 2. */
    absorbedClass?: number;
    /** Match time remaining at the decision, ms. */
    timeLeftMs?: number;
}

export interface DungeonResult {
    kind: 'dungeon';
    outcome: 'completed' | 'failed';
    /** Item ids carried out. */
    loot?: string[];
}

/** What a mode hands back to the run on exit. */
export type ModeResult = DuelResult | DungeonResult;

/** The callback a mode scene invokes once, on exit, to report its typed result to the run. */
export type ModeResultHandler = (result: ModeResult) => void;

/**
 * Did this result clear its mode (duel win / dungeon completed)? The single place that classifies
 * success across modes, so reward/progression code branches on one predicate instead of per-mode strings.
 */
export const isModeSuccess = (result: ModeResult): boolean =>
    result.kind === 'duel' ? result.outcome === 'win' : result.outcome === 'completed';
