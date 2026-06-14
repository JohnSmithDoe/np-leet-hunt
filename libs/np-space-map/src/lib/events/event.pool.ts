import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { grassAlienEncounter } from './content/grass-alien-encounter.event';
import { spaceWhale } from './content/space-whale.event';
import { zeeboGuide } from './content/zeebo-guide.event';
import { PlanetEvent } from './event.model';

/**
 * The pool of events eligible on planet arrival. Add more here as they come across from AI.md
 * (event-system.md §10). The full design has core + per-sector pools filtered by gates (§5); since
 * there is no sector context yet, every pooled event is eligible everywhere, so keep them core for now.
 */
export const PLANET_EVENT_POOL: PlanetEvent[] = [grassAlienEncounter, spaceWhale, zeeboGuide];

/**
 * Pick the event that fires when the ship lands on a planet. Seeded by the planet so a given planet
 * always draws the same event (mirrors {@link generatePlanetInfo}'s per-planet seeding).
 */
export const resolvePlanetEvent = (seed: string): PlanetEvent => new NPRng(`event-${seed}`).item(PLANET_EVENT_POOL);
