import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { PLANET_INFO_DATA } from './planet-info.data';

/** A planet's survey readout, shown in the HTML info overlay when the planet is selected. */
export interface PlanetInfo {
    name: string;
    classification: string;
    atmosphere: string;
    temperature: string;
    gravity: string;
    population: string;
    hazard: string;
    resource: string;
    description: string;
}

/**
 * Roll a planet's readout from the {@link PLANET_INFO_DATA} pools. Pass a seeded `NPRng` (e.g. keyed
 * by the planet's index) so a planet reports the same stats every time it is reselected.
 */
export const generatePlanetInfo = (rng: NPRng): PlanetInfo => {
    const d = PLANET_INFO_DATA;
    const pick = <T>(pool: readonly T[]): T => rng.item(pool as T[]);
    return {
        name: `${pick(d.namePrefixes)}${pick(d.nameSuffixes)} ${pick(d.numerals)}`,
        classification: pick(d.classifications),
        atmosphere: pick(d.atmospheres),
        temperature: pick(d.temperatures),
        gravity: pick(d.gravities),
        population: pick(d.populations),
        hazard: pick(d.hazards),
        resource: pick(d.resources),
        description: pick(d.descriptions),
    };
};
