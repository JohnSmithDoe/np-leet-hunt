/**
 * The run's resource meters — the shared vocabulary every mode, the HUD, and the event system speak.
 * Lived as a `{ hull, heart, marbles }` stub inside np-space-map's event model until np-state; this is
 * now the single source of the shape.
 */
export interface Resources {
    /** Ship integrity. */
    hull: number;
    /** Crew morale / life force. */
    heart: number;
    /** Currency / collectible loot. */
    marbles: number;
}

/** A signed change to some or all meters (event outcomes, mode results). Missing keys = no change. */
export type ResourceDelta = Partial<Resources>;

/** The meters a fresh run starts with (was the `{ hull: 10, heart: 10, marbles: 0 }` stub). */
export const STARTING_RESOURCES: Resources = { hull: 10, heart: 10, marbles: 0 };
