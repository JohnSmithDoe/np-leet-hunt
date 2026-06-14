import { PlanetEvent } from '../event.model';

/**
 * Core-pool event — transformed from the `AI.md` "Space Whales Encounter" brainstorm. Two transforms
 * worth noting (event-system.md §10): (1) AI.md's follow-up branches were *reactions* (how the whale
 * responds), not player choices — they became real player decisions; (2) the "ignore it" branch
 * terminates at depth 1, the others run to depth 2, demonstrating the flexible-depth model (§4).
 * Re-framed to fire on planet arrival (whale in orbit) so a core event fits a planet landing.
 */
export const spaceWhale: PlanetEvent = {
    id: 'space-whale',
    intro:
        "You ease into orbit and a vast shape detaches from the planet's nightside — a space whale, " +
        'old as the dark, turning one slow eye toward your ship.',
    root: {
        prompt: 'It watches, waiting. What do you do?',
        answers: [
            {
                choice: 'Hail it with a friendly signal',
                tone: 'good',
                followUp: {
                    prompt: 'It answers in a low song that rattles the hull — curious, warm. What do you send back?',
                    answers: [
                        {
                            choice: 'Ask the way to somewhere hidden',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'It sings you a route no chart holds, then turns its great flank to lead the way.',
                                effects: [
                                    { kind: 'openRoute', to: 'whale-hidden-planet' },
                                    { kind: 'flag', set: 'whale-befriended' },
                                ],
                            },
                        },
                        {
                            choice: 'Trade it a song of your own',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'You pipe back what the crew can hum. The whale calls it a fair gift and leaves ' +
                                    'a glittering rime of marbles in its wake.',
                                effects: [{ kind: 'resource', marbles: 14 }],
                            },
                        },
                        {
                            choice: 'Try to net a sample of its hide',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'The song curdles. A sonic blast bowls the ship sideways before the whale ' +
                                    'sounds and is gone.',
                                effects: [{ kind: 'resource', hull: -2 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Hold back and watch it',
                tone: 'neutral',
                followUp: {
                    prompt: 'From a careful distance you log its drift. It notices — and drifts closer. Then?',
                    answers: [
                        {
                            choice: 'Join its slow, looping games',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'You fly the patterns it traces until the crew is breathless with laughing. ' +
                                    'Play keeps the grey out; the front loosens its grip a notch.',
                                effects: [
                                    { kind: 'front', advance: -1 },
                                    { kind: 'flag', set: 'played-with-whale' },
                                ],
                            },
                        },
                        {
                            choice: 'Hold position and just record',
                            tone: 'neutral',
                            outcome: {
                                resultText: 'Good data, no risk. The whale tires of the staring and moves on.',
                                effects: [{ kind: 'resource', marbles: 5 }],
                            },
                        },
                        {
                            choice: 'Power up as it nears',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'It reads the charging weapons as a threat and lunges once, hard, before fleeing.',
                                effects: [{ kind: 'resource', hull: -1, heart: -1 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Ignore it and press on',
                tone: 'bad',
                outcome: {
                    resultText:
                        'You burn past without a second look. Later, in the quiet, the crew keeps glancing back — ' +
                        'as if you left something unsaid out there in the dark.',
                    effects: [{ kind: 'flag', set: 'snubbed-whale' }],
                },
            },
        ],
    },
};
