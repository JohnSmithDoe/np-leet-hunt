import type { Effect, PlanetEvent, Tone } from './events/event.model';

export enum SPACE_EVENTS {
    /** A planet was selected (tapped). Payload: the planet's `PlanetInfo`. */
    PLANET_SELECTED = 'npPlanetSelected',
    /** Selection cleared (tapped empty space, the current node, or committed a jump). No payload. */
    PLANET_DESELECTED = 'npPlanetDeselected',
    /** A jump was committed; the ship has begun travelling. Payload: `{ to: string }`. */
    JUMP_COMMITTED = 'npJumpCommitted',
    /** The ship landed on a planet; its event fires. Payload: `PlanetArrivedPayload`. */
    PLANET_ARRIVED = 'npPlanetArrived',
    /** A planet event was resolved by the player. Payload: `EventResolvedPayload`. */
    EVENT_RESOLVED = 'npEventResolved',
    /** The normality front advanced after a jump. Payload: `{ closedFraction, position, jumps }`. */
    FRONT_ADVANCED = 'npFrontAdvanced',
    /** A node fell behind the front and was normalised. Payload: `{ planet: string }`. */
    PLANET_SWALLOWED = 'npPlanetSwallowed',
    /** The front caught the ship — reality snapped back (run-end stub). Payload: `{ jumps }`. */
    REALITY_SNAPBACK = 'npRealitySnapback',
    /** Reached a rim sun and bailed the sector (no reward; run-end stub). Payload: `{ jumps }`. */
    SECTOR_EXIT = 'npSectorExit',
}

export interface FrontAdvancedPayload {
    closedFraction: number;
    /** How far the front has swept along its axis from the origin. */
    position: number;
    jumps: number;
}

export interface PlanetArrivedPayload {
    event: PlanetEvent;
    /** The name of the planet just landed on. */
    planet: string;
}

export interface EventResolvedPayload {
    /** The resolved event's id. */
    id: string;
    /** The good/neutral/bad tones of the answers chosen, root → leaf. */
    path: Tone[];
    /** The chosen outcome's effects, for the map / run-state to apply. */
    effects: Effect[];
}
