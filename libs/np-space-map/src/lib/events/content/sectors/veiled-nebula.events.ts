import { PlanetEvent } from '../../event.model';

/**
 * Veiled Nebula sector pool (`veiled-nebula`) — the half-lit, eerie deep-nebula floor where pop-culture
 * ghosts drift and the carnival-of-ghosts never quite closes (GDD §5, guardian: the High Scorer). The
 * register is wondrous-and-a-little-wrong: the grey has nearly finished here, so wonder comes with an
 * uncanny tax. The first three are graduated from `event-content.md` outlines — `enchanted-nebula`,
 * `celestial-dance-off`, `cosmic-carnival` — with their sketched effects typed and tuned; the remaining
 * seven are new writing for the sector. See event-system.md §3–§4/§9 for the model and authoring rules.
 */
export const veiledNebulaEvents: PlanetEvent[] = [
    // --- Graduated from event-content.md ---------------------------------------------------------
    {
        id: 'enchanted-nebula',
        sector: 'veiled-nebula',
        intro:
            'A nebula that hums with colour and intent, drifting in slow chords — the kind of place ' +
            'that is clearly more than gas, and clearly aware that you have arrived.',
        root: {
            prompt: 'How do you approach the Enchanted Nebula?',
            answers: [
                {
                    choice: 'Sail right in to explore',
                    tone: 'good',
                    followUp: {
                        prompt: 'A sentient cloud of energy unspools into something almost a face. What do you do?',
                        answers: [
                            {
                                choice: 'Hail it with the ship’s tech',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It answers in light, threading ancient know-how straight into the ship’s ' +
                                        'systems. Something old and patient now rides along with you.',
                                    effects: [
                                        { kind: 'item', grant: 'nebula-attunement' },
                                        { kind: 'flag', set: 'nebula-friend' },
                                    ],
                                },
                            },
                            {
                                choice: 'Watch quietly and analyse it',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You log every shimmer and pulse, and tune the drive to ride its rhythm. ' +
                                        'A calmer, brighter passage out than the one you came in on.',
                                    effects: [{ kind: 'resource', marbles: 11 }],
                                },
                            },
                            {
                                choice: 'Try to bottle a sample',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The moment the canister seals, the cloud recoils and lashes back. The hull ' +
                                        'rings like a struck bell, and your sample is empty glass.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Hold off and just survey it',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'The long-range data resolves, slowly, into…',
                        answers: [
                            {
                                choice: 'Rare cosmic phenomena, all logged',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'A full sheaf of readings no chart has ever held. Records like these are ' +
                                        'worth something to someone, somewhere down the channel.',
                                    effects: [{ kind: 'resource', marbles: 9 }],
                                },
                            },
                            {
                                choice: 'Traces of an old civilisation',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Buried in the haze: the geometry of streets, the ghost of a grid. Whoever ' +
                                        'lived here is long gone, but the lead is worth following.',
                                    effects: [{ kind: 'flag', set: 'nebula-ruins' }],
                                },
                            },
                            {
                                choice: 'Changes in the readings you can’t explain',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Numbers that shift when you look away and settle when you look back. The ' +
                                        'crew goes quiet. Nothing is wrong, exactly. Nothing is right either.',
                                    effects: [{ kind: 'flag', set: 'nebula-unease' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Steer well clear',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You give the whole humming expanse a wide, careful berth. It watches you go, or ' +
                            'maybe it doesn’t notice at all. Nothing gained, nothing lost.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'celestial-dance-off',
        sector: 'veiled-nebula',
        intro:
            'A drifting stage of stitched-together light, a hundred species mid-competition in the void. ' +
            'A judge with too many arms beckons your crew up into the glare.',
        root: {
            prompt: 'Do you join the Celestial Dance-Off?',
            answers: [
                {
                    choice: 'Sign up, all in',
                    tone: 'good',
                    followUp: {
                        prompt: 'The floor clears and the lights find you. What’s your style?',
                        answers: [
                            {
                                choice: 'Old-Earth moves nobody out here has seen',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You hit a move from a world that no longer remembers it, and the void loses ' +
                                        'its mind. Prizes rain down; someone presses a winner’s trophy into your ' +
                                        'hands.',
                                    effects: [
                                        { kind: 'resource', marbles: 16 },
                                        { kind: 'item', grant: 'dance-trophy' },
                                    ],
                                },
                            },
                            {
                                choice: 'Improvise an alien fusion',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Three galaxies’ worth of dancers fold into your routine and call it kin. ' +
                                        'You leave with no prize but a fistful of new friends.',
                                    effects: [{ kind: 'flag', set: 'dance-allies' }],
                                },
                            },
                            {
                                choice: 'Invent something genuinely cosmic',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'It is a glorious disaster. Limbs everywhere, no rhythm at all, the crowd ' +
                                        'unsure whether to clap. You exit pink-cheeked with a pity tip.',
                                    effects: [{ kind: 'resource', marbles: 4 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Watch from the edge of the floor',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'A fine, strange night — bodies of light wheeling past, a tune you half know. A few ' +
                            'marbles get tossed your way just for cheering loud.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Heckle the favourites and bail',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Your jeers carry further than you meant them to. The music falters, the welcome ' +
                            'curdles, and the stage dims a shade as you slink off.',
                        effects: [{ kind: 'flag', set: 'dance-snub' }],
                    },
                },
            ],
        },
    },
    {
        id: 'cosmic-carnival',
        sector: 'veiled-nebula',
        intro:
            'A carnival strung clean across the void — barkers, rides, and a midway that runs on too far ' +
            'to see the end of. The lights are warm. The shadows behind them are not.',
        root: {
            prompt: 'How do you take the Cosmic Carnival?',
            answers: [
                {
                    choice: 'Dive into the fun',
                    tone: 'good',
                    followUp: {
                        prompt: 'The midway sprawls in every direction. First stop?',
                        answers: [
                            {
                                choice: 'The Warp Whirl ride',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Gravity forgets its job for ninety glorious seconds. You stagger off ' +
                                        'grinning, a winner’s token pressed warm into your palm.',
                                    effects: [{ kind: 'resource', marbles: 13 }],
                                },
                            },
                            {
                                choice: 'The Mirror Maze',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A thousand of you, all a little wrong. You find the true centre anyway, and ' +
                                        'a small prize waiting on a velvet stand for whoever got there.',
                                    effects: [{ kind: 'item', grant: 'maze-charm' }],
                                },
                            },
                            {
                                choice: 'The Plush Parade games',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Every game is rigged, and you knew it, and you played anyway. You quit a ' +
                                        'few marbles lighter, clutching nothing but a balloon.',
                                    effects: [{ kind: 'resource', marbles: -6 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Walk it warily, find a guide',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'A dozen voices offer to show you around. Who do you trust?',
                        answers: [
                            {
                                choice: 'The Fortune Teller in the striped tent',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'She turns one card, taps the midway’s far edge, and says nothing more. ' +
                                        'When you look, there is a way through that wasn’t there before.',
                                    effects: [{ kind: 'openRoute', to: 'carnival-tip' }],
                                },
                            },
                            {
                                choice: 'Just stick with the crew',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'No guide, no trouble. A pleasant loop of the safe rides and back to the ' +
                                        'ship, pockets a touch heavier from the easy games.',
                                    effects: [{ kind: 'resource', marbles: 5 }],
                                },
                            },
                            {
                                choice: 'The Wheel of Secrets',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The wheel coughs up a secret you didn’t ask for, and now it’s yours ' +
                                        'to carry. The carnival smiles like it just collected on a debt.',
                                    effects: [{ kind: 'flag', set: 'carnival-debt' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Treat the whole thing as a trap',
                    tone: 'bad',
                    followUp: {
                        prompt: 'You won’t be charmed. How do you guard the crew?',
                        answers: [
                            {
                                choice: 'Hire the Cosmic Guardian for the night',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'A slab of polite muscle walks you in and out untouched. It costs a stack of ' +
                                        'marbles, but every one of you leaves exactly as you came.',
                                    effects: [
                                        { kind: 'resource', marbles: -7 },
                                        { kind: 'flag', set: 'carnival-guarded' },
                                    ],
                                },
                            },
                            {
                                choice: 'Keep your distance and just look',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You orbit the lights from a safe remove, take nothing, touch nothing. You ' +
                                        'leave with what you arrived with, which is the whole point.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'March everyone straight back out',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You herd the crew out past a tent you never opened. Whatever real prize ' +
                                        'this place was hiding stays hidden, and you’ll always half-wonder.',
                                    effects: [{ kind: 'flag', set: 'carnival-missed' }],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    // --- New writing for the sector --------------------------------------------------------------
    {
        id: 'veiled-derelict-arcade',
        sector: 'veiled-nebula',
        intro:
            'A station shaped like a cabinet, dead and dark, except for one machine in the back still ' +
            'glowing. The leaderboard reads three blinking initials and a score no one could survive.',
        root: {
            prompt: 'The cabinet whirs to life as you near it. What do you do?',
            answers: [
                {
                    choice: 'Drop a marble and play it straight',
                    tone: 'good',
                    followUp: {
                        prompt: 'A ghost of a hand settles over yours, patient, teaching. Do you let it?',
                        answers: [
                            {
                                choice: 'Let the ghost guide your run',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Together you clear a board the High Scorer himself would respect. The ghost ' +
                                        'leaves you its lucky token and, for once, a name to put to it later.',
                                    effects: [
                                        { kind: 'item', grant: 'arcade-token' },
                                        { kind: 'flag', set: 'arcade-ghost-named' },
                                    ],
                                },
                            },
                            {
                                choice: 'Shrug it off and play your own game',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You post a respectable score, all your own. The ghost watches without ' +
                                        'judgement and spits out a modest payout of forgotten coins.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                            {
                                choice: 'Try to beat the impossible top score',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You chase a number that was never meant to be caught. The cabinet drinks ' +
                                        'your marbles and your hours, and the grey leans a little closer while you ' +
                                        'tilt at it.',
                                    effects: [
                                        { kind: 'resource', marbles: -5 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Strip the cabinet for parts instead',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You crack the housing and pull what’s useful. The screen goes dark mid-attract, the ' +
                            'initials still blinking as the last light dies. Salvage is salvage.',
                        effects: [{ kind: 'resource', marbles: 6 }],
                    },
                },
                {
                    choice: 'Unplug it before it can start',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You yank the power and the whole station exhales. Somewhere ahead, a high score you ' +
                            'will have to face anyway notes the insult. The room feels colder leaving than it did ' +
                            'arriving.',
                        effects: [{ kind: 'flag', set: 'arcade-unplugged' }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-haunted-broadcast',
        sector: 'veiled-nebula',
        intro:
            'An old comms relay still loops a children’s show into the dark — a puppet host grinning ' +
            'at an audience of no one, for longer than any tape should hold.',
        root: {
            prompt: 'The host turns to face your hail. “You came back!” it beams. How do you answer?',
            answers: [
                {
                    choice: 'Play along — be the audience it lost',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You laugh in the right places, clap on cue, and the puppet finishes its last episode ' +
                            'with something like peace. As it powers down it gifts you its prop, warm and oddly heavy.',
                        effects: [
                            { kind: 'item', grant: 'puppet-prop' },
                            { kind: 'flag', set: 'broadcast-finale' },
                        ],
                    },
                },
                {
                    choice: 'Ask it what year it thinks it is',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'It cannot say. It only knows the show, and that the show must go on. You note the ' +
                            'relay’s coordinates and leave it talking to the dark, exactly as you found it.',
                        effects: [{ kind: 'flag', set: 'broadcast-witnessed' }],
                    },
                },
                {
                    choice: 'Cut the signal for good',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You silence the loop mid-laugh. The relay’s capacitors discharge through your comms ' +
                            'array on the way out, and the crew can’t shake the picture of that frozen grin.',
                        effects: [{ kind: 'resource', hull: -1, heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-ghost-whale',
        sector: 'veiled-nebula',
        intro:
            'A whale the size of a moon drifts through the nebula, half here and half not — stars shine ' +
            'straight through its grey flank. It is singing, low, to nobody.',
        root: {
            prompt: 'The ghost-whale’s song rolls over the hull. What do you do?',
            answers: [
                {
                    choice: 'Sing back with the ship’s tones',
                    tone: 'good',
                    followUp: {
                        prompt: 'It turns its enormous, see-through eye on you and waits. What’s your note?',
                        answers: [
                            {
                                choice: 'Match its song, gently',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'For a few bars you harmonise, and the whale grows almost solid — colour ' +
                                        'flooding back into it. It nudges you toward a passage only it remembers.',
                                    effects: [{ kind: 'openRoute', to: 'whale-song-lane' }],
                                },
                            },
                            {
                                choice: 'Play something brand new for it',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It cocks its head at the unfamiliar tune, delighted and confused. The crew ' +
                                        'is moved despite themselves, and the whale drifts on a little brighter.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Blast the harvesting beam while it’s close',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You fire mid-verse. The song breaks into a sound you will hear in quiet ' +
                                        'moments for the rest of the run. You take a sliver of grey matter, and it ' +
                                        'costs you.',
                                    effects: [
                                        { kind: 'item', grant: 'whale-grey' },
                                        { kind: 'resource', heart: -2 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Drift alongside it in silence',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You cut the engines and simply travel with it a while. No data, no haul — but the crew ' +
                            'comes away steadier, the way a long quiet walk can fix a thing.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Hide in its wake to slip the front',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You tuck into the whale’s shadow and let it screen you from the grey. It works — for a ' +
                            'while — and then the whale fades right out from around you, and the grey is suddenly ' +
                            'very near.',
                        effects: [
                            { kind: 'front', advance: 1 },
                            { kind: 'flag', set: 'hid-in-whale-wake' },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-mask-bazaar',
        sector: 'veiled-nebula',
        intro:
            'A floating bazaar of nothing but masks — thousands of them, grinning, weeping, blank — and a ' +
            'hooded merchant who wears none and insists you take one as a gift.',
        root: {
            prompt: 'The merchant fans out three masks and waits. Which do you choose?',
            answers: [
                {
                    choice: 'The plain one, no face at all',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You pick the mask that promises nothing, and the merchant nods as if you passed a test. ' +
                            'It is just a mask — but in a place where faces are slipping away, owning one feels like ' +
                            'armour.',
                        effects: [
                            { kind: 'item', grant: 'blank-mask' },
                            { kind: 'flag', set: 'bazaar-passed' },
                        ],
                    },
                },
                {
                    choice: 'Politely decline and browse instead',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You wander the stalls without taking anything, and the merchant doesn’t press. A ' +
                            'strange, pleasant hour among ten thousand expressions, none of them quite alive.',
                        effects: [],
                    },
                },
                {
                    choice: 'The laughing mask — it looks lucky',
                    tone: 'bad',
                    followUp: {
                        prompt: 'It seals to your face the instant you lift it. Now it won’t come off. What do you do?',
                        answers: [
                            {
                                choice: 'Pay the merchant’s price to be freed',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'A fistful of marbles buys the unsealing word. The mask drops away, still ' +
                                        'laughing, and you leave it on the counter where it belongs.',
                                    effects: [{ kind: 'resource', marbles: -8 }],
                                },
                            },
                            {
                                choice: 'Pry it loose yourself',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It comes off, eventually, taking a layer of dignity and a little skin with ' +
                                        'it. You keep the mask out of spite. The merchant has already gone.',
                                    effects: [
                                        { kind: 'resource', heart: -1 },
                                        { kind: 'item', grant: 'laughing-mask' },
                                    ],
                                },
                            },
                            {
                                choice: 'Wear it and walk away grinning',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You decide you like it. The crew decides they don’t, and won’t say so. The ' +
                                        'grin stays fixed for days, and the grey, for some reason, finds you easier ' +
                                        'to follow.',
                                    effects: [
                                        { kind: 'flag', set: 'wears-laughing-mask' },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-stuck-clocktower',
        sector: 'veiled-nebula',
        intro:
            'A cathedral of a clocktower drifts on its own, every hand frozen at the same grey minute. ' +
            'A caretaker-ghost paces the gantry, winding nothing, waiting for a time that won’t come.',
        root: {
            prompt: 'The caretaker notices you and points, urgent, at the stopped clock. What do you do?',
            answers: [
                {
                    choice: 'Help wind the great mechanism',
                    tone: 'good',
                    followUp: {
                        prompt: 'The mainspring is enormous and you’ll only get one good turn. How do you take it?',
                        answers: [
                            {
                                choice: 'Slow and careful, by the book',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The clock takes one full, ringing tick — the first in an age — and the ' +
                                        'front flinches back from the sound of time remembering itself. The ' +
                                        'caretaker weeps, freed.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'clocktower-wound' },
                                    ],
                                },
                            },
                            {
                                choice: 'Crank it hard and fast — no time to lose',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The hands lurch forward, then jam. A few minutes bought, a tooth or two ' +
                                        'stripped. The caretaker manages a grateful, gap-toothed nod before fading.',
                                    effects: [{ kind: 'resource', marbles: 8 }],
                                },
                            },
                            {
                                choice: 'Force it past the jam',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Metal screams, a gear shears, and a flung spring opens a gash in the hull. ' +
                                        'The clock dies for good, and the caretaker simply stops, mid-gesture.',
                                    effects: [{ kind: 'resource', hull: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Salvage the gold gearwork instead',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You strip the precious mechanism while the caretaker watches, betrayed and silent. The ' +
                            'gears are worth a fortune; the look on its face is worth a little less of you.',
                        effects: [{ kind: 'resource', marbles: 12, heart: -1 }],
                    },
                },
                {
                    choice: 'Leave the dead clock to its ghost',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You decide it isn’t your time to fix and ease away. The caretaker resumes its endless ' +
                            'pacing. The clock will never strike, and you’ll carry the small weight of having watched.',
                        effects: [{ kind: 'flag', set: 'clocktower-abandoned' }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-fan-club',
        sector: 'veiled-nebula',
        intro:
            'A glittering club where holographic ghosts of half-remembered heroes hold court — knights, ' +
            'captains, cartoon icons, all faded at the edges — and every one of them swears you look familiar.',
        root: {
            prompt: 'A spectral crowd swarms your crew for autographs and gossip. How do you handle the fame?',
            answers: [
                {
                    choice: 'Give them the show they’re missing',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You spin a yarn worthy of the legends and let them be a crowd again for one bright ' +
                            'hour. They shower you with the trinkets of their old fame, and the room glows a shade ' +
                            'less grey.',
                        effects: [{ kind: 'resource', marbles: 14 }],
                    },
                },
                {
                    choice: 'Trade stories, hero for hero',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You swap tales until the small hours. No prize, but you learn a name or two the grey ' +
                            'had nearly rubbed out — and somewhere down the line, names matter.',
                        effects: [{ kind: 'flag', set: 'remembered-a-hero' }],
                    },
                },
                {
                    choice: 'Sneak off with the club’s prize relic',
                    tone: 'bad',
                    followUp: {
                        prompt: 'You palm a hero’s signature blade off its pedestal. The ghosts haven’t noticed — yet.',
                        answers: [
                            {
                                choice: 'Quietly put it back where it was',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Conscience wins. You set the relic down and slip out clean. The ghosts wave ' +
                                        'you off fondly, none the wiser, and you sleep fine that night.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Take it and make a fast, quiet exit',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You’re out the airlock before the cheering stops. A genuine hero’s blade, ' +
                                        'yours now — though it hums with a sad, dispossessed note you can’t quite ' +
                                        'mute.',
                                    effects: [{ kind: 'item', grant: 'heros-blade' }],
                                },
                            },
                            {
                                choice: 'Take it and dare them to stop you',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You hold it overhead like a trophy, and the whole club goes cold and quiet. ' +
                                        'Faded heroes remember, all at once, how to be dangerous. This is going to ' +
                                        'be a fight.',
                                    effects: [{ kind: 'spawnGame', game: 'duel', reason: 'fan-club-heist' }],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-painted-planet',
        sector: 'veiled-nebula',
        intro:
            'A planet that isn’t one — a flat painted backdrop of a world hung in the void, so convincing ' +
            'that birds of light wheel across its painted sky. A door is propped, just ajar, at its base.',
        root: {
            prompt: 'The painted door swings open onto somewhere that shouldn’t fit. Do you go through?',
            answers: [
                {
                    choice: 'Step through, eyes open',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'Inside is a whole bright pocket-world, bigger than the canvas could ever hold, stocked ' +
                            'with wonders nobody has come to claim. You fill your hold and step back out into the ' +
                            'grey.',
                        effects: [
                            { kind: 'resource', marbles: 17 },
                            { kind: 'flag', set: 'entered-the-painting' },
                        ],
                    },
                },
                {
                    choice: 'Reach an arm through to test it first',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Your hand comes back holding a fistful of impossible — a flower that wasn’t there, ' +
                            'still fresh. You decide that’s enough painting for one day and leave the door for ' +
                            'someone braver.',
                        effects: [{ kind: 'item', grant: 'painted-bloom' }],
                    },
                },
                {
                    choice: 'Paint over the door before it spreads',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You scorch the doorway shut, certain something was about to come out. Maybe you were ' +
                            'right. Maybe you just walled off the last warm room in the sector. The backdrop dims to ' +
                            'grey behind you.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-ghostlight-theatre',
        sector: 'veiled-nebula',
        intro:
            'A theatre adrift in the fog, every seat full of grey silhouettes that do not breathe, all ' +
            'facing a stage where a single ghost-light burns and an empty role waits to be read.',
        root: {
            prompt: 'A script flutters down into your hands, the lead part still unspoken. What do you do?',
            answers: [
                {
                    choice: 'Take the stage and give the part your all',
                    tone: 'good',
                    followUp: {
                        prompt: 'The silent house leans in. How do you play the final scene?',
                        answers: [
                            {
                                choice: 'Straight, with your whole heart',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You hit the last line clean and the house erupts — a standing ovation from ' +
                                        'a thousand throats that had forgotten how. The applause beats the grey back ' +
                                        'a step, and the seats are empty when the lights come up.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'theatre-ovation' },
                                    ],
                                },
                            },
                            {
                                choice: 'Make it your own — improvise the ending',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You swerve off the page into something raw and unrehearsed. The house ' +
                                        'isn’t sure what it watched, but it claps anyway, and a few coins roll down ' +
                                        'the aisle to your feet.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                            {
                                choice: 'Milk the bow for a second curtain call',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You bow once, twice, fishing for more, and the audience curdles into a low ' +
                                        'grey murmur. By the third bow the seats are dust and you’re alone on a ' +
                                        'darkening stage, a little ashamed.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Sit in the front row and just watch',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You take the one warm seat and let the ghost-light hold the stage by itself. Nothing ' +
                            'happens, for a long and gentle while, and you let it. Some shows are just the waiting.',
                        effects: [],
                    },
                },
                {
                    choice: 'Snuff the ghost-light and clear the house',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You pinch out the little flame, and the whole theatre goes properly dark. The grey ' +
                            'pours into the vacuum where the show used to be, and it follows you out the lobby ' +
                            'doors.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-phantom-drivein',
        sector: 'veiled-nebula',
        intro:
            'A drive-in screen the size of a city block hangs in the void, projecting a film no one ever ' +
            'shot — your own family, laughing, in scenes that never happened. Rows of empty cars idle below.',
        root: {
            prompt: 'The film loops to a scene you don’t remember living. What do you do?',
            answers: [
                {
                    choice: 'Watch it through, every frame',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You sit with the could-have-beens until the reel runs out. It hurts, and it heals, ' +
                            'and when the screen fades the crew is quieter and somehow stronger for having looked.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Splice a reel out to keep',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'The projector lets you pull one reel. Which moment do you steal back?',
                        answers: [
                            {
                                choice: 'A small, true-feeling one — a kitchen, a song',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You take the quietest reel, the one with no event in it at all, and it ' +
                                        'glows softly in your hold like a coal. It’s worth more than spectacle, here.',
                                    effects: [{ kind: 'item', grant: 'home-reel' }],
                                },
                            },
                            {
                                choice: 'The most dramatic, marketable one',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You grab the explosions and the heroics — footage that fences well anywhere ' +
                                        'down the channel. The drive-in dims a little, having given up its showiest part.',
                                    effects: [{ kind: 'resource', marbles: 9 }],
                                },
                            },
                            {
                                choice: 'Grab two and run before it notices',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You pull a second reel and the projector shrieks, jamming both into ruined ' +
                                        'tangle. You leave with nothing but a hold full of melted celluloid and a sour ' +
                                        'taste.',
                                    effects: [{ kind: 'resource', marbles: -4 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Drive your ship through the screen to be rid of it',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You punch the throttle and tear the screen in half. The false memories scatter like ' +
                            'moths, and one of them snags something in the engine on the way through. The hull groans.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-karaoke-comet',
        sector: 'veiled-nebula',
        intro:
            'A comet trails a tail of glowing lyric-sheets, blaring a backing track into the vacuum and ' +
            'cycling, endlessly, to a half-remembered chorus that never quite resolves. A mic floats, waiting.',
        root: {
            prompt: 'The comet’s track loops to the bridge and pauses, expectant. Do you take the mic?',
            answers: [
                {
                    choice: 'Belt the missing chorus from memory',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You find the line the comet lost and sing it true. The whole tail flares gold, the ' +
                            'song finally lands its ending, and the comet showers you in marbles like confetti at a ' +
                            'last encore.',
                        effects: [{ kind: 'resource', marbles: 12 }],
                    },
                },
                {
                    choice: 'Hum along and let it loop',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You don’t know the words either, so you ride the chorus around a few times, humming ' +
                            'where you can. It’s nice. The comet sails on, still unfinished, and so do you.',
                        effects: [],
                    },
                },
                {
                    choice: 'Have your sibling out-sing the whole comet',
                    tone: 'bad',
                    gate: { kind: 'crew', member: 'sibling' },
                    followUp: {
                        prompt: 'Your sibling grabs the mic, grinning, and turns it into a contest. Where does it go?',
                        answers: [
                            {
                                choice: 'Rein it into a duet that fits the song',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You catch their elbow and turn the showboating into harmony. Together you ' +
                                        'finish the comet’s song properly, and it gifts your sibling a glittering ' +
                                        'lyric-shard to keep.',
                                    effects: [{ kind: 'item', grant: 'lyric-shard' }],
                                },
                            },
                            {
                                choice: 'Let them ham it up to the end',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'They go full diva, hit a note no comet could match, and bring the house ' +
                                        'down — except there’s no house, just the two of you laughing in the static.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Egg them on to drown the comet out entirely',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You both bellow over the backing track until it sputters and dies, offended. ' +
                                        'The lyric-sheets scatter and go grey, and the silence afterward is the loud ' +
                                        'kind.',
                                    effects: [{ kind: 'front', advance: 1 }],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-hall-of-mirrors',
        sector: 'veiled-nebula',
        intro:
            'A funhouse hull of warped mirrors floats sealed and silent. Through the glass you can see a ' +
            'hundred crews like yours, all lost in the corridors, all looking back out at you.',
        root: {
            prompt: 'The mirrored hatch unlatches at your touch. How do you go in?',
            answers: [
                {
                    choice: 'Pick a reflection and follow it through',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You trust one calm-faced double and let it lead you by the warped reflections to the ' +
                            'centre, where a prize sits on a mirrored plinth. The way back out is suddenly, mercifully ' +
                            'straight.',
                        effects: [
                            { kind: 'item', grant: 'mirror-prize' },
                            { kind: 'openRoute', to: 'veiled-mirror-core' },
                        ],
                    },
                },
                {
                    choice: 'Map the maze methodically, mirror by mirror',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You go slow, marking each pane with a smear of grease, and grind your way to the heart ' +
                            'and back. No glory, no shortcut — just an honest haul and an hour you won’t get back.',
                        effects: [{ kind: 'resource', marbles: 6 }],
                    },
                },
                {
                    choice: 'Shatter your way straight through',
                    tone: 'bad',
                    followUp: {
                        prompt: 'The first mirror breaks and every reflected crew turns hostile at once. Now what?',
                        answers: [
                            {
                                choice: 'Lower the bar and offer a truce',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You drop your hands and the reflections, copying you, drop theirs. You back ' +
                                        'out through the gap you made, no one hurt, the funhouse cracked but quiet.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                            {
                                choice: 'Smash a path and bolt for the exit',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Glass everywhere, alarms of light, and you sprinting through your own ' +
                                        'furious doubles. You make it out scratched and shaking, hold empty, pride ' +
                                        'dented.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Square up against your own reflection',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Your sharpest double steps clean out of the glass to meet you, armed with ' +
                                        'every move you’ve got. There’s no talking your way past yourself.',
                                    effects: [{ kind: 'spawnGame', game: 'duel', reason: 'veiled-mirror-self' }],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-phantom-orchestra',
        sector: 'veiled-nebula',
        intro:
            'A hall of empty chairs and abandoned instruments that play themselves — bows sawing through ' +
            'thin air, a podium where a conductor’s baton hangs raised, waiting for a downbeat that never falls.',
        root: {
            prompt: 'The orchestra holds its breathless chord, every phantom player watching the empty podium.',
            answers: [
                {
                    choice: 'Step up and give them their downbeat',
                    tone: 'good',
                    followUp: {
                        prompt: 'The baton settles into your hand and the silence aches to break. How do you conduct?',
                        answers: [
                            {
                                choice: 'Bring them in soft, then let them soar',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The held chord blooms into a symphony fifty years overdue, and for one ' +
                                        'movement the hall is fully, gloriously alive. The players bow to you and ' +
                                        'leave a baton of cooled starlight on the podium.',
                                    effects: [
                                        { kind: 'item', grant: 'conductors-baton' },
                                        { kind: 'flag', set: 'orchestra-finished' },
                                    ],
                                },
                            },
                            {
                                choice: 'Keep it tight and march them through it',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You drive a brisk, correct performance — no soul to spare, but they finish ' +
                                        'the piece at last. Coins drift down from the dark balconies in thanks.',
                                    effects: [{ kind: 'resource', marbles: 8 }],
                                },
                            },
                            {
                                choice: 'Cut them off early and pocket the baton',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You slash the baton down to silence mid-phrase and tuck it away. The players ' +
                                        'freeze, denied their ending, and the chord they never resolved hangs in the ' +
                                        'crew’s ears for days.',
                                    effects: [
                                        { kind: 'item', grant: 'conductors-baton' },
                                        { kind: 'resource', heart: -1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Sit and let the music wash over you',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You take a velvet seat and let the held chord hum on, unhurried. It never quite ' +
                            'resolves, and you find you don’t mind. The crew leaves rested, the way good music ' +
                            'leaves you.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Loot the instruments while they’re distracted',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You unhook a gleaming horn or two and the whole orchestra screeches into a discord ' +
                            'that rattles the hull plating. You leave with loot and a headache that won’t lift.',
                        effects: [{ kind: 'resource', marbles: 9, hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-fortune-machine',
        sector: 'veiled-nebula',
        intro:
            'A glass booth bobs in the fog, an automaton fortune-teller inside, painted smile flaking. ' +
            'A slot waits for a marble, and behind the glass her hand already hovers over a deck of cards.',
        root: {
            prompt: 'The automaton’s eyes click open and fix on you. Do you pay for a fortune?',
            answers: [
                {
                    choice: 'Feed it a marble and ask about the road ahead',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'A card drops into the tray, hand-painted with a route the charts never had. The ' +
                            'automaton’s smile, for one frame, looks almost real. The marble was well spent.',
                        effects: [
                            { kind: 'resource', marbles: -3 },
                            { kind: 'openRoute', to: 'veiled-fortune-road' },
                        ],
                    },
                },
                {
                    choice: 'Ask mom to read the machine’s broken almanac',
                    tone: 'neutral',
                    gate: { kind: 'crew', member: 'mom' },
                    outcome: {
                        resultText:
                            'Mom pops the back panel and reads the warped star-tables the automaton works from. ' +
                            'Half are nonsense; half line up with charts she’s been missing for a hundred light-years.',
                        effects: [{ kind: 'flag', set: 'fortune-almanac-read' }],
                    },
                },
                {
                    choice: 'Demand it tell you what happened to your family',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You hammer the glass and ask the one thing it can’t answer. It deals card after grey ' +
                            'blank card until the tray overflows, and the question hangs there, hollow, all the way ' +
                            'out the door.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-frozen-parade',
        sector: 'veiled-nebula',
        intro:
            'A neon parade stopped dead mid-march — floats, marching bands, balloon beasts the size of ' +
            'gunships, every face caught mid-cheer and held there, grinning, for who knows how long.',
        root: {
            prompt: 'Your ship drifts down the frozen avenue between the silent floats. What do you do?',
            answers: [
                {
                    choice: 'Strike up the band and get the parade moving',
                    tone: 'good',
                    followUp: {
                        prompt: 'You find the bandleader’s frozen baton. How do you restart the march?',
                        answers: [
                            {
                                choice: 'Lead it gently, let it remember itself',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'One float, then ten, then the whole avenue rolls back into motion, confetti ' +
                                        'thawing in the air. A parade in full cry is pure play, and the grey recoils ' +
                                        'from the noise of it.',
                                    effects: [{ kind: 'front', advance: -1 }],
                                },
                            },
                            {
                                choice: 'Just get the lead float rolling and ride along',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You can’t wake the whole avenue, but you coax the big float into a slow lap, ' +
                                        'and it scatters trinket-prizes from its hoppers as it goes. Not bad for one ' +
                                        'float.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                            {
                                choice: 'Crank the tempo to a frenzy',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You whip the band into a stampede and a balloon beast slips its tethers, ' +
                                        'lurching into your hull before it pops in a gust of stale air. The avenue ' +
                                        'freezes again, embarrassed.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Cut a balloon beast loose to tow for salvage',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You snag the smallest balloon beast and reel it in. Its skin is woven with old festival ' +
                            'foil worth a tidy sum, though it deflates a little sadly as you fold it into the hold.',
                        effects: [{ kind: 'resource', marbles: 6 }],
                    },
                },
                {
                    choice: 'Slip past quietly so as not to wake it',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You thread the silent avenue on whisper-thrust and leave every grin exactly as you ' +
                            'found it. Behind you the parade waits on, mid-cheer, for a crowd that is never coming.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-roller-disco-moon',
        sector: 'veiled-nebula',
        intro:
            'A little moon paved end to end in a roller rink, mirror-ball the size of a cathedral, a ' +
            'thumping beat still pumping through dead speakers and not one skater on the gleaming floor.',
        root: {
            prompt: 'The rink lights flare to life and the beat finds its groove. Do you lace up?',
            answers: [
                {
                    choice: 'Skate the whole rink, fast and free',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You carve laps under the mirror-ball until the moon itself seems to grin, and ghostly ' +
                            'skaters fade in to flank you, whooping. They leave you a pair of their lightning-trim ' +
                            'skates when the song ends.',
                        effects: [{ kind: 'item', grant: 'disco-skates' }],
                    },
                },
                {
                    choice: 'Pry loose a panel of the mirror-ball',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You chip a wedge of mirror-glass off the great ball — it still catches and throws ' +
                            'light long after you’ve stowed it. The rink dims by one facet’s worth and skates on ' +
                            'without you.',
                        effects: [{ kind: 'resource', marbles: 8 }],
                    },
                },
                {
                    choice: 'Kill the music — the beat is grating',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You find the booth and cut the track. The mirror-ball stops, the lights gutter, and ' +
                            'the moon goes still and grey, a party ended early by the one person who wouldn’t dance.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-seance-station',
        sector: 'veiled-nebula',
        intro:
            'A derelict station rigged into one enormous séance — a ring of antennae round a table, a ' +
            'planchette of welded scrap twitching across a dial of star-charts, spelling something, slowly.',
        root: {
            prompt: 'The planchette stops, then jerks toward you, inviting a hand to the table. Do you sit?',
            answers: [
                {
                    choice: 'Sit, lay a hand down, and listen',
                    tone: 'good',
                    followUp: {
                        prompt: 'A voice threads up through the static, faint, asking for one thing. What does it want?',
                        answers: [
                            {
                                choice: 'To finally be remembered by name',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You write its name in the ship’s log, out loud, and the static eases into ' +
                                        'something like a sigh of thanks. The crew is shaken and softened, closer for ' +
                                        'having held a stranger’s hand across the dark.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'flag', set: 'seance-named' },
                                    ],
                                },
                            },
                            {
                                choice: 'To pass on coordinates it never got to send',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The planchette spells out a string of figures and goes still. They’re old ' +
                                        'salvage bearings — worth following, if the wrecks haven’t already been picked ' +
                                        'clean.',
                                    effects: [{ kind: 'flag', set: 'seance-bearings' }],
                                },
                            },
                            {
                                choice: 'To take your warmth so it can speak louder',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You let it draw on the crew’s heat to find its voice, and find its voice it ' +
                                        'does — but the cabin goes cold and the crew colder, and you cut the link ' +
                                        'before it can ask for more.',
                                    effects: [{ kind: 'resource', heart: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Tap the séance rig for its salvage instead',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You strip the antenna ring for its rare receiver-crystals while the planchette twitches ' +
                            'on, unanswered, in the dark. Good haul. The voice, whatever it was, never got its hand.',
                        effects: [{ kind: 'resource', marbles: 10 }],
                    },
                },
                {
                    choice: 'Scramble the whole signal and move on',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You flood the band with noise and the planchette skitters off the dial and dies. ' +
                            'Whatever was reaching through loses its grip for good, and the station goes truly, ' +
                            'finally empty.',
                        effects: [{ kind: 'flag', set: 'seance-silenced' }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-spinning-fortune-wheel',
        sector: 'veiled-nebula',
        intro:
            'A wheel of fortune two storeys tall turns on its own in the fog, its painted prizes worn ' +
            'to grey ghosts of colour. A spectral barker doffs a faded hat: one ante per spin, no refunds.',
        root: {
            prompt: 'The barker rests a translucent hand on the wheel and waits for your wager. Do you play?',
            answers: [
                {
                    choice: 'Ante a fat stack and spin for the jackpot wedge',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -10 }],
                    followUp: {
                        prompt: 'The wheel screams round, the clicker stuttering, slowing. Where does the pointer bite?',
                        answers: [
                            {
                                choice: 'Dead on the gold jackpot wedge',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The pointer thunks into gold and the wheel showers you in marbles like a ' +
                                        'burst piñata, the barker tipping his hat as the colour floods back into the ' +
                                        'paint for one bright second.',
                                    effects: [{ kind: 'resource', marbles: 16 }],
                                },
                            },
                            {
                                choice: 'A modest middling wedge',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A consolation chime. The tray coughs up enough to nearly cover your ante and ' +
                                        'a wooden token good for one free re-spin you’ll probably never come back for.',
                                    effects: [{ kind: 'resource', marbles: 8 }],
                                },
                            },
                            {
                                choice: 'The grey BANKRUPT wedge nobody warned you about',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The pointer settles on a wedge worn blank, and the barker’s smile doesn’t. ' +
                                        'House keeps the ante. He spins again for the dark, alone, the way he has ' +
                                        'for years.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Watch the wheel turn and clock its dead spots',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You stand at the rail for free and learn the wheel’s tired rhythm — where it favours, ' +
                            'where it cheats. Worth knowing, if you ever pass a wheel like it again.',
                        effects: [{ kind: 'flag', set: 'wheel-pattern-learned' }],
                    },
                },
                {
                    choice: 'Jam the wheel’s axle to rob the prize tray',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You wedge the great axle and crack the tray, but it’s mostly ghost-coin that crumbles ' +
                            'to grey dust in your hands. The barker stops doffing his hat, and the fog gets a shade ' +
                            'closer.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-ghost-poker-parlour',
        sector: 'veiled-nebula',
        intro:
            'A smoke-stained parlour drifts past, a felt table inside ringed by translucent gamblers who ' +
            'fold and ante in perfect silence. One empty chair waits, and the dealer slides it back for you.',
        root: {
            prompt: 'The phantom dealer fans a hand toward the open seat. The buy-in glints on the felt. Do you sit?',
            answers: [
                {
                    choice: 'Pay the buy-in and play the ghosts at their own game',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -7 }],
                    followUp: {
                        prompt: 'It comes down to the river, your hand against the table. How does the showdown fall?',
                        answers: [
                            {
                                choice: 'You read the dead cold and scoop the pot',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You call a bluff a hundred years stale and rake in the whole grey pot. The ' +
                                        'gamblers nod, almost relieved to lose, and one slides you a chip that opens a ' +
                                        'door later.',
                                    effects: [
                                        { kind: 'resource', marbles: 13 },
                                        { kind: 'openRoute', to: 'veiled-poker-back-room' },
                                    ],
                                },
                            },
                            {
                                choice: 'You split the pot on a tie',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Two ghosts and you turn over the same hand and the dealer shrugs the pot ' +
                                        'three ways. You leave a touch ahead, the felt no warmer for your having played ' +
                                        'it.',
                                    effects: [{ kind: 'resource', marbles: 9 }],
                                },
                            },
                            {
                                choice: 'You shove on a bluff and get snapped off',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You push everything on air and a dealer with no tell calls you flat. The ' +
                                        'buy-in stays on the felt and the gamblers deal around your empty seat as if ' +
                                        'you were never there.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Stand behind a player and study the tells',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You rail the game for free, watching how the dead bet. They have nothing left to bluff ' +
                            'for, which makes them oddly easy to read. The lesson costs you nothing but the night.',
                        effects: [{ kind: 'flag', set: 'poker-tells-studied' }],
                    },
                },
                {
                    choice: 'Pocket a stack of chips off the felt and leave',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You sweep a careless handful of chips and bolt. They weigh real enough in your hold, ' +
                            'but the parlour door slams behind you and the welcome here is spent for good.',
                        effects: [{ kind: 'resource', marbles: 4, heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-dunk-the-spook-booth',
        sector: 'veiled-nebula',
        intro:
            'A carnival dunk-tank bobs in the void, a sodden spook perched on the drop-seat, taunting an ' +
            'empty midway. A rack of weighted balls hangs beside a sign: THREE THROWS, ONE PRICE, BIG PRIZE.',
        root: {
            prompt: 'The spook leans off its seat and jeers at you to try your arm. Do you buy a turn?',
            answers: [
                {
                    choice: 'Buy the balls and throw for the big prize',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -5 }],
                    followUp: {
                        prompt: 'You wind up for the target. The spook grins, daring you. How do the throws land?',
                        answers: [
                            {
                                choice: 'Three strikes — the seat drops every time',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You dunk the spook three for three and it comes up sputtering, delighted to ' +
                                        'lose, and hands over the top-shelf prize: a charm that hums with old fairground ' +
                                        'luck.',
                                    effects: [{ kind: 'item', grant: 'midway-luck-charm' }],
                                },
                            },
                            {
                                choice: 'One clean strike, two near misses',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'One ball clips the latch and down it goes, once. Not the big prize, but the ' +
                                        'spook fishes a small payout from a soggy pocket and tips its hat for the effort.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Three wild misses while it heckles',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Every throw sails wide and the spook howls with laughter, bone-dry and ' +
                                        'smug. You walk off to its jeering, lighter by an entry fee and a little pride.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Chat the bored spook up instead of playing',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You skip the rigged game and just talk. The spook, starved for a mark who’ll listen, ' +
                            'spills which midway stalls actually pay out. Gossip is its own small prize.',
                        effects: [{ kind: 'flag', set: 'midway-gossip' }],
                    },
                },
                {
                    choice: 'Tip the whole tank over to fish out the coin box',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You heave the tank and grey water sheets everywhere, shorting the booth and slicking ' +
                            'your boots. The coin box is half-rusted-shut, the spook is gone, and you reek of cold ' +
                            'pond all the way out.',
                        effects: [{ kind: 'resource', marbles: 4, heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-phantom-auction',
        sector: 'veiled-nebula',
        intro:
            'A grand auction house hangs lit in the dark, rows of ghost bidders raising spectral paddles ' +
            'at a velvet-draped lot. An auctioneer of pure static gavels for a crowd that pays in memory.',
        root: {
            prompt: 'The veil slips off the headline lot — something that hums like it matters. Do you bid?',
            answers: [
                {
                    choice: 'Bid hard against the ghosts for the headline lot',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -12 }],
                    followUp: {
                        prompt: 'The bidding war narrows to you and one stubborn phantom. What goes under the gavel?',
                        answers: [
                            {
                                choice: 'A genuine treasure the dead overlooked',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The phantom folds and the gavel falls to you. The lot is real and rare — a ' +
                                        'relic the bidders, paying only in memory, could never truly own. It’s worth ' +
                                        'far more than you paid.',
                                    effects: [
                                        { kind: 'item', grant: 'auctioned-relic' },
                                        { kind: 'resource', marbles: 6 },
                                    ],
                                },
                            },
                            {
                                choice: 'A fair lot, fairly bought',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You win it for about what it’s worth — no steal, no swindle. A solid piece ' +
                                        'for the hold and a paddle-number the house will honour if you ever return.',
                                    effects: [{ kind: 'resource', marbles: 10 }],
                                },
                            },
                            {
                                choice: 'A gilded box of nothing but old fog',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You outbid the room and crack the lid on a beautiful empty box, the prize ' +
                                        'long since faded out of it. The ghosts applaud your purchase, which is the ' +
                                        'cruelest part.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Sit on your paddle and just take notes on the lots',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You bid on nothing and watch everything, cataloguing what the dead think is precious. ' +
                            'The list alone is worth carrying — half of it points at salvage still out there.',
                        effects: [{ kind: 'flag', set: 'auction-catalogue' }],
                    },
                },
                {
                    choice: 'Snatch a lot off the block and run for the doors',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You grab the nearest lot and sprint. The static-auctioneer’s gavel cracks like thunder ' +
                            'and every paddle turns your way — but you’re through the doors clutching loot you didn’t ' +
                            'pay a memory for. It hums, resentful, in your hands.',
                        effects: [
                            { kind: 'item', grant: 'stolen-auction-lot' },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-midway-ring-toss',
        sector: 'veiled-nebula',
        intro:
            'A ring-toss stall floats half-lit on the dead midway, bottles racked in tight rows, the top ' +
            'one crowned with a glittering grand prize. A ghostly attendant rattles a fistful of grey hoops.',
        root: {
            prompt: 'The attendant offers the hoops and nods at the crowning bottle. Do you pay to toss?',
            answers: [
                {
                    choice: 'Pay for a full handful and go for the crown bottle',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -6 }],
                    followUp: {
                        prompt: 'You sight the impossible top bottle and let the hoops fly. Where do they fall?',
                        answers: [
                            {
                                choice: 'A ringer on the crown bottle itself',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The last hoop drops clean over the crown and the stall lights blaze gold. ' +
                                        'The attendant lifts down the grand prize with both ghostly hands and presses ' +
                                        'it, glowing, into yours.',
                                    effects: [{ kind: 'item', grant: 'ring-toss-grand-prize' }],
                                },
                            },
                            {
                                choice: 'Two hoops land on the low bottles',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You can’t crack the crown, but two hoops settle on the cheap rack and the ' +
                                        'attendant counts out a fair little stack. A consolation, honestly earned.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                            {
                                choice: 'Every hoop clatters off and away',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The bottles are spaced a hair too wide, the way they always are, and every ' +
                                        'hoop bounces off into the dark. The attendant rattles a fresh handful, ever ' +
                                        'so hopeful.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Measure the bottle spacing before committing',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You lean in and eyeball the rack for free, and the cheat is obvious — the crown bottle ' +
                            'is just a hair too fat for any hoop. You pocket the knowing and tip the attendant a nod.',
                        effects: [{ kind: 'flag', set: 'ring-toss-rigged-known' }],
                    },
                },
                {
                    choice: 'Just reach over and lift the grand prize down',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You skip the game and grab the prize off its perch. It’s a hollow gilded shell, weightless ' +
                            'and worthless, and the attendant’s grey face falls in a way you’ll think about later.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'veiled-high-roller-table',
        sector: 'veiled-nebula',
        intro:
            'A roped-off high-roller table glows at the heart of a dead casino-station, a single masked ' +
            'phantom seated behind a tower of antique chips, beckoning you to a game with no name and no limit.',
        root: {
            prompt: 'The masked high roller pushes a stake across the felt and waits for you to match it. Do you ante up?',
            answers: [
                {
                    choice: 'Match the stake and face the phantom across the table',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -9 }],
                    followUp: {
                        prompt: 'The phantom lifts its mask a finger’s width — there’s nothing under it. It cuts the deck. Now?',
                        answers: [
                            {
                                choice: 'Stare it down and call the hand',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You don’t blink and neither does the empty mask, but its hand breaks first. ' +
                                        'The whole tower of chips slides your way, and the casino lights warm a notch ' +
                                        'as a real winner finally walks the floor.',
                                    effects: [
                                        { kind: 'resource', marbles: 15 },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Lose your nerve and fold the big hand',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You can’t read the empty mask and you fold rather than find out. The phantom ' +
                                        'rakes the pot without a flicker and slides a courtesy chip back — half your ' +
                                        'stake, returned, for playing fair.',
                                    effects: [{ kind: 'resource', marbles: 4 }],
                                },
                            },
                            {
                                choice: 'Refuse to lay your cards down at all',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You won’t show and neither will it, and the stalemate sours into something ' +
                                        'with edges. The phantom stands, the mask blank and patient, and reaches for ' +
                                        'a hand that isn’t cards. This is a duel now.',
                                    effects: [
                                        {
                                            kind: 'spawnGame',
                                            game: 'duel',
                                            reason: 'veiled-high-roller-standoff',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Decline and play the low-stakes slots by the door',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You wave off the big table and feed the rattly old slots instead. They pay out in dribs ' +
                            'and grey tokens, but you leave a little ahead and entirely un-haunted.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Tip the masked phantom’s chip tower and grab what scatters',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You shove the tower and snatch a fistful as it falls, but the chips turn to cold grey ' +
                            'discs the moment they leave the felt. The phantom watches, unmoved, and the casino dims ' +
                            'around your bad bet.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
];
