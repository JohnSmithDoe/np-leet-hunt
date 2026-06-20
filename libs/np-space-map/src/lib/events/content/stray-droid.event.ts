import { PlanetEvent } from '../event.model';

/**
 * Core pool — a stray droid duel-able in place (GDD §5 enemy roster / Leet-37): a derelict combat droid
 * powers up as the ship passes and pings a takeover challenge. The *good* branch jacks the pet in and opens
 * a Paradroid duel (`spawnGame`); the conductor runs it and returns to the map with the result. Winning
 * offers the droid's class for absorption (Leet-39); losing is non-lethal — it just costs hull.
 */
export const strayDroid: PlanetEvent = {
    id: 'stray-droid',
    intro:
        'A combat droid drifts derelict off the planet — until your wake stirs it. Optics flare, and it ' +
        'pings a single challenge across the channel: a takeover duel.',
    root: {
        prompt: 'The stray droid squares up. Do you jack in?',
        answers: [
            {
                choice: 'Jack the pet in and take it over',
                tone: 'good',
                outcome: {
                    resultText: 'The pet dives into its circuitry — claim the board and the droid is yours.',
                    effects: [
                        {
                            kind: 'spawnGame',
                            game: 'duel',
                            reason: 'stray-droid',
                            launch: { kind: 'duel', boardLevel: 'normal', aiLevel: 'normal' },
                        },
                    ],
                },
            },
            {
                choice: 'Toss it some scrap to stand down',
                tone: 'neutral',
                outcome: {
                    resultText: 'You jettison a handful of marbles as tribute. It powers down and lets you drift on.',
                    effects: [{ kind: 'resource', marbles: -5 }],
                },
            },
            {
                choice: 'Shoot first',
                tone: 'bad',
                outcome: {
                    resultText:
                        'You fire on it cold. It survives the first burst and rakes your hull before going dark.',
                    effects: [{ kind: 'resource', hull: -2 }],
                },
            },
        ],
    },
};
