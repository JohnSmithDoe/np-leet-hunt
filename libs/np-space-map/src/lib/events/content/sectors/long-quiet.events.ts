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
                        effects: [{ kind: 'spawnGame', game: 'duel', launch: { reason: 'unwound-knight-duel' } }],
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
                        effects: [{ kind: 'spawnGame', game: 'duel', launch: { reason: 'derelict-drone-wakes' } }],
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
];
