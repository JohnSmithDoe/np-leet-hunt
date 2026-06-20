import { DISTORTION_BATTERY, Question } from './event.model';
import {
    CORE_EVENTS,
    EN_ROUTE_EVENTS,
    PLANET_EVENT_POOL,
    resolveEnRouteEvent,
    resolvePlanetEvent,
    SECTOR_EVENT_POOLS,
} from './event.pool';

/**
 * Walk a question tree, asserting the model invariants (event-system.md §4): every question has exactly
 * three answers; each answer is good/neutral/bad and terminal XOR a branch; every outcome carries an
 * effects array. Recurses into follow-ups so the whole tree is checked.
 */
const assertQuestionValid = (question: Question) => {
    expect(question.answers).toHaveLength(3);
    for (const answer of question.answers) {
        expect(['good', 'neutral', 'bad']).toContain(answer.tone);
        expect(answer.choice.length).toBeGreaterThan(0);
        // Exactly one of followUp / outcome.
        expect(!!answer.followUp !== !!answer.outcome).toBe(true);
        // An optional stake (spec §4/§8) is a non-empty effects array applied when the answer is chosen.
        if (answer.cost) {
            expect(Array.isArray(answer.cost)).toBe(true);
            expect(answer.cost.length).toBeGreaterThan(0);
        }
        if (answer.followUp) assertQuestionValid(answer.followUp);
        if (answer.outcome) expect(Array.isArray(answer.outcome.effects)).toBe(true);
    }
};

const SECTORS = Object.keys(SECTOR_EVENT_POOLS) as (keyof typeof SECTOR_EVENT_POOLS)[];

describe('resolvePlanetEvent', () => {
    it('returns an event from the sector + core eligible set', () => {
        const eligible = [...CORE_EVENTS, ...SECTOR_EVENT_POOLS['home-reach']];
        expect(eligible).toContain(resolvePlanetEvent('home-reach', 'any-planet'));
    });

    it('is reproducible for a given sector + planet seed', () => {
        expect(resolvePlanetEvent('ember-belt', 'Xandris IV')).toBe(resolvePlanetEvent('ember-belt', 'Xandris IV'));
    });
});

describe('resolveEnRouteEvent', () => {
    it('returns an event from the en-route pool', () => {
        expect(EN_ROUTE_EVENTS).toContain(resolveEnRouteEvent('home-reach', '1'));
    });

    it('is reproducible for a given sector + jump seed', () => {
        expect(resolveEnRouteEvent('long-quiet', '3')).toBe(resolveEnRouteEvent('long-quiet', '3'));
    });
});

describe('planet event pools', () => {
    it('every authored event is structurally valid', () => {
        expect(PLANET_EVENT_POOL.length).toBeGreaterThan(0);
        for (const event of PLANET_EVENT_POOL) {
            expect(event.intro.length).toBeGreaterThan(0);
            assertQuestionValid(event.root);
        }
    });

    it('has globally unique event ids', () => {
        const ids = PLANET_EVENT_POOL.map(event => event.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(SECTORS)('sector "%s" has at least 10 events', sector => {
        expect(SECTOR_EVENT_POOLS[sector].length).toBeGreaterThanOrEqual(10);
    });

    it('sector-tagged events carry the matching sector id', () => {
        for (const sector of SECTORS) {
            for (const event of SECTOR_EVENT_POOLS[sector]) {
                if (event.sector) expect(event.sector).toBe(sector);
            }
        }
    });

    it('has a source for the distortion battery — the Phase-1 front pushback (Leet-36)', () => {
        const grantsBattery = (question: Question): boolean =>
            question.answers.some(answer => {
                if (answer.followUp) return grantsBattery(answer.followUp);
                return !!answer.outcome?.effects.some(
                    effect => effect.kind === 'item' && effect.grant === DISTORTION_BATTERY
                );
            });
        expect(PLANET_EVENT_POOL.some(event => grantsBattery(event.root))).toBe(true);
    });
});
