export enum SPACE_EVENTS {
    /** A planet was selected (tapped). Payload: the planet's `PlanetInfo`. */
    PLANET_SELECTED = 'npPlanetSelected',
    /** Selection cleared (tapped empty space, the current node, or committed a jump). No payload. */
    PLANET_DESELECTED = 'npPlanetDeselected',
    /** A jump was committed; the ship has begun travelling. Payload: `{ to: string }`. */
    JUMP_COMMITTED = 'npJumpCommitted',
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
