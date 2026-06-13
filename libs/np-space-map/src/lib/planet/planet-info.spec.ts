import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { generatePlanetInfo } from './planet-info';
import { PLANET_INFO_DATA } from './planet-info.data';

describe('generatePlanetInfo', () => {
    const gen = (seed: string) => generatePlanetInfo(new NPRng(seed));

    it('fills every field, drawing values from the data pools', () => {
        const info = gen('alpha');
        const d = PLANET_INFO_DATA;
        expect(d.classifications).toContain(info.classification);
        expect(d.atmospheres).toContain(info.atmosphere);
        expect(d.temperatures).toContain(info.temperature);
        expect(d.gravities).toContain(info.gravity);
        expect(d.populations).toContain(info.population);
        expect(d.hazards).toContain(info.hazard);
        expect(d.resources).toContain(info.resource);
        expect(d.descriptions).toContain(info.description);
        // name = prefix + suffix + " " + numeral
        expect(info.name).toMatch(/^\S+ (\S+)$/);
    });

    it('is reproducible for a given seed', () => {
        expect(gen('repro')).toEqual(gen('repro'));
    });

    it('varies across seeds', () => {
        // Two different seeds should not produce identical readouts across all fields.
        expect(gen('seed-A')).not.toEqual(gen('seed-B'));
    });
});
