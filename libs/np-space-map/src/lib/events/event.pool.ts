import { NPRng } from '@shared/np-library';
import { SectorId } from '@shared/np-state';

import { distortionCache } from './content/distortion-battery.event';
import { enRouteEvents } from './content/en-route.events';
import { grassAlienEncounter } from './content/grass-alien-encounter.event';
import { emberBeltEvents } from './content/sectors/ember-belt.events';
import { frozenDriftEvents } from './content/sectors/frozen-drift.events';
import { homeReachEvents } from './content/sectors/home-reach.events';
import { longQuietEvents } from './content/sectors/long-quiet.events';
import { veiledNebulaEvents } from './content/sectors/veiled-nebula.events';
import { spaceWhale } from './content/space-whale.event';
import { zeeboGuide } from './content/zeebo-guide.event';
import { PlanetEvent } from './event.model';

/**
 * Event pools (event-system.md §5). Arrival events are picked from the current sector's pool plus the
 * core pool, so a sector's biome and grey level shape what fires there. ~10 per sector + a small core.
 */

/** Core pool — no sector tag, eligible in every sector (the everyday-distortion pieces). */
export const CORE_EVENTS: PlanetEvent[] = [spaceWhale, zeeboGuide, distortionCache];

/** Per-sector pools, keyed by {@link SectorId} (the balance model's sector ids). */
export const SECTOR_EVENT_POOLS: Record<SectorId, PlanetEvent[]> = {
    'home-reach': [grassAlienEncounter, ...homeReachEvents],
    'frozen-drift': frozenDriftEvents,
    'ember-belt': emberBeltEvents,
    'veiled-nebula': veiledNebulaEvents,
    'long-quiet': longQuietEvents,
};

/**
 * En-route intercept pool (Leet-35) — pool-agnostic events fired when a jump is intercepted, before
 * arrival. Resolved through the same dialog as planet events; drawn by {@link resolveEnRouteEvent}.
 */
export const EN_ROUTE_EVENTS: PlanetEvent[] = enRouteEvents;

/** Every authored event, flattened — for validation and any sector-agnostic consumer. */
export const PLANET_EVENT_POOL: PlanetEvent[] = [
    ...CORE_EVENTS,
    ...Object.values(SECTOR_EVENT_POOLS).flat(),
    ...EN_ROUTE_EVENTS,
];

/**
 * Pick the event that fires when the ship lands on a planet in `sector`. Seeded by the planet (within
 * the sector) so a given planet always draws the same event (mirrors `generatePlanetInfo`'s seeding).
 */
export const resolvePlanetEvent = (sector: SectorId, seed: string): PlanetEvent =>
    new NPRng(`event-${sector}-${seed}`).item([...CORE_EVENTS, ...SECTOR_EVENT_POOLS[sector]]);

/**
 * Pick the en-route intercept event for a jump (Leet-35). Seeded by sector + a per-jump seed so the draw
 * is reproducible for a given jump. Sector is passed for future per-sector intercept flavour; today the
 * pool is shared across sectors.
 */
export const resolveEnRouteEvent = (sector: SectorId, seed: string): PlanetEvent =>
    new NPRng(`enroute-${sector}-${seed}`).item(EN_ROUTE_EVENTS);
