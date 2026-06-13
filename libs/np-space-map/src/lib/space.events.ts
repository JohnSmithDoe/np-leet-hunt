export enum SPACE_EVENTS {
    /** A jump was committed; the ship has begun travelling. Payload: `{ to: string }`. */
    JUMP_COMMITTED = 'npJumpCommitted',
    /** The normality front advanced after a jump. Payload: `{ closedFraction, radius, jumps }`. */
    FRONT_ADVANCED = 'npFrontAdvanced',
    /** A node fell behind the front and was normalised. Payload: `{ planet: string }`. */
    PLANET_SWALLOWED = 'npPlanetSwallowed',
    /** The front caught the ship — reality snapped back (run-end stub). Payload: `{ jumps }`. */
    REALITY_SNAPBACK = 'npRealitySnapback',
}

export interface FrontAdvancedPayload {
    closedFraction: number;
    radius: number;
    jumps: number;
}
