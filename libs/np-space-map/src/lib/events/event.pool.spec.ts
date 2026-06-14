import { Question } from './event.model';
import { PLANET_EVENT_POOL, resolvePlanetEvent } from './event.pool';

/**
 * Walk a question tree, asserting the model invariants (event-system.md §4): every question has exactly
 * three answers; every answer is terminal XOR a branch; every outcome carries an effects array.
 */
const assertQuestionValid = (question: Question) => {
    expect(question.answers).toHaveLength(3);
    for (const answer of question.answers) {
        expect(['good', 'neutral', 'bad']).toContain(answer.tone);
        expect(answer.choice.length).toBeGreaterThan(0);
        // Exactly one of followUp / outcome.
        expect(!!answer.followUp !== !!answer.outcome).toBe(true);
        if (answer.followUp) assertQuestionValid(answer.followUp);
        if (answer.outcome) expect(Array.isArray(answer.outcome.effects)).toBe(true);
    }
};

describe('resolvePlanetEvent', () => {
    it('returns an event from the pool', () => {
        expect(PLANET_EVENT_POOL).toContain(resolvePlanetEvent('any-planet'));
    });

    it('is reproducible for a given planet seed', () => {
        expect(resolvePlanetEvent('Xandris IV')).toBe(resolvePlanetEvent('Xandris IV'));
    });
});

describe('planet event pool', () => {
    it('is non-empty', () => {
        expect(PLANET_EVENT_POOL.length).toBeGreaterThan(0);
    });

    it.each(PLANET_EVENT_POOL.map(event => [event.id, event] as const))(
        'event "%s" is structurally valid',
        (_id, event) => {
            expect(event.intro.length).toBeGreaterThan(0);
            assertQuestionValid(event.root);
        }
    );

    it('has unique event ids', () => {
        const ids = PLANET_EVENT_POOL.map(event => event.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
