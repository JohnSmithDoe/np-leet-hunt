import { PlanetEvent } from '../../event.model';

/**
 * Home Reach sector pool — the space right behind the garage. Green worlds and a suburban nebula where
 * familiar things float a little wrong: a tractor in orbit, a lemonade stand on a comet, the block party
 * that never quite ended. The least-greyed sector, so the tone runs warm and playful; the Hush only seeps
 * in at the edges (a thief drone, a treehouse the grey forgot). Consequence over punishment — bad branches
 * cost resources, advance the front, or pick a fight, never end the run. See event-system.md §3–§5 and
 * game-design.md §5 (sector 1, guardian: the Gnome King). The grass-meadow alien encounter is its own file.
 */
export const homeReachEvents: PlanetEvent[] = [
    {
        id: 'home-tractor-in-orbit',
        sector: 'home-reach',
        intro:
            'A farm tractor turns slow circles in low orbit, engine idling, no farm in sight. It still has ' +
            'mud on the tyres. The pet presses both paws to the glass.',
        root: {
            prompt: 'There is clearly a confused machine out here. What do you do?',
            answers: [
                {
                    choice: 'Tow it in and see what it remembers',
                    tone: 'good',
                    followUp: {
                        prompt: 'In the bay it sputters, headlights flicking like it is trying to talk. Listen for what?',
                        answers: [
                            {
                                choice: 'Patiently — let it tell its whole story',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Honk by honk it gives up a map of the field it was ploughing before the grey ' +
                                        'took it — a furrow that runs to a planet no chart shows. Grateful, it shakes ' +
                                        'loose a fistful of marbles from the seat cushion before it goes.',
                                    effects: [
                                        { kind: 'resource', marbles: 12 },
                                        { kind: 'openRoute', to: 'home-ploughed-field' },
                                    ],
                                },
                            },
                            {
                                choice: 'Just top up its tank and send it home',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You siphon it some fuel and point it sunward. It trundles off content, and you ' +
                                        'are a little out of pocket for the kindness.',
                                    effects: [{ kind: 'resource', marbles: 4 }],
                                },
                            },
                            {
                                choice: 'Strip it for the engine — you need parts',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'It goes quiet the moment you reach for the bolts. You get your parts. The pet ' +
                                        'will not look at you for a while, and neither will you.',
                                    effects: [
                                        { kind: 'item', grant: 'tractor-engine' },
                                        { kind: 'resource', heart: -1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Photograph it and move on',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You log a tractor in orbit, file it under "things that should not be," and leave it to its ' +
                            'circling. The crew will not believe you without the picture.',
                        effects: [{ kind: 'flag', set: 'saw-orbital-tractor' }],
                    },
                },
                {
                    choice: 'Nudge it out of your flight path',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You bump it aside. It bumps back — harder, all four tonnes of it — and your hull wears the ' +
                            'dent of a very surprised tractor.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-gnome-scout',
        sector: 'home-reach',
        intro:
            'A garden gnome stands on a bare asteroid, red hat, fishing rod, line cast into open space. It does ' +
            'not turn around, but you are entirely certain it knows you are there.',
        root: {
            prompt: 'How do you greet the little fellow?',
            answers: [
                {
                    choice: 'Crouch down and say hello',
                    tone: 'good',
                    followUp: {
                        prompt: 'It tips its hat. "Scout for the King," it says. "Playing or passing?" How do you answer?',
                        answers: [
                            {
                                choice: '"Playing — show me a game"',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It teaches you a counting rhyme the Gnome King favours, the kind that opens ' +
                                        'doors later. You will remember it when it matters.',
                                    effects: [{ kind: 'flag', set: 'gnome-king-rhyme' }],
                                },
                            },
                            {
                                choice: '"Passing — but here is a marble for you"',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It pockets the marble with great ceremony and waves you on. A fair trade for ' +
                                        "safe passage through its master's reach.",
                                    effects: [{ kind: 'resource', marbles: -3, heart: 1 }],
                                },
                            },
                            {
                                choice: '"Neither — your King does not scare me"',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The gnome notes your name in a tiny ledger and reels in its line. Somewhere ahead, ' +
                                        'a door you wanted open just quietly latched.',
                                    effects: [{ kind: 'flag', set: 'snubbed-gnome-king' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Scan it from a polite distance',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Ceramic, hollow, and reading off the scanner as far older than ceramic has any right to be. ' +
                            'You note the contradiction and keep your distance.',
                        effects: [],
                    },
                },
                {
                    choice: 'Snatch the hat with the tractor beam',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The red hat comes free with a pop and the gnome lets out a whistle that carries impossibly ' +
                            'far. You have just told the whole Gnome King the road you came in on.',
                        effects: [
                            { kind: 'item', grant: 'gnome-hat' },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'home-lemonade-comet',
        sector: 'home-reach',
        intro:
            'A comet drifts by trailing a folding table, a hand-lettered sign, and a small alien in a sun-hat. ' +
            '"LEMONADE," the sign reads. "5 MARBLES. (HONEST.)"',
        root: {
            prompt: 'The stand looks suspiciously well-run for the middle of nowhere. What now?',
            answers: [
                {
                    choice: 'Buy a cup and tip generously',
                    tone: 'good',
                    followUp: {
                        prompt: 'It is genuinely the best lemonade you have ever had. The vendor beams. "Refill? Or a secret?"',
                        answers: [
                            {
                                choice: 'Ask for the secret',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It leans in: a fuel depot the grey has not noticed, two jumps over. Worth far ' +
                                        'more than the lemonade, which was already excellent.',
                                    effects: [
                                        { kind: 'resource', marbles: -6 },
                                        { kind: 'openRoute', to: 'home-hidden-depot' },
                                    ],
                                },
                            },
                            {
                                choice: 'Take the refill and a jug to go',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You leave with a sealed jug for the long dark stretches and a vendor who calls ' +
                                        'you a regular. The crew morale rises a notch.',
                                    effects: [
                                        { kind: 'resource', marbles: -6, heart: 1 },
                                        { kind: 'item', grant: 'lemonade-jug' },
                                    ],
                                },
                            },
                            {
                                choice: 'Just say thanks and fly on',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You wave off the offer and go. Only later does it nag at you — the one stranger ' +
                                        'out here being kind, and you took the cup and ran.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Pay the five and keep moving',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Five marbles, one cup, a fair deal honestly kept. It is, you will admit, quite good lemonade.',
                        effects: [{ kind: 'resource', marbles: -5 }],
                    },
                },
                {
                    choice: 'Knock the table and grab a free cup',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The cup is free; the lesson is not. The "honest" sign flips to "RUDE" and every lemonade ' +
                            'stand in Home Reach somehow already knows your face.',
                        effects: [{ kind: 'flag', set: 'lemonade-blacklist' }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-thief-drone-cul-de-sac',
        sector: 'home-reach',
        intro:
            'A Grey Fleet thief drone hangs over a tidy ring of suburban planets like a cul-de-sac, tractor beam ' +
            "locked onto a stash of marbles tumbling up out of someone's back garden.",
        root: {
            prompt: 'It has not seen you yet, but it is about to flee with that stash. What do you do?',
            answers: [
                {
                    choice: 'Cut its beam before it can run',
                    tone: 'good',
                    followUp: {
                        prompt: 'The beam snaps; the drone wheels round to face you, very awake now. How do you take it?',
                        answers: [
                            {
                                choice: 'Press the advantage and board it',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You catch it flat-footed, pop the hatch, and reclaim the stash plus whatever it ' +
                                        'had already swallowed. A clean catch — the grey goes a little hungrier tonight.',
                                    effects: [
                                        { kind: 'resource', marbles: 16 },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Square up for a proper fight',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It will not surrender the cargo without a duel. You drop your gear and square up ' +
                                        'in the quiet of the cul-de-sac.',
                                    effects: [{ kind: 'spawnGame', game: 'duel', launch: { reason: 'thief-drone' } }],
                                },
                            },
                            {
                                choice: 'Wave it off and let it keep the stash',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You decide it is not worth the dent. The drone bobs once, almost smug, and feeds ' +
                                        'the marbles to the grey on its way out.',
                                    effects: [{ kind: 'front', advance: 1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Warn the houses below and shoo it off',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You blare every light and siren you have. The drone bolts with a half-stash; the cul-de-sac ' +
                            'keeps the rest and the locals leave their porch lamps on for you.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Hang back and let it finish — not your fight',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You watch the beam pull the last marble up and the drone slip into the dark. The gardens ' +
                            'below go one shade greyer, and the front creeps a step closer.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-backyard-pool',
        sector: 'home-reach',
        intro:
            'A round above-ground swimming pool floats in the black, water perfectly level, an inflatable ' +
            'flamingo turning lazy circles. A ladder hangs off one side into nothing.',
        root: {
            prompt: 'It is a backyard pool in deep space. Obviously. Do you stop?',
            answers: [
                {
                    choice: 'Suit up the crew for a swim',
                    tone: 'good',
                    followUp: {
                        prompt: 'The water is warm and somehow breathable through the suits. Everyone splashing — what next?',
                        answers: [
                            {
                                choice: 'Let them play until they are worn out',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'An hour of pure nonsense — cannonballs in zero-g, the flamingo as a hat. The crew ' +
                                        'comes back lighter than they have felt in weeks.',
                                    effects: [{ kind: 'resource', heart: 2 }],
                                },
                            },
                            {
                                choice: 'Dive for whatever sank to the bottom',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        "Down past the warm layer you find a child's waterproof watch, still ticking true " +
                                        'time the grey has not yet reached. You pocket it, dripping.',
                                    effects: [{ kind: 'item', grant: 'pool-watch' }],
                                },
                            },
                            {
                                choice: 'Race to the far rail, no rules',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Someone clips the ladder, someone else clips someone else. You fish two crew out ' +
                                        'sputtering. Fun, until it was not.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Refill your tanks from the pool and go',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Clean, warm, oddly sweet water — your reserves top off nicely. The flamingo watches you ' +
                            'leave with what you choose not to read as judgement.',
                        effects: [{ kind: 'resource', hull: 1 }],
                    },
                },
                {
                    choice: 'Pop the flamingo with a warning shot for fun',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The flamingo deflates with a long, mournful raspberry, and the whole pool follows it into ' +
                            'a slow grey collapse. You took a small bright thing and let the air out of it.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-mailbox-row',
        sector: 'home-reach',
        intro:
            'A row of suburban mailboxes stands on a strip of curb floating in orbit, red flags up, every one ' +
            'numbered but the street name long faded. One flag twitches as you approach.',
        root: {
            prompt: 'Someone has mail out here. What do you do about it?',
            answers: [
                {
                    choice: 'Check the box with the raised flag',
                    tone: 'good',
                    followUp: {
                        prompt: 'Inside is a letter addressed in a child\'s hand to "ANYONE STILL OUT THERE." Open it?',
                        answers: [
                            {
                                choice: 'Read it, then deliver it onward',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'A hand-drawn map to a neighbour who "moved away in the grey." You follow the ' +
                                        'crayon arrows and a forgotten road blinks back onto your charts.',
                                    effects: [{ kind: 'openRoute', to: 'home-lost-neighbour' }],
                                },
                            },
                            {
                                choice: 'Leave a reply and a marble inside',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You write back "still here," tuck a marble in for postage, and raise the flag for ' +
                                        'the next ship. Somewhere, you hope, a small face lights up.',
                                    effects: [
                                        { kind: 'resource', marbles: -3 },
                                        { kind: 'flag', set: 'answered-the-mail' },
                                    ],
                                },
                            },
                            {
                                choice: 'Pocket the letter as a curio',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You keep it. The flag drops on its own, and the row of boxes seems to lean away ' +
                                        'from you, a street that has decided you are not a neighbour.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Pull the curb in for the scrap metal',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Decent salvage, if you can ignore the flags. You patch a hull seam with mailbox steel and ' +
                            'try not to think about the letters still inside.',
                        effects: [{ kind: 'resource', hull: 1 }],
                    },
                },
                {
                    choice: 'Blast the lot for target practice',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            "You scatter forty years of unread post into the void. The flamingo-pink confetti of someone's " +
                            'birthday card drifts past your viewport, and you feel suddenly, sharply small.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-block-party',
        sector: 'home-reach',
        intro:
            'A whole green world is mid block-party: bunting strung pole to pole, grills smoking, a hundred ' +
            'species in lawn chairs. Someone waves you down to land like you are just late.',
        root: {
            prompt: 'The neighbourhood clearly expects you to join. Do you?',
            answers: [
                {
                    choice: 'Set down and bring something to share',
                    tone: 'good',
                    followUp: {
                        prompt: 'You crack open the galley. What do you bring out to the long shared table?',
                        answers: [
                            {
                                choice: "Grandma's recipe, made for a crowd",
                                tone: 'good',
                                gate: { kind: 'crew', member: 'grandma' },
                                outcome: {
                                    resultText:
                                        'Grandma takes over the biggest grill like she owns it. The street eats, sings, and ' +
                                        'sends you off with leftovers, gifts, and a standing invitation.',
                                    effects: [
                                        { kind: 'resource', marbles: 15, heart: 1 },
                                        { kind: 'flag', set: 'block-party-hero' },
                                    ],
                                },
                            },
                            {
                                choice: 'Whatever is in the hold — potluck it',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Ration bars and mystery cans, presented with confidence. It all goes, somehow, and ' +
                                        'the neighbours press a few marbles on you for the effort.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Charge admission for "the space show"',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You turn a block party into a box office. They pay, once, and the bunting comes ' +
                                        'down a little as you lift off. You made money and lost the room.',
                                    effects: [{ kind: 'resource', marbles: 8 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Wave, take a plate, keep it brief',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'One burger, twenty minutes of small talk, back to the ship. Warm, ordinary, and exactly ' +
                            'enough. You forgot, for a moment, what you were running from.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Buzz the party low and roar off',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You scatter the bunting and tip three grills with your wash. The cheering turns to shaking ' +
                            'fists, and word of the rude ship in the sky travels faster than you do.',
                        effects: [{ kind: 'flag', set: 'crashed-block-party' }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-treehouse-broadcast',
        sector: 'home-reach',
        intro:
            'A treehouse rides a drifting chunk of oak, rope ladder dangling, a coat-hanger aerial on the roof ' +
            'still pushing out an old radio serial the grey somehow never switched off.',
        root: {
            prompt: 'The signal is faint and stubborn, a bright thread the Hush missed. What do you do?',
            answers: [
                {
                    choice: 'Climb up and tend the little station',
                    tone: 'good',
                    followUp: {
                        prompt: "Inside: a wind-up transmitter, a stack of serials, a kid's logbook. How do you help it?",
                        answers: [
                            {
                                choice: 'Wind it fully and boost the broadcast',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You crank the spring tight and the serial swells out across the sector — a wave of ' +
                                        'pure remembered play that makes the grey flinch and fall back a step.',
                                    effects: [{ kind: 'front', advance: -1 }],
                                },
                            },
                            {
                                choice: 'Borrow a serial reel for the long nights',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You take one reel, leave the rest spinning, and sign the logbook so the kid knows ' +
                                        'a listener came by. The pet already has a favourite episode.',
                                    effects: [{ kind: 'item', grant: 'serial-reel' }],
                                },
                            },
                            {
                                choice: 'Strip the aerial for the rare copper',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The signal cuts mid-cliffhanger. You have good copper and a treehouse gone silent, ' +
                                        'one more small bright thing handed quietly to the grey.',
                                    effects: [
                                        { kind: 'item', grant: 'copper-wire' },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Record the broadcast and move on',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You capture an episode for the archives — proof that somewhere out here a kid is still ' +
                            'telling stories at the grey. Worth knowing, if nothing else.',
                        effects: [{ kind: 'flag', set: 'heard-treehouse-serial' }],
                    },
                },
                {
                    choice: 'Jam the frequency — it is cluttering your comms',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You drown the serial under static and reclaim your channel. The thread of bright sound goes ' +
                            'out, and you cannot shake the sense you just did the Hush a favour.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-sprinkler-nebula',
        sector: 'home-reach',
        intro:
            'The suburban nebula opens around you as a slow oscillating sprinkler the size of a moon, throwing ' +
            'great glittering arcs of mist across a lawn of stars. It hisses, sweeps, hisses back.',
        root: {
            prompt: 'The mist reads as harmless on every scanner, and faintly, impossibly, of cut grass. Go in?',
            answers: [
                {
                    choice: 'Fly the ship through the arcs, slow and careful',
                    tone: 'good',
                    followUp: {
                        prompt: 'The mist beads on the hull and runs off bright. In the heart of it the sprinkler-head turns. What now?',
                        answers: [
                            {
                                choice: 'Drift in the cool of it and let the ship soak',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The mist works into every seam and scoured panel, and the hull comes out gleaming, ' +
                                        'sealed, better than the yard ever left it. The pet rolls in the spray.',
                                    effects: [
                                        { kind: 'resource', hull: 2 },
                                        { kind: 'flag', set: 'sprinkler-blessed' },
                                    ],
                                },
                            },
                            {
                                choice: 'Catch a flask of the mist before you leave',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You bottle a little of the impossible green-smelling rain. It keeps things bright ' +
                                        'a while, the locals say, against the grey.',
                                    effects: [{ kind: 'item', grant: 'sprinkler-flask' }],
                                },
                            },
                            {
                                choice: 'Gun it through to save time',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You hit the spinning head at speed. It clangs, the arc stutters, and you come out ' +
                                        'the far side with a cracked panel and a sprinkler that now sweeps wrong.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Skirt the edge and admire it from outside',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You ride the rim where the mist thins to rainbows. Nothing gained but the view, and the view ' +
                            'is the kind you remember on the grey stretches.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Crank the engines to blow the nebula apart',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Your wash tears a hole in the arcs. For a heartbeat the smell of cut grass is gone and there ' +
                            'is only cold and grey behind it, rushing to fill the gap you made.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
];
