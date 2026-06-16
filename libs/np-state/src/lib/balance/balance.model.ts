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
