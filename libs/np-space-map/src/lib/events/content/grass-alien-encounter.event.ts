import { PlanetEvent } from '../event.model';

/**
 * Home Reach planet event — transformed from the `AI.md` "Alien Encounter" grass-planet brainstorm
 * (good = a friend, neutral = whole crew, bad = alone, each with its own three-way follow-up). The
 * prose became typed choices; the implied stakes became structured effects. See event-system.md §9.
 */
export const grassAlienEncounter: PlanetEvent = {
    id: 'grass-alien-encounter',
    sector: 'home-reach',
    intro:
        'A green world — actual grass, impossible and yet. Scanners catch faint life. You set down at ' +
        'the edge of a meadow that has no business existing this far out.',
    root: {
        prompt: 'Who heads out with you?',
        answers: [
            {
                choice: 'Take one friend from the crew',
                tone: 'good',
                followUp: {
                    prompt: 'You pick your most adventurous crewmate. The meadow rolls out ahead — which way?',
                    answers: [
                        {
                            choice: 'Follow the worn trail',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'The trail winds through fields thick with creatures neither of you can name. ' +
                                    'You fill a sample case and head back grinning.',
                                effects: [
                                    { kind: 'resource', marbles: 12 },
                                    { kind: 'item', grant: 'xeno-samples' },
                                ],
                            },
                        },
                        {
                            choice: 'Cut off-road into the unknown',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'Caves, a cold river, a scramble over wet rock. Hairy in places, but you both ' +
                                    'make it back with a story and a scrape or two.',
                                effects: [{ kind: 'resource', heart: -1, marbles: 8 }],
                            },
                        },
                        {
                            choice: 'Climb for the summit view',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'Slope turns to cliff, then to ice. You turn back battered, the view unearned.',
                                effects: [{ kind: 'resource', heart: -2 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Bring the whole crew',
                tone: 'neutral',
                followUp: {
                    prompt: 'Everyone spills out and splits to cover ground. How do you run it?',
                    answers: [
                        {
                            choice: 'Keep constant contact',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'Chatter on every channel — finds pooled, dangers called early. A clean, ' +
                                    'thorough sweep.',
                                effects: [
                                    { kind: 'resource', marbles: 10 },
                                    { kind: 'flag', set: 'grass-surveyed' },
                                ],
                            },
                        },
                        {
                            choice: 'Work as one team, one goal',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'Slower, but solid. You leave with steady hands and a little to show for it.',
                                effects: [{ kind: 'resource', marbles: 6 }],
                            },
                        },
                        {
                            choice: 'Let them compete for the best find',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'It turns into a race. Someone takes a tumble in the bragging, and the haul ' +
                                    'suffers.',
                                effects: [{ kind: 'resource', heart: -1, marbles: 3 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Go alone',
                tone: 'bad',
                followUp: {
                    prompt: 'Quiet — just you and the grass. Then something shifts at the treeline.',
                    answers: [
                        {
                            choice: 'Approach the creature watching you',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'Tentacles, too many eyes, a sound like a half-remembered tune. It tilts its ' +
                                    'head — and decides you are a friend.',
                                effects: [
                                    { kind: 'item', grant: 'meadow-charm' },
                                    { kind: 'flag', set: 'met-meadow-thing' },
                                ],
                            },
                        },
                        {
                            choice: 'Dig at the glint in the soil',
                            tone: 'neutral',
                            outcome: {
                                resultText: 'A buried trinket, humming and warm. Worth something to someone.',
                                effects: [{ kind: 'resource', marbles: 9 }],
                            },
                        },
                        {
                            choice: 'Wander further in',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'You lose the ship, then the light. By the time the pet finds you, the meadow ' +
                                    'has taken its toll.',
                                effects: [
                                    { kind: 'resource', heart: -2 },
                                    { kind: 'front', advance: 1 },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    },
};
