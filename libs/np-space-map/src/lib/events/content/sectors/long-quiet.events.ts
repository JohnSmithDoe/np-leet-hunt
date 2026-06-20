import { PlanetEvent } from '../../event.model';

/**
 * The Long Quiet sector pool (`long-quiet`) — the greyest, oldest space, where the Hush has nearly
 * finished tidying: clocks run down, color is all but gone, and everything is one breath from being
 * forgotten. The melancholy floor of the game (game-design.md §5). Authoring leans into quiet, slow
 * grief and consequence over punishment — several outcomes carry no effects at all, because some
 * losses don't pay marbles. The Unwound (the saddest fight) and the held sibling live in this sector.
 * Tones stored good|neutral|bad; presentation is shuffled (event-system.md §4). See event-system.md §9.
 */
export const longQuietEvents: PlanetEvent[] = [
    {
        id: 'quiet-stopped-clock',
        sector: 'long-quiet',
        intro:
            'A grey town square, and at its heart a clock tower the size of a cathedral. The hands have ' +
            'stopped. Nothing here moves except the dust, settling.',
        root: {
            prompt: 'The great clock has run down. What do you do with it?',
            answers: [
                {
                    choice: 'Find the key and wind it',
                    tone: 'good',
                    followUp: {
                        prompt: 'The winding key is rusted fast. How do you turn it?',
                        answers: [
                            {
                                choice: 'Coax it slowly, a little at a time',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It moves. One tooth, then another, then the long sigh of a spring ' +
                                        'remembering its job. The hands shudder forward and the square fills, just ' +
                                        'for a moment, with the sound of a living hour. The grey loses a little ground.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'wound-the-quiet-clock' },
                                    ],
                                },
                            },
                            {
                                choice: 'Force it before it breaks loose',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The key turns with a crack. The clock ticks twice — proud, defiant — and ' +
                                        'then a tooth shears away and it falls silent for good. Two seconds of time, ' +
                                        'bought and spent. You pocket the broken key anyway.',
                                    effects: [{ kind: 'item', grant: 'broken-winding-key' }],
                                },
                            },
                            {
                                choice: 'Pry the mechanism open for parts',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You strip it down to a heap of cold brass. There is a little salvage in it, ' +
                                        'and afterward the square is quieter than before, the way a room is quieter ' +
                                        'once the clock you never noticed has gone.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Listen for whatever it kept time for',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You stand under the stopped hands and listen. There is nothing to hear — that is the ' +
                            'whole of it. Whatever this clock counted out, the counting is done, and no one is left ' +
                            'to be late. You leave it to its rest.',
                        effects: [],
                    },
                },
                {
                    choice: 'Leave it — clocks here are bad luck',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You turn your back on it and hurry off. Somewhere behind you the last tension goes out ' +
                            'of the old spring, and the grey folds the square away as if it had never told a single hour.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-last-lighthouse',
        sector: 'long-quiet',
        intro:
            'A lighthouse planet, alone in an emptied dark. Its lamp still turns, but the colour has bled ' +
            'out of the beam until it sweeps the void a pale, exhausted grey.',
        root: {
            prompt: 'The keeper waves you down from the gallery. What does he want?',
            answers: [
                {
                    choice: 'Ask how you can help him keep the light',
                    tone: 'good',
                    followUp: {
                        prompt: '"The lamp is fine," he says. "It is the oil. There is so little left." What do you offer?',
                        answers: [
                            {
                                choice: 'Give him fuel from your own stores',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'He pours it carefully, as if it were memory. The beam steadies and warms by ' +
                                        'a single shade. "Now it will turn a while longer," he says, and you cannot tell ' +
                                        'if he means the light or himself. He presses an old chart into your hands.',
                                    effects: [
                                        { kind: 'item', grant: 'keepers-grey-chart' },
                                        { kind: 'openRoute', to: 'lighthouse-shoals' },
                                    ],
                                },
                            },
                            {
                                choice: 'Sit with him through one turn of the lamp',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You watch the beam come round, and round, and round. He does not say much. ' +
                                        'When you leave, the light is no brighter, but he stands a little straighter at ' +
                                        'his post, having been seen at it once before the end.',
                                    effects: [{ kind: 'flag', set: 'sat-with-the-keeper' }],
                                },
                            },
                            {
                                choice: 'Promise to send help, then go',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You both know there is no help to send and nowhere to send it from. He thanks ' +
                                        'you for the kindness of the lie. The beam follows you out into the dark for as ' +
                                        'long as it can reach, and then it does not.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Take a bearing off the beam while it lasts',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You let the failing light line up your instruments. It is enough for a clean fix on the ' +
                            'next leg. Behind you the keeper keeps turning his lamp for no ship at all.',
                        effects: [{ kind: 'resource', marbles: 7 }],
                    },
                },
                {
                    choice: 'Strip the lamp for its lens and lumens',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The keeper does not fight you; he only watches, hands folded, as you take the heart of his ' +
                            'light. The salvage is good. The dark that closes over the gallery behind you is total.',
                        effects: [
                            { kind: 'resource', marbles: 12 },
                            { kind: 'resource', heart: -1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-empty-carousel',
        sector: 'long-quiet',
        intro:
            'A fairground, greyed to the bone. The painted horses of a great carousel have faded to ash-white ' +
            'shapes, and the calliope sits open-mouthed and silent in the cold.',
        root: {
            prompt: "You find the carousel's music drum, its pins worn nearly smooth. What do you do?",
            answers: [
                {
                    choice: 'Set the old tune playing once more',
                    tone: 'good',
                    followUp: {
                        prompt: 'The first notes wheeze out, wrong and lovely. The horses begin to turn. Do you ride?',
                        answers: [
                            {
                                choice: 'Climb on and let it carry you round',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'For three full turns the grey forgets to look at you, and the fairground is ' +
                                        'a fairground again — tinny, bright, alive. Play has pried a little of itself ' +
                                        'back from the quiet. You step off lighter than you got on.',
                                    effects: [
                                        { kind: 'resource', marbles: 10 },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Stand back and just listen to it play',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The calliope plays its whole song to an empty fairground, and you to no one ' +
                                        'in particular. It is a sad sound and a good one. When it winds down you let it ' +
                                        'stop, and do not start it again.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Keep it spinning faster and faster',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You crank it past what the old gears can bear. The tune sours into a shriek, ' +
                                        'a horse splinters from its pole, and the whole frail wonder of it shakes ' +
                                        'itself apart. You should have let it be enough.',
                                    effects: [{ kind: 'resource', heart: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Take a faded horse for the ship',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You lift one ashen horse from its pole. It weighs nothing now. Maybe somewhere with more ' +
                            'colour left in it the paint will come back. Maybe it is only a keepsake. You take it anyway.',
                        effects: [{ kind: 'item', grant: 'carousel-horse' }],
                    },
                },
                {
                    choice: 'Walk on — fairgrounds make you ache',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You leave the calliope to its silence. It is the sensible thing, and it costs you nothing ' +
                            'you can put a number to, and you feel it anyway, all the way back to the ship.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-forgetting-archive',
        sector: 'long-quiet',
        intro:
            'A library moon, shelves running off into the grey for miles. As you watch, words lift off the ' +
            'open pages like dust and drift away, and the books close themselves, blank.',
        root: {
            prompt: 'The archive is forgetting itself. Can anything be saved?',
            answers: [
                {
                    choice: 'Read one book aloud before it empties',
                    tone: 'good',
                    followUp: {
                        prompt: 'You grab the nearest still-written volume. What is it?',
                        answers: [
                            {
                                choice: "A child's book of games and rhymes",
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You read it aloud, every silly rule and skipping-rhyme, and the words stay on ' +
                                        'the page because someone is playing them again. The robo-pet copies it down. ' +
                                        'One small book, remembered out of the whole forgetting moon.',
                                    effects: [
                                        { kind: 'item', grant: 'book-of-games' },
                                        { kind: 'flag', set: 'saved-a-book' },
                                    ],
                                },
                            },
                            {
                                choice: 'A ledger of names you do not know',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        "You read out names — strangers, every one, gone past anyone's caring. They " +
                                        'hold while you speak them and fade the instant you stop. You say as many as ' +
                                        'you can before your voice gives out. It is not nothing. It is not much.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Grab an armful and bolt before they go blank',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You run for the ship clutching as many as you can hold. By the airlock every ' +
                                        'page in your arms has gone smooth and white. You saved the covers. The grey ' +
                                        'kept the words.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Let the robo-pet scan what it can',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'The pet hums down the aisles, catching fragments before they lift away — half a map, a ' +
                            'recipe, the start of a song. Scraps, but scraps are how a telling gets told. It keeps them safe.',
                        effects: [{ kind: 'flag', set: 'archive-fragments' }],
                    },
                },
                {
                    choice: "There's nothing here but paper — move on",
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You leave the library to empty itself in peace. By the time you reach orbit the last word ' +
                            "has lifted from the last page, and a moon's worth of everything-once-known is simply gone.",
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-greyed-orchard',
        sector: 'long-quiet',
        intro:
            'A planet that was once an orchard. The trees still stand in their rows, grey as cobwebs, and one ' +
            'last apple hangs at the end of a colourless branch, holding a single stubborn blush of red.',
        root: {
            prompt: 'The last colour in the orchard is in that one apple. What do you do?',
            answers: [
                {
                    choice: 'Plant its seeds somewhere they might grow',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You will not eat it. You cut it open, take the seeds, and tuck them away for ground with ' +
                            'more life left in it than this. Maybe nothing comes of it. Maybe a red orchard, somewhere, ' +
                            'someday. Hope weighs almost nothing and you carry it anyway.',
                        effects: [
                            { kind: 'item', grant: 'red-apple-seeds' },
                            { kind: 'flag', set: 'orchard-seeds-kept' },
                        ],
                    },
                },
                {
                    choice: 'Share it with the crew, here and now',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You split the last apple every way it will go. It is the best thing anyone has tasted in ' +
                            'a long while, and it is gone in a minute, and the orchard goes fully grey behind you as you ' +
                            'eat. Some things are only meant to be a small good moment, and then over.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Take it whole to sell down the line',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You wrap it for market. By the next jump the red has drained out of it into the same grey ' +
                            'as everything else, and you are left holding a worthless ashen thing and the memory of a ' +
                            'colour you could have just looked at a while longer.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-unwound-knight',
        sector: 'long-quiet',
        intro:
            'In a hall of stopped clocks kneels a clockwork knight, head bowed, frozen mid-vigil. A faint ' +
            "tick still comes from somewhere deep inside the armour — slowing. This is no guardian's gate, " +
            'only one of his kin, run down on his watch.',
        root: {
            prompt: 'The knight is winding down where he kneels. What do you do?',
            answers: [
                {
                    choice: 'Look for his winding key to give him one more turn',
                    tone: 'good',
                    followUp: {
                        prompt: 'The key hangs on a chain at his belt. As your hand closes on it, his head lifts. He speaks?',
                        answers: [
                            {
                                choice: 'Wind him gently and let him say his piece',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'He thanks you in a voice like a music box. He was set to guard something long ' +
                                        'forgotten; he asks only to be remembered as having kept faith. The robo-pet ' +
                                        'records his name. He winds down again, content, and this time you let him rest.',
                                    effects: [
                                        { kind: 'flag', set: 'remembered-the-knight' },
                                        { kind: 'item', grant: 'knights-tin-medal' },
                                    ],
                                },
                            },
                            {
                                choice: 'Wind him fully and ask the way to the last gate',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Restored, he rises and points a trembling gauntlet down a corridor of stilled ' +
                                        "hours toward the Unwound's hall, where the sibling is kept. Duty spent, he " +
                                        'kneels back into his vigil. The way ahead is open.',
                                    effects: [{ kind: 'openRoute', to: 'unwound-hall' }],
                                },
                            },
                            {
                                choice: 'Take the key — it must be worth something',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You unhook the key and the last tick stops at once. He does not fall; clockwork ' +
                                        'knights do not. He simply will not move again, and the silence where his ticking ' +
                                        'was follows you out of the hall. The key is just brass in your pocket.',
                                    effects: [
                                        { kind: 'item', grant: 'knights-winding-key' },
                                        { kind: 'resource', heart: -2 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Kneel beside him and keep the vigil a while',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You do not have a key and would not know which way to turn it. So you simply kneel beside ' +
                            'him and wait, two small watchers in a hall of stopped time, until his tick fades to nothing. ' +
                            'Then you stand, and go on.',
                        effects: [],
                    },
                },
                {
                    choice: 'Test your steel against a knight at last',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You strike his pauldron to wake him to a fight. Old gears scream into motion — he will ' +
                            'not refuse a challenge even now — and he comes up off his knee with a rust-bitten blade, ' +
                            'bound by a duty he cannot remember to a foe he never wanted.',
                        effects: [{ kind: 'spawnGame', game: 'duel', reason: 'unwound-knight-duel' }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-paling-aurora',
        sector: 'long-quiet',
        intro:
            'An ice giant trails the last aurora in the sector, but its curtains have washed out to a faint ' +
            'pewter shimmer — the ghost of the colours it used to throw across the dark.',
        root: {
            prompt: 'The aurora is nearly spent. How do you meet it?',
            answers: [
                {
                    choice: 'Run the ship through it to feel it once',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You fly the ship slow through the pale curtains. For a few minutes the hull glows with the ' +
                            "last of someone else's colour, and the crew crowds the ports in silence. You leave the " +
                            'aurora behind you, no dimmer for the sharing — and somehow it lent you a little of itself.',
                        effects: [
                            { kind: 'resource', heart: 1 },
                            { kind: 'front', advance: -1 },
                        ],
                    },
                },
                {
                    choice: "Photograph it while there's anything to keep",
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You log every frame the sensors can hold. The images will keep when the real thing does ' +
                            'not. The robo-pet files them with the other tellings, against the day someone wants to ' +
                            'remember what a sky used to do.',
                        effects: [{ kind: 'flag', set: 'logged-the-aurora' }],
                    },
                },
                {
                    choice: 'Tap its field for a quick charge and go',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            "You bleed the aurora's field into the cells for a tidy power gain. The curtains gutter, " +
                            'thin, and snuff out as you pull away — the last colour off this whole ice giant, spent on ' +
                            'topping up a battery.',
                        effects: [{ kind: 'resource', marbles: 9 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-grey-fleet-derelict',
        sector: 'long-quiet',
        intro:
            'A Grey Fleet thief-drone drifts dead ahead, half-greyed itself, its tractor still clamped on a ' +
            'little stash it stole before it wound down. Out here even the wardens are forgotten.',
        root: {
            prompt: 'The drone is derelict, its cargo loose in the clamp. What do you do?',
            answers: [
                {
                    choice: 'Free the stash and learn what the drone forgot',
                    tone: 'good',
                    followUp: {
                        prompt: "Prising the cargo loose wakes a flicker of the drone's log. Read it?",
                        answers: [
                            {
                                choice: 'Read it through — there may be a trail in it',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The log is a list of everything this drone was sent to take and feed to the ' +
                                        'grey. One entry glows brighter than the rest — a marker, family-coloured, ' +
                                        'logged but never collected. It points somewhere off your charts.',
                                    effects: [
                                        { kind: 'resource', marbles: 6 },
                                        { kind: 'openRoute', to: 'uncollected-marker' },
                                    ],
                                },
                            },
                            {
                                choice: 'Just take the stash and leave the log dark',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You pull the cargo free and let the drone keep its secrets. A decent little ' +
                                        'haul, won back from the grey it was bound for. The drone drifts on, emptied, ' +
                                        'with nothing left to do and no one to tell it to stop.',
                                    effects: [{ kind: 'resource', marbles: 8 }],
                                },
                            },
                            {
                                choice: 'Wipe the log so it can never report you',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        "You scrub the drone's memory clean — and with it goes the one record that " +
                                        'anything here was ever stolen, or ever worth stealing. You are starting to ' +
                                        'tidy things away as neatly as the Hush does.',
                                    effects: [{ kind: 'flag', set: 'wiped-warden-log' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: "Salvage the drone's parts and move on",
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You strip the hulk for usable plating and patch a few of your own scars with it. Warden ' +
                            'steel, turned to mending. It is a small justice, and a useful one.',
                        effects: [{ kind: 'resource', hull: 1 }],
                    },
                },
                {
                    choice: "Jolt it awake to take whatever it's still carrying",
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A surge brings the drone shuddering back online. It is half-greyed and entirely sure of ' +
                            'its orders: defend the cargo, flee with it, feed it to the front. Its clamps come up and ' +
                            'its drives spin hot.',
                        effects: [{ kind: 'spawnGame', game: 'duel', reason: 'derelict-drone-wakes' }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-last-radio',
        sector: 'long-quiet',
        intro:
            'A relay station tumbles slowly through the dark, and from its one working speaker comes a voice — ' +
            'a broadcast on loop, cheerful and decades old, talking to a sector that stopped listening long ago.',
        root: {
            prompt: 'The old broadcast still plays to no one. What do you do?',
            answers: [
                {
                    choice: 'Answer the broadcast as if it were live',
                    tone: 'good',
                    followUp: {
                        prompt: 'You key the mic and say hello. To your surprise, the loop stutters — and answers back. Then?',
                        answers: [
                            {
                                choice: 'Talk with it, the way the kid would',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It is only an old automated host, but no one has spoken to it in so long that ' +
                                        'something like a person has grown up in the gaps. You trade jokes and weather ' +
                                        'reports for nowhere. It signs off happier than it has been in years, and so do you.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'flag', set: 'answered-the-relay' },
                                    ],
                                },
                            },
                            {
                                choice: 'Ask it for the local frequencies and routes',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It rattles off old traffic patterns, half of them to planets that are grey ' +
                                        'now. But buried in the litany is one live channel still worth flying. You thank ' +
                                        'it; it tells you to drive safe, and means it.',
                                    effects: [{ kind: 'openRoute', to: 'relay-live-channel' }],
                                },
                            },
                            {
                                choice: 'Loop your own message over its broadcast',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You overwrite the cheerful old loop with a beacon of your own. Efficient. The ' +
                                        'voice that kept the dark company for decades is gone mid-word, and the relay ' +
                                        'tumbles on carrying only you, talking to no one.',
                                    effects: [{ kind: 'flag', set: 'overwrote-the-relay' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Record the loop before the station dies',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            "You capture the whole cheerful, dated, lovely broadcast to the pet's memory. One more voice " +
                            'saved out of the quiet, to play back on some long jump when the silence gets too heavy.',
                        effects: [{ kind: 'item', grant: 'old-broadcast-loop' }],
                    },
                },
                {
                    choice: 'Strip the relay for its transmitter',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A good transmitter is worth real marbles, and you take it. The speaker cuts off mid-sentence ' +
                            'as you pull the core, and the relay goes as silent as everything else out here. You try not ' +
                            'to think about the sentence it never finished.',
                        effects: [{ kind: 'resource', marbles: 11 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-sandglass-shore',
        sector: 'long-quiet',
        intro:
            'A grey shore where the tide is made of sand, hissing in and out under stopped stars. Half-buried ' +
            'in it stands a sandglass as tall as a person, its last grains nearly run through.',
        root: {
            prompt: "The great sandglass is almost empty. What do you do with the time that's left?",
            answers: [
                {
                    choice: 'Turn it over to give the shore more time',
                    tone: 'good',
                    followUp: {
                        prompt: 'The glass is heavy and the last grains are falling fast. Do you manage it?',
                        answers: [
                            {
                                choice: 'Heave it over before the last grain drops',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You get it over with a grain to spare. The sand-tide turns and breathes back ' +
                                        'in, and the shore holds — a stretch of the quiet kept from being tidied away ' +
                                        'just yet. Your arms ache pleasantly with the weight of having helped.',
                                    effects: [{ kind: 'front', advance: -1 }],
                                },
                            },
                            {
                                choice: 'Catch the last grains to keep as you can',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You cup your hands under the neck of the glass and catch the final grains. ' +
                                        "A pinch of the shore's last hour, warm in your palm. The shore goes grey behind " +
                                        'you, but you carry a little of its time away with you.',
                                    effects: [{ kind: 'item', grant: 'pinch-of-last-sand' }],
                                },
                            },
                            {
                                choice: "Let it finish — you can't save everything",
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You stand back and watch the last grain fall. The sand-tide goes still and the ' +
                                        'stars over the shore wink out, one by one, like a hand turning off a row of ' +
                                        'lamps. It was always going to end. You only chose to be there for it.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Comb the sand for what the tide has left',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            "You walk the grey strand and the sand gives up its keepsakes — a coin, a buckle, a child's " +
                            'lost toy, all the small things tides collect. You pocket the lot. Beachcombing at the end ' +
                            'of the world.',
                        effects: [{ kind: 'resource', marbles: 7 }],
                    },
                },
                {
                    choice: 'Smash the glass to free its sand for salvage',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            "The glass breaks beautifully and its hour spills out all at once, the whole shore's " +
                            'remaining time dumped into a single grey heap. There is fine glass to gather, and you cut ' +
                            'your hand gathering it, and the shore is simply over now.',
                        effects: [
                            { kind: 'resource', marbles: 5 },
                            { kind: 'resource', heart: -1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-last-candle',
        sector: 'long-quiet',
        intro:
            'A tiny world, no bigger than a chapel, and on it a single candle burns down in a window — the ' +
            'last open flame in the whole grey quarter, guttering in a draught that has no business out here.',
        root: {
            prompt: 'The candle has minutes left. What do you do with its little light?',
            answers: [
                {
                    choice: 'Cup your hands around it against the draught',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You shield it with both palms and your own breath held. The flame leans into the shelter ' +
                            'and steadies, and for a while it is just you and one warm fleck of orange holding off an ' +
                            'enormous grey. Small things, done stubbornly, are how the dark gets cheated.',
                        effects: [
                            { kind: 'resource', heart: 1 },
                            { kind: 'front', advance: -1 },
                        ],
                    },
                },
                {
                    choice: 'Light a wick of your own from it before it goes',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You touch a taper to the failing flame and carry a daughter-light back to the ship. The ' +
                            'first candle dies in the window the moment you turn away, but its fire goes on, smaller and ' +
                            'somewhere else. That is most of what passing-on ever is.',
                        effects: [{ kind: 'item', grant: 'carried-flame' }],
                    },
                },
                {
                    choice: 'Pinch it out — a flame this faint just hurts to watch',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You wet your fingers and snuff it, telling yourself it is mercy. The little world goes ' +
                            'dark all at once, and the draught dies too, having nothing left to push against. You did ' +
                            'the grey one chore it had not gotten to yet.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-frozen-procession',
        sector: 'long-quiet',
        intro:
            'A grey boulevard, and along it a funeral procession stopped dead mid-step — mourners, bearers, a ' +
            'small coffin draped in colourless flowers, all of them caught and held by the Hush in the act of ' +
            'grieving, forever about to take the next pace.',
        root: {
            prompt: 'The procession is frozen mid-mourning. What do you do here?',
            answers: [
                {
                    choice: 'Walk the route with them to its end',
                    tone: 'good',
                    followUp: {
                        prompt: 'You fall in at the back of the stilled column. To finish the rite, what do you give it?',
                        answers: [
                            {
                                choice: 'Say the few words you can remember for the lost',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You do not know who is in the little coffin, so you speak for all of them — the ' +
                                        'taken, the tidied, the family up the channel ahead of you. The frozen mourners ' +
                                        'do not move, but somehow the boulevard feels less unfinished. A rite needs only ' +
                                        'one living voice.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'flag', set: 'spoke-for-the-procession' },
                                    ],
                                },
                            },
                            {
                                choice: 'Lay one of your own keepsakes on the bier',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You leave something small and yours among the grey flowers — a gift to strangers ' +
                                        'who will never thank you. It costs you a little and buys you nothing, which is, ' +
                                        'you suspect, the entire point of leaving flowers for the dead.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Take a flower from the coffin as a token',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You lift a single bloom off the small coffin to keep. It crumbles to grey dust ' +
                                        'in your hand before you reach the ship, and the gap it left in the flowers is the ' +
                                        'only thing about the whole procession that ever changed. You wish you had not.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Read the names on the stilled banners',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'The banners carry names in a faded hand, the dead and the mourning both. You read each one ' +
                            'and the pet writes them down, so that somewhere off this boulevard a record exists that these ' +
                            'people once walked, and grieved, and were going somewhere.',
                        effects: [{ kind: 'flag', set: 'logged-the-mourners' }],
                    },
                },
                {
                    choice: 'Slip past quietly — this is not your grief',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You edge along the wall and out the far end, careful not to disturb a single stilled hem. ' +
                            'It is the polite thing, the respectful thing. It is also one more procession that no living ' +
                            'soul will ever finish walking, and you knew that, and you left anyway.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-drifting-bedroom',
        sector: 'long-quiet',
        intro:
            "A whole child's bedroom adrift in the void — bed, rug, a shelf of slumping toys, one wall torn " +
            'clean off a house that is no longer anywhere. The Hush took the home and somehow forgot this one ' +
            'room, tumbling slowly with the lights still on inside.',
        root: {
            prompt: "Someone's whole childhood is drifting here, half-grey. What do you do?",
            answers: [
                {
                    choice: 'Play one game the room was made for, just once',
                    tone: 'good',
                    followUp: {
                        prompt: 'You step in among the toys. Which do you pick up to play with?',
                        answers: [
                            {
                                choice: 'Wind the toys up and let them march across the rug',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You set the tin soldiers and the spotted dog marching, and for one daft minute ' +
                                        'the room is a room a child lives in. The grey on the walls actually pulls back a ' +
                                        'shade where the playing reaches. Play is the loophole; it works even here, even now.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Sit on the bed and read the open storybook',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A storybook lies open where it was set down mid-tale. You read to the end of it, ' +
                                        "sitting on a stranger-child's bed at the edge of nothing, and you do not know how " +
                                        'the story comes out because the last pages have already gone grey. You make up a ' +
                                        'kind ending and leave it at that.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Pocket the brightest toy and call it salvage',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You take the one toy with any colour left in it and tell yourself a child would ' +
                                        'want it loved rather than lost. Maybe. The room dims behind you as you go, the way ' +
                                        'a room does when its last bright thing has left it.',
                                    effects: [{ kind: 'item', grant: 'salvaged-bright-toy' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Tow the room somewhere it can be kept safe',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You rig a line and tow the tumbling room toward steadier dark, where the grey thins. It is ' +
                            'slow, clumsy work for no reward you can spend, and you do it anyway, so that one childhood ' +
                            'gets to keep drifting a while longer with its lights on.',
                        effects: [{ kind: 'flag', set: 'towed-the-bedroom' }],
                    },
                },
                {
                    choice: 'Strip it for the working lights and fittings',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Good lamps, sound wiring, a battery still half-charged — it all comes out clean and it all ' +
                            'spends well down the line. You leave the room dark and tumbling, the bed unmade for a child ' +
                            'who will not be back to it. The marbles feel heavier than they should.',
                        effects: [{ kind: 'resource', marbles: 8 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-wishing-fountain',
        sector: 'long-quiet',
        intro:
            'A plaza built around a great fountain that has run dry, its basin a grey bowl of dust and dull ' +
            'coins — every coin a wish someone once threw, none of them granted now, none of them ever to be.',
        root: {
            prompt: 'The wishing fountain is dust. What do you do at the dry basin?',
            answers: [
                {
                    choice: 'Throw in a coin and make a wish anyway',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You flick one marble in. It clinks among a thousand dead wishes and you wish the daft, ' +
                            'enormous, only wish there is — them, back, all of them. Nothing happens. You feel oddly ' +
                            'better for having asked the universe out loud, even into a fountain too tired to listen.',
                        effects: [
                            { kind: 'resource', marbles: -3 },
                            { kind: 'resource', heart: 1 },
                        ],
                    },
                },
                {
                    choice: 'Read the wishes scratched around the rim',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'People carved their wishes into the stone lip where the water used to lap. A bicycle. A ' +
                            'baby. One more summer. You read them all and add none of your own, and you leave the plaza ' +
                            'carrying the weight of a thousand small ordinary hopes that the grey is busy un-hoping.',
                        effects: [],
                    },
                },
                {
                    choice: 'Scoop the old coins out of the basin',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A dry fountain is just a bowl of free money, you tell yourself, and rake the wishes into ' +
                            'your hold by the handful. They spend exactly as well as any other marbles, which is the worst ' +
                            'thing about them. The basin is clean and grey and utterly empty when you go.',
                        effects: [{ kind: 'resource', marbles: 9 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-winding-music-box',
        sector: 'long-quiet',
        intro:
            'A planet shaped like a vast music box, its surface a cylinder studded with hill-sized pins, turning ' +
            'so slowly now you can count the teeth. The tune it plays is a single note every few minutes, ' +
            'spaced wider each time as the great mainspring lets go.',
        root: {
            prompt: 'The whole world is one music box winding down. What do you do?',
            answers: [
                {
                    choice: 'Find the keyhole and give the world a turn',
                    tone: 'good',
                    followUp: {
                        prompt: 'The keyhole is a canyon, and your old broken winding key just fits it. How do you wind?',
                        answers: [
                            {
                                choice: 'Wind it just enough to hear the whole song through once',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The cylinder gathers speed and the spaced notes draw together into a melody — ' +
                                        'wobbly, ancient, achingly sweet, a lullaby a whole planet was built to play. You ' +
                                        'listen to all of it, once, and the listening pushes the grey back a step. Then you ' +
                                        'let it slow again, gently.',
                                    effects: [
                                        { kind: 'flag', set: 'heard-the-world-song' },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Over-wind it to wring out every last note',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You crank the great key past the mark, greedy for more song. The mainspring sings ' +
                                        'too high, too fast, and snaps with a sound like a continent breaking. The tune ' +
                                        'stops for good, but you got a frantic, glorious verse of it that no one else ever ' +
                                        'will. You keep the snapped-off key-end.',
                                    effects: [{ kind: 'item', grant: 'music-box-key-tip' }],
                                },
                            },
                            {
                                choice: 'Pry pins off the cylinder to sell as curios',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Each hill-sized pin is a single note of the song, and each one fetches a fair ' +
                                        'price as a curio. You lever a few loose. The melody comes back missing teeth now, ' +
                                        'gap-toothed and limping, a tune with holes worn in it by your own two hands.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Record the slowing notes before the spring lets go',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You sit in orbit and let the pet capture each far-spaced note as it comes, the last ' +
                            'heartbeats of a music-box world. Stretched out, the recording sounds less like a song ending ' +
                            'than like one being very, very patient. You keep it.',
                        effects: [{ kind: 'item', grant: 'slow-lullaby-recording' }],
                    },
                },
                {
                    choice: 'Leave it to wind down in its own time',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You decide the kindest thing is to let it finish on its own and fly on. The notes come ' +
                            'wider and wider behind you until you cannot tell the last one from the silence after it. No ' +
                            'one was there to hear the world stop singing. It only seemed kind.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-fading-photograph',
        sector: 'long-quiet',
        intro:
            'Hung in the grey on invisible wire, a single photograph the size of a sail turns gently in the ' +
            'void. It shows a family at a kitchen table, laughing — and as you watch, the faces are paling, the ' +
            'edges going white, the whole image quietly forgetting itself.',
        root: {
            prompt: 'The great photograph is fading before your eyes. What do you do?',
            answers: [
                {
                    choice: 'Memorise the picture out loud while it lasts',
                    tone: 'good',
                    followUp: {
                        prompt: 'You start describing it, fast, to fix it in the telling. What do you fasten on?',
                        answers: [
                            {
                                choice: 'The small details — the spilled cup, the dog under the table',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        "You name the spilled cup, the dog's ear, the way the littlest one is mid-laugh " +
                                        'with eyes shut. The pet writes it all down. When the photograph finally goes white, ' +
                                        'the words are still there — a family kept alive in a description, which is, after ' +
                                        'all, how every family outlasts itself.',
                                    effects: [
                                        { kind: 'item', grant: 'described-photograph' },
                                        { kind: 'flag', set: 'kept-a-family-in-words' },
                                    ],
                                },
                            },
                            {
                                choice: 'Just the faces, before the faces go',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You race to fix the faces and lose the race; they pale faster than you can ' +
                                        'speak them. By the end you have five blurred descriptions of people you never met, ' +
                                        'half-right at best. It is more than the grey wanted you to have. It is less than ' +
                                        'they deserved.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Wonder aloud whether it is your own family',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'For one cold instant you let yourself think the fading laughers might be yours. ' +
                                        'They are not — the kitchen is wrong, the dog is wrong — but the fear of it has ' +
                                        'already got its hooks in, and it rides home with you, heavier than any salvage.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Photograph the photograph before it vanishes',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You capture the fading image to memory — a picture of a picture, already half-gone. The ' +
                            'copy keeps what was left when you found it, no more, no less: a family with white where their ' +
                            'smiles used to be. You file it anyway. Half a face is still a face.',
                        effects: [{ kind: 'flag', set: 'copied-the-photograph' }],
                    },
                },
                {
                    choice: 'Take the frame — good wood is good wood',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The image is past saving, so you salvage the gilt frame, which is worth a tidy sum, and ' +
                            'let the blank canvas drift. You have framed a great many things in your life. You have never ' +
                            'before kept the frame and thrown away the family. There is a first time, it seems.',
                        effects: [{ kind: 'resource', marbles: 6 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-unmelting-snow',
        sector: 'long-quiet',
        intro:
            'A world under snow that has not melted in a hundred grey years — every flake stopped where it ' +
            'landed, drifts smooth as poured wax, a single sledge abandoned at the top of a long white hill, ' +
            'waiting for a winter that will never end and a child who never came back.',
        root: {
            prompt: 'The snow here will never melt and never fall again. What do you do on the hill?',
            answers: [
                {
                    choice: 'Take the sledge down the hill, the way it was meant to go',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You drag the old sledge to the crest and shove off. The frozen snow lets you cut it after ' +
                            'all, and you go whooping down a hundred-year hill with the robo-pet shrieking behind you, and ' +
                            'for the length of one ride the stopped winter is just winter, and winter is wonderful. The ' +
                            'grey loses the hill for an afternoon.',
                        effects: [
                            { kind: 'resource', heart: 1 },
                            { kind: 'front', advance: -1 },
                        ],
                    },
                },
                {
                    choice: 'Build one snowman where the child would have',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'The snow packs strangely, but it packs. You build a small lopsided snowman near the sledge ' +
                            'and give it a stone for a smile, so the hill has someone on it again. It will stand there ' +
                            'unmelting forever, which is either very sad or very faithful. You decide it is faithful.',
                        effects: [{ kind: 'flag', set: 'built-the-snowman' }],
                    },
                },
                {
                    choice: "Cut ice from the drifts for the ship's tanks",
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Hundred-year ice is pure as glass and worth carving for water. You quarry a hold-full from ' +
                            'the hillside, leaving raw grey scars in the smooth white. The sledge tips over in the wind ' +
                            'your cutters kicked up, and lies on its side, and you tell yourself you will right it, and ' +
                            'you do not.',
                        effects: [{ kind: 'resource', marbles: 7 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-unreached-door',
        sector: 'long-quiet',
        intro:
            'A door stands in the open void, freestanding, painted a green so vivid it hurts after all this ' +
            'grey — a colour the Hush has somehow not reached. Warm light leaks round its edges, and from the ' +
            'far side comes the muffled, impossible sound of an ordinary day.',
        root: {
            prompt: 'A door the grey has not touched, with something living behind it. What do you do?',
            answers: [
                {
                    choice: 'Knock, and wait to be let in',
                    tone: 'good',
                    followUp: {
                        prompt: 'Footsteps approach the far side. A voice asks, kindly, who is there. What do you say?',
                        answers: [
                            {
                                choice: 'Tell them honestly who you are and why you came',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You say your name, and the kid you are, and the family you are chasing. The voice ' +
                                        'goes soft. They cannot open the door — it is the last colour they have, and the grey ' +
                                        'is at every wall — but they pass a warm parcel of food under it and a word of where ' +
                                        'the front is thinnest. Kindness, behind the last green door.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'openRoute', to: 'thin-front-crossing' },
                                    ],
                                },
                            },
                            {
                                choice: 'Ask them to come out and run with you',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You beg them to open up and flee with you while there is still a you to flee with. ' +
                                        'A long quiet. Then, gently: no. They have someone here who cannot be moved, and they ' +
                                        'will not leave them to keep one door bright. You understand it completely and it ' +
                                        'breaks your heart completely. You leave them their door.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Force the door before the grey can reach it',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You throw your shoulder to it, sure you can save them faster than they can save ' +
                                        'themselves. The lock gives — and so does the seal, and the grey pours in through ' +
                                        'the gap you made before the warm room can so much as cry out. The green goes to ' +
                                        'ash under your hand. You meant to help.',
                                    effects: [{ kind: 'front', advance: 1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Sit by the door and listen to the day going on',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You do not knock. You put your back to the warm green wood and just listen — a kettle, a ' +
                            'radio, someone humming, the whole untaken music of an ordinary afternoon. You stay until you ' +
                            'have to go, and you carry the sound of it with you like a coal in your chest.',
                        effects: [{ kind: 'flag', set: 'listened-at-the-door' }],
                    },
                },
                {
                    choice: 'Scrape a flake of the green paint to keep',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You shave one curl of impossible green off the doorframe for yourself, a chip of real colour ' +
                            'in a world that has run out. The instant it leaves the door it dulls to grey in your palm. The ' +
                            'colour only held while it stayed where it belonged. You should have known.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-stopped-droid-foundry',
        sector: 'long-quiet',
        intro:
            'A foundry-moon where the Hush builds its tidy little machines, gone quiet now mid-shift — half-' +
            'finished grey droids hang stilled on the lines, and one nearly-complete unit twitches on its ' +
            'cradle, caught between waking up and never waking at all.',
        root: {
            prompt: 'The foundry is stopped, but one droid is half-awake on its cradle. What do you do?',
            answers: [
                {
                    choice: 'Reach it before the grey finishes its programming',
                    tone: 'good',
                    followUp: {
                        prompt: "You get to the cradle as the droid's eyes flicker, unsure what it is yet. How do you reach it?",
                        answers: [
                            {
                                choice: 'Teach it a game before the Hush can teach it a job',
                                tone: 'good',
                                gate: { kind: 'crew', member: 'grandpa' },
                                outcome: {
                                    resultText:
                                        'Grandpa leans in with his screwdriver and his patience and shows the waking thing ' +
                                        'patty-cake, of all the daft holy things — and the droid, never told it was meant to ' +
                                        "tidy and take, learns to play instead. It hops off the cradle the pet's new " +
                                        'cousin. The Hush built a soldier; you stole back a child.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'flag', set: 'foundry-droid-freed' },
                                    ],
                                },
                            },
                            {
                                choice: 'Pull its core before either side finishes it',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You yank the half-written core loose. The droid stills mid-flicker, neither freed ' +
                                        'nor finished, just stopped — same as everything here. The core is good salvage and ' +
                                        'you take it, and you try not to think about the look that was almost on its face.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Trigger its boot and let it finish waking',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You jolt it the rest of the way awake — and the grey wins the race for its mind by ' +
                                        'a hair. It comes up off the cradle knowing exactly one thing, which is its orders: ' +
                                        'tidy this away, starting with you. Its grip-arms unfold and it advances.',
                                    effects: [{ kind: 'spawnGame', game: 'duel', reason: 'foundry-droid-wakes' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Salvage the stilled line for parts and patches',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You leave the half-awake unit on its cradle and work the dead line instead, prying good plate ' +
                            'and sound servos from the droids that never finished. The foundry meant to mend the grey by ' +
                            'unmaking everything else; you turn a little of it to mending your own hull.',
                        effects: [{ kind: 'resource', hull: 1 }],
                    },
                },
                {
                    choice: 'Wreck the cradle so the grey builds nothing more here',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You smash the cradle and the half-awake droid with it, sure you are choking the foundry off ' +
                            'at the source. It is a satisfying ruin. It is also one more thing here stopped forever by a hand ' +
                            'that meant well, and the foundry is exactly as grey afterward, only louder for a moment.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-grandmother-kitchen',
        sector: 'long-quiet',
        intro:
            'A house worn nearly to nothing, but its kitchen window still glows faint amber, and on the cold ' +
            'stove sits a pot of soup the grey has stopped mid-simmer — held one degree below warm, one breath ' +
            'short of a meal, for no one knows how long.',
        root: {
            prompt: 'A kitchen the grey almost took, with a pot of soup gone cold. What do you do?',
            answers: [
                {
                    choice: 'Light the stove and finish the soup',
                    tone: 'good',
                    followUp: {
                        prompt: 'The old stove coughs back to life. The recipe card is faded — how do you finish it?',
                        answers: [
                            {
                                choice: 'Cook it the way it was always cooked here',
                                tone: 'good',
                                gate: { kind: 'crew', member: 'grandma' },
                                outcome: {
                                    resultText:
                                        'Grandma reads the faded card, sniffs the pot, and ignores them both — her hands ' +
                                        'know this soup the way they know a hundred others. She finishes it from memory and ' +
                                        'the whole grey house fills with the smell of being fed. You all eat at the dead ' +
                                        "family's table. No one is a stranger over good soup.",
                                    effects: [
                                        { kind: 'resource', heart: 2 },
                                        { kind: 'flag', set: 'finished-the-soup' },
                                    ],
                                },
                            },
                            {
                                choice: 'Cook it your own clumsy way and serve it round',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You guess at the faded recipe and get it nearly wrong — too much salt, not enough ' +
                                        'patience — but it is hot, and it is shared, and that turns out to be most of what ' +
                                        'soup is for. You leave the pot clean and the bowls washed, the way you would want ' +
                                        'someone to leave yours.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Bottle the soup to ration on the long jumps',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You decant the finished soup into flasks for later rather than eat it here, in the ' +
                                        'warm, where it was meant to be eaten. It keeps. It travels. And by the time you drink ' +
                                        'it, cold, three jumps on, it is just calories — the kitchen and the warmth and the ' +
                                        'point of it all left behind in the grey.',
                                    effects: [{ kind: 'item', grant: 'flasks-of-soup' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Set the table for the family that never sat down',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You do not light the stove. You lay the table instead — bowls, spoons, the chairs pulled out ' +
                            'just so — for the family the grey took before supper. It is a small, useless, achingly tidy ' +
                            'thing, a place set for ghosts. You leave it ready, in case. Then you go.',
                        effects: [],
                    },
                },
                {
                    choice: 'Take the copper pot and the good knives',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A heavy copper pot and a roll of well-kept knives are worth real marbles anywhere with cooking ' +
                            'left in it. You bundle them out. The amber light in the window gutters as you cross the ' +
                            "threshold with the kitchen's heart under your arm, and the soup you left behind will be cold " +
                            'now forever.',
                        effects: [{ kind: 'resource', marbles: 10 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-handwound-clock',
        sector: 'long-quiet',
        intro:
            "In a watchmaker's shop pared down to grey, one small clock still keeps time — but only because " +
            'a worn spring holds it by a thread. The mainspring will let go within the hour, and there is no ' +
            'key, only the bare arbor you would have to turn by hand against the full pull of the works.',
        root: {
            prompt: 'The last working clock needs winding by hand, and the spring will fight you. Do you try?',
            answers: [
                {
                    choice: 'Set your fingers to the bare arbor and wind it the hard way',
                    tone: 'good',
                    cost: [{ kind: 'resource', heart: -1 }],
                    followUp: {
                        prompt: 'The steel bites your fingers and the works resist every turn. How does it go?',
                        answers: [
                            {
                                choice: 'Hold on through the pain and bring the spring up full',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Your fingers are raw and your hand will not unclench for an hour, but the clock ' +
                                        'ticks on full and proud, and a wound spring keeps time long after the winding is ' +
                                        'forgotten. You leave it ticking into the grey, the only living hour for light-years.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'handwound-the-last-clock' },
                                    ],
                                },
                            },
                            {
                                choice: 'Get a few turns in before your grip gives out',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You manage a handful of turns before your hand simply will not hold. The clock ' +
                                        'gains an hour, maybe two, bought with skin and sweat — a short reprieve, but you ' +
                                        'were the one who chose to grant it. It ticks behind you as you go.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Slip on the last turn and snap the tired spring',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Your raw fingers lose the arbor at the worst moment and it spins back free. The ' +
                                        'overtaxed spring lets go with a flat little twang, and the last clock in the grey ' +
                                        'goes still in your bleeding hands. You hurt yourself to stop a clock a minute early.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Note the time it shows and leave it to run down',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You read the hands, log the hour for your charts, and let the little clock keep its own ' +
                            'last appointment without you. Somewhere out there it will stop, unwitnessed, and the grey ' +
                            'will not even notice it had been counting.',
                        effects: [{ kind: 'flag', set: 'logged-the-last-hour' }],
                    },
                },
                {
                    choice: 'Pocket the clock to sell while it still ticks',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A working clock is a rare thing this deep in the grey, worth real marbles to the right ' +
                            'buyer. You wrap it carefully. By the time you reach the ship the spring has run down in ' +
                            'your pack, and you are carrying just another stopped clock to a sector that has plenty.',
                        effects: [{ kind: 'resource', marbles: 8 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-dimming-star',
        sector: 'long-quiet',
        intro:
            'A small old star, the last warm thing for parsecs, has guttered to a dull ember the colour of ' +
            'cooling iron. The handful of grey worlds still huddled around it are going cold in its dimming, ' +
            'and your hold carries fuel cells that would burn bright enough to feed a fading sun, for a while.',
        root: {
            prompt: 'You could pour your reserves into the dying star to stoke it. Do you spend them?',
            answers: [
                {
                    choice: 'Vent your fuel cells into its corona to stoke the fire',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -8 }],
                    followUp: {
                        prompt: 'The cells dump their charge into the failing star. Does the old fire take?',
                        answers: [
                            {
                                choice: 'It catches, and the worlds below feel the warmth',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The ember flares back to a steady amber glow, and across the cold worlds below, ' +
                                        'grey shutters open to a sun that came back. It will not last forever. But you bought ' +
                                        'them a long bright while, and the grey has to start its tidying all over again.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'fed-the-dying-star' },
                                    ],
                                },
                            },
                            {
                                choice: 'It flickers up, then settles back to embers',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The star brightens, gloriously, for the length of an afternoon — long enough for ' +
                                        'one warm day on the cold worlds, for shadows to fall the old way one more time. Then ' +
                                        'it sinks back to ember. A day of sun, paid for in full. Some gifts are only a day long.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'It swallows the charge and dims regardless',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The fuel pours in and the star drinks it down and dims anyway, too far gone to ' +
                                        'feel the feeding. You watch your reserves vanish into a fire that was always going ' +
                                        'out. You cannot save a sun with a full hold, it turns out. You only get to try.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Warn the cold worlds to gather what warmth they can',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You broadcast the simple, useless, necessary truth — the sun is going, hold each other close ' +
                            'while it lasts. The replies come back quiet and grateful. You gave them no heat, only honesty, ' +
                            'and a chance to spend the last of the light on purpose.',
                        effects: [{ kind: 'flag', set: 'warned-the-cold-worlds' }],
                    },
                },
                {
                    choice: 'Skim the dying star for cheap, easy fuel',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A guttering star sheds plasma loose and slow, and you scoop a hold-full of nearly-free fuel ' +
                            'from a fire too weak to stop you. The worlds below dim a shade faster for what you took. Easy ' +
                            'marbles, off the back of a sun in its last days.',
                        effects: [{ kind: 'resource', marbles: 9 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-grey-toll',
        sector: 'long-quiet',
        intro:
            'A narrow rift through a wall of stilled debris is the only quick way deeper into the grey, and a ' +
            'lone, half-faded tollkeeper sits at its mouth in a booth worn smooth by waiting. He does not take ' +
            'marbles. "A memory," he says, gently. "One you would rather keep. That is the toll, or the long way round."',
        root: {
            prompt: 'The tollkeeper wants a treasured memory to let you through the rift. Do you pay it?',
            answers: [
                {
                    choice: 'Give him a memory you love, to take the fast road',
                    tone: 'good',
                    cost: [{ kind: 'resource', heart: -2 }],
                    followUp: {
                        prompt: 'You hand over a warm and private memory. What does he do with it, and what does it open?',
                        answers: [
                            {
                                choice: 'He keeps it kindly, and the rift opens onto a sheltered passage',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'He cups your memory like a coal and the rift sighs open ahead. The way through is ' +
                                        'short and sheltered, the front thin along it — he saves the easy roads for those who ' +
                                        'pay dear. You go on lighter by one bright thing, and faster for the lack of it.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'openRoute', to: 'sheltered-rift-passage' },
                                    ],
                                },
                            },
                            {
                                choice: 'He simply waves you through the gap and says no more',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The barrier parts and he gestures you on, your memory already fading from you as ' +
                                        'you pass — you know there was something you loved here a moment ago, and now there ' +
                                        'is only the shape of the missing it. The road ahead is ordinary. The toll was not.',
                                    effects: [{ kind: 'openRoute', to: 'grey-rift' }],
                                },
                            },
                            {
                                choice: 'He pockets it, and the rift turns out to lead nowhere good',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'He takes the memory and the gap opens onto a dead-end gully of stalled wrecks, ' +
                                        'no quicker than the long way and a good deal colder. You paid in something you ' +
                                        'cannot get back for a road that was never worth it. He was already gone when you turned.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Offer him company and a story instead of a memory',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You sit in his worn booth and trade tellings for an hour — yours of the family, his of the ' +
                            'thousands who passed before the grey came. He will not waive the toll, but he points you to ' +
                            'the long way round and a few quiet places along it. Some keepers only ever wanted the company.',
                        effects: [{ kind: 'flag', set: 'sat-with-the-tollkeeper' }],
                    },
                },
                {
                    choice: 'Run the rift without paying, and chance the debris',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You gun the drives and thread the stilled wreckage on nerve alone. You make it through, ' +
                            'scraped and rattled, the hull singing where a girder kissed it. The tollkeeper does not chase ' +
                            'you. He only watches you go, the way you watch a thing you already know the ending of.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-remembering-pool',
        sector: 'long-quiet',
        intro:
            'A still grey pool fills a crater on a dead moon, and the robo-pet goes rigid at its edge: the ' +
            'water shows not your reflection but the past, the day the Hush came, if you are willing to look. ' +
            'Looking will cost you — the seeing of it again is its own small wound — but you have forgotten so much.',
        root: {
            prompt: 'The pool will show you a lost memory of that day, if you pay the ache of looking. Do you look?',
            answers: [
                {
                    choice: 'Kneel and look into the water, whatever it costs to see',
                    tone: 'good',
                    cost: [{ kind: 'resource', heart: -1 }],
                    followUp: {
                        prompt: 'The grey surface clears. Out of the forgetting, what does it give back to you?',
                        answers: [
                            {
                                choice: 'A clear, kind moment — a face, a name, a way home',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The water shows you the last bright minute before the grey — a face turning to ' +
                                        'call your name, a door you know, a direction you had lost. It hurts to see and it is ' +
                                        'worth the hurt. You rise knowing one true thing about where they were taken.',
                                    effects: [
                                        { kind: 'flag', set: 'looked-in-the-pool' },
                                        { kind: 'openRoute', to: 'remembered-way-home' },
                                    ],
                                },
                            },
                            {
                                choice: 'A small ordinary memory, dear and useless',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'No map, no name — just an ordinary morning, breakfast and bickering and someone ' +
                                        'laughing at a joke you have forgotten. It tells you nothing you can fly toward. But ' +
                                        'you had lost even this, and now you have it back, and you find you needed it more.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Only the grey arriving, and the cold of it',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The pool gives you the worst of it: the colour going out of the world, the quiet ' +
                                        'coming down, the helpless watching. You paid to remember and it remembered you the ' +
                                        'fear. You stand a long time before you can make yourself walk away from the edge.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Let the robo-pet sample the water without looking yourself',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You keep your eyes on the dead horizon and let the pet take a careful reading instead. It ' +
                            'logs faint traces of a day it has no feelings to be hurt by — data, not memory — and stores ' +
                            'them safe against a time you are stronger. Some things are better met later, or never alone.',
                        effects: [{ kind: 'flag', set: 'sampled-the-pool' }],
                    },
                },
                {
                    choice: 'Throw a stone to break the surface and walk on',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You will not be made to bleed for a puddle. You pitch a rock dead-centre and the past ' +
                            'shatters into ripples and grey. By the time the water stills again you are over the crater ' +
                            'rim, telling yourself you did not want to know, and almost believing it.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'quiet-last-streetlamp',
        sector: 'long-quiet',
        intro:
            'A whole greyed-out town, and at the end of its longest street one lamp still burns, its little ' +
            'pool of warm light the size of a doorstep — the last lit thing in a place the Hush has nearly ' +
            'finished. Its cell is failing. You carry a battery that could feed it, but it is a battery you need.',
        root: {
            prompt: 'The last streetlamp is dying, and your spare cell would keep it lit. Do you give it up?',
            answers: [
                {
                    choice: 'Wire your spare cell into the lamp to keep it burning',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -5 }],
                    followUp: {
                        prompt: 'The lamp drinks the new charge and brightens. In its restored light, what comes out of the grey?',
                        answers: [
                            {
                                choice: 'An old stray, drawn out of the dark to the warm pool of light',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'A small grey shape pads into the lamplight — a cat, half-faded, that had been ' +
                                        'waiting in the dark for a light to come back. It curls in the warm circle and lives ' +
                                        'there now, the keeper of the last lit step in town. The grey gives that corner up.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'kept-the-streetlamp' },
                                    ],
                                },
                            },
                            {
                                choice: 'Nothing, but the light holds, steady and stubborn',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'No one comes. The street stays empty. But the lamp burns on, steady now, a single ' +
                                        'lit doorstep refusing the grey on a road no one walks. You leave it shining behind ' +
                                        'you, and somehow that one held light makes the whole dark town easier to leave.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'A surge through the old wiring, and the lamp blows dark',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The corroded wiring cannot take the fresh charge. The lamp flares painfully bright, ' +
                                        'the filament whines, and the glass cracks and goes black for good. You spent your ' +
                                        'spare to snuff the last light a little sooner than the grey would have. It happens.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Stand in the lamplight a while before its cell dies',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You step into the little warm circle and just stand in it, the way you would stand in a ' +
                            'doorway saying a long goodbye. The cell gives out while you are in it, and the dark comes ' +
                            'gentle, and you are glad you were the last one the lamp got to shine on.',
                        effects: [{ kind: 'flag', set: 'stood-in-the-last-light' }],
                    },
                },
                {
                    choice: "Salvage the lamp's good cell and copper for yourself",
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'There is still a little charge in the failing cell and good copper in the housing, and it ' +
                            'all comes out clean and spends fine. The street goes dark behind you the instant you pull the ' +
                            'cell, the whole town finally, completely grey, and you carrying off the last of its light.',
                        effects: [{ kind: 'resource', marbles: 7 }],
                    },
                },
            ],
        },
    },
];
