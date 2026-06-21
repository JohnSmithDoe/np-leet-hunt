import type { Effect, PlanetEvent, Tone } from './events/event.model';

export enum SPACE_EVENTS {
    /** A planet was selected (tapped). Payload: the planet's `PlanetInfo`. */
    PLANET_SELECTED = 'npPlanetSelected',
    /** Selection cleared (tapped empty space, the current node, or committed a jump). No payload. */
    PLANET_DESELECTED = 'npPlanetDeselected',
    /** A jump was committed; the ship has begun travelling. Payload: `{ to: string }`. */
    JUMP_COMMITTED = 'npJumpCommitted',
    /** A travel/direction button was tapped — UI click feedback for the app (SFX). No payload. */
    TRAVEL_TAP = 'npTravelTap',
    /** The ship landed on a planet; its event fires. Payload: `PlanetArrivedPayload`. */
    PLANET_ARRIVED = 'npPlanetArrived',
    /** An answer with a stake was chosen; its cost applies at once. Payload: `EventChoiceCommittedPayload`. */
    EVENT_CHOICE_COMMITTED = 'npEventChoiceCommitted',
    /** A planet event was resolved by the player. Payload: `EventResolvedPayload`. */
    EVENT_RESOLVED = 'npEventResolved',
    /** The normality front advanced after a jump. Payload: `{ closedFraction, position, jumps }`. */
    FRONT_ADVANCED = 'npFrontAdvanced',
    /** The front was pushed back — a distortion battery fed to the grey (Leet-36). No payload; the bar follows FRONT_ADVANCED. */
    FRONT_PUSHED = 'npFrontPushed',
    /** A node fell behind the front and was normalised. Payload: `{ planet: string }`. */
    PLANET_SWALLOWED = 'npPlanetSwallowed',
    /** The front caught the ship — reality snapped back; the conductor ends the run (snapback). Payload: `{ jumps }`. */
    REALITY_SNAPBACK = 'npRealitySnapback',
    /** Reached a rim sun and bailed the sector (no reward); the conductor advances, or ends the run (bail) past the last. Payload: `{ jumps }`. */
    SECTOR_EXIT = 'npSectorExit',
    /** Reached the guardian gate node — the *rewarding* exit (Leet-34); the conductor hands off to the guardian fight. Payload: `{ jumps }`. */
    GUARDIAN_REACHED = 'npGuardianReached',
    /** An event/encounter outcome spawns a transient mode (Leet-37): the conductor opens the duel/dungeon. Payload: {@link SpawnGamePayload}. */
    SPAWN_GAME = 'npSpawnGame',
}

/** The `spawnGame` event effect, carried verbatim on {@link SPACE_EVENTS.SPAWN_GAME} for the conductor (Leet-37). */
export type SpawnGamePayload = Extract<Effect, { kind: 'spawnGame' }>;

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

export interface EventChoiceCommittedPayload {
    /** The resolving event's id. */
    id: string;
    /** The chosen answer's stake — spent immediately, before its follow-up/outcome (event-system.md §8). */
    cost: Effect[];
}

export interface EventResolvedPayload {
    /** The resolved event's id. */
    id: string;
    /** The good/neutral/bad tones of the answers chosen, root → leaf. */
    path: Tone[];
    /** The chosen outcome's effects, for the map / run-state to apply. */
    effects: Effect[];
}
