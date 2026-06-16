import { SectorId } from '../model/run-context';

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
