import { Resources } from './resources';

/** The five sectors of the run (GDD §5). */
export type SectorId = 'home-reach' | 'frozen-drift' | 'ember-belt' | 'veiled-nebula' | 'long-quiet';

/** Rescuable family aboard the ship — gates events and answers (GDD §4). */
export type CrewMember = 'mom' | 'dad' | 'grandma' | 'grandpa' | 'sibling';

/** Display names for the rescued family — the single source for crew names across endings and the HUD. */
export const CREW_DISPLAY_NAMES: Record<CrewMember, string> = {
    mom: 'Mom',
    dad: 'Dad',
    grandma: 'Grandma',
    grandpa: 'Grandpa',
    sibling: 'your sibling',
};

/**
 * The full carried state of a single run — serialisable (plain arrays, no Set), so it doubles as the
 * snapshot the store emits and, later, a run-resume payload. Resets every run via `RunStateStore.reset`.
 */
export interface RunContext {
    resources: Resources;
    /** Inventory item ids. */
    items: string[];
    /** Run-scoped story/state flags that have been set. */
    flags: string[];
    /** Crew rescued and aboard. */
    crew: CrewMember[];
    /** The robo-pet's class this run (Paradroid 001→999) — run-scoped, grown by duel takeovers (Leet-39). */
    petClass: number;
    /** The sector currently being traversed. */
    sector: SectorId;
    /** 1-based sector index within the run. */
    sectorNumber: number;
}
