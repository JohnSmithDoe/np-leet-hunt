import { PlanetEvent } from '../event.model';

/**
 * Core-pool planet event — transformed from the `AI.md` "friendly alien guide (Zeebo)" brainstorm
 * (good = trust him, neutral = question him first, bad = send him away — each with a three-way
 * follow-up). The harsh "lose your life" leaf became a duel hand-off rather than a hard fail, in line
 * with the GDD's preference for consequence over game-over. See event-system.md §9/§10.
 */
export const zeeboGuide: PlanetEvent = {
    id: 'zeebo-guide',
    intro:
        'You have barely stepped onto the dust before a spindly local bounds up, all elbows and grin. ' +
        '"Zeebo!" it announces, thumping its chest. "Local explorer. I show you the good bits, yes?"',
    root: {
        prompt: 'Do you take Zeebo up on the offer?',
        answers: [
            {
                choice: 'Trust him and follow',
                tone: 'good',
                followUp: {
                    prompt: 'He leads you to a cave mouth. "Treasure," he whispers. "Old, old treasure." Go in?',
                    answers: [
                        {
                            choice: 'Head in — you love a good cave',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'A chest of gems and odd little artefacts, exactly as promised. Zeebo beams and ' +
                                    'waves off any share. You leave richer, and one friend better off.',
                                effects: [
                                    { kind: 'resource', marbles: 18 },
                                    { kind: 'item', grant: 'zeebo-trinket' },
                                    { kind: 'flag', set: 'zeebo-friend' },
                                ],
                            },
                        },
                        {
                            choice: 'Hang back — caves are how stories end',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'Zeebo shrugs, a little hurt, and ducks inside alone. You will never know whether ' +
                                    'there was treasure or just a clever liar.',
                                effects: [{ kind: 'flag', set: 'zeebo-declined' }],
                            },
                        },
                        {
                            choice: 'Follow him in — then jump him for it',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'There is no treasure, only a trap you triggered by turning on the one creature ' +
                                    'being kind to you. You limp out empty-handed and ashamed.',
                                effects: [{ kind: 'resource', heart: -2 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Hear him out first',
                tone: 'neutral',
                followUp: {
                    prompt: 'Zeebo answers every question patiently — names, places, local secrets. Believe him?',
                    answers: [
                        {
                            choice: 'Yes — he clearly knows this world',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'He walks you through sights no chart marks, narrating as he goes. You leave knowing ' +
                                    'the place — and the way the locals tell its time.',
                                effects: [
                                    { kind: 'resource', marbles: 8 },
                                    { kind: 'flag', set: 'learned-local-lore' },
                                ],
                            },
                        },
                        {
                            choice: 'Politely go your own way',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'He wishes you luck and means it. You explore alone — fewer finds, fewer risks.',
                                effects: [{ kind: 'resource', marbles: 4 }],
                            },
                        },
                        {
                            choice: 'Scoff at him and his backwater rock',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'Zeebo draws himself up to his full, unimpressive height and demands satisfaction. ' +
                                    'You talk your way out, but the welcome here has soured.',
                                effects: [{ kind: 'flag', set: 'insulted-zeebo' }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Send him off',
                tone: 'bad',
                followUp: {
                    prompt: 'Stung, he warns you the planet is more dangerous than it looks. Do you listen?',
                    answers: [
                        {
                            choice: 'Apologise — that was rude of you',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'He forgives you at once, far too easily, and guides you safely past hazards you ' +
                                    'never even saw. Kindness, it turns out, was the smart play.',
                                effects: [{ kind: 'flag', set: 'zeebo-friend' }],
                            },
                        },
                        {
                            choice: 'Ignore him and wander off',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'You strike out alone. A few scrapes, a few surprises, nothing you could not handle.',
                                effects: [{ kind: 'resource', heart: -1, marbles: 5 }],
                            },
                        },
                        {
                            choice: 'Wave your blaster to make the point',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'Zeebo bolts, and a distress klaxon answers him. Armed locals close in — looks like ' +
                                    'you will be settling this the hard way.',
                                effects: [
                                    { kind: 'spawnGame', game: 'duel', launch: { reason: 'zeebo-ambush' } },
                                    { kind: 'resource', heart: -1 },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    },
};
