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
                                    effects: [
                                        { kind: 'spawnGame', game: 'duel', launch: { reason: 'fan-club-heist' } },
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
];
