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
                                    effects: [{ kind: 'spawnGame', game: 'duel', reason: 'thief-drone' }],
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
    {
        id: 'home-ice-cream-truck',
        sector: 'home-reach',
        intro:
            'An ice-cream truck coasts through the dark, jingle looping tinny and slow, the little hatch propped ' +
            'open. No driver. The pet is already pawing at the airlock.',
        root: {
            prompt: 'The jingle drags at something behind your ribs. Do you pull alongside?',
            answers: [
                {
                    choice: 'Match speed and reach in for a cone',
                    tone: 'good',
                    followUp: {
                        prompt: 'The freezer fog clears to rows of flavours no shop ever sold. Which do you take?',
                        answers: [
                            {
                                choice: "The one labelled in a kid's handwriting",
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It tastes exactly like a Tuesday you had forgotten you owned. The crew goes quiet ' +
                                        'in the good way, and the pet wears most of its cone home.',
                                    effects: [{ kind: 'resource', heart: 2 }],
                                },
                            },
                            {
                                choice: 'Whatever scoop the machine offers first',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Plain vanilla, cold and fine, and a few coins of change tumble out the hatch as a ' +
                                        'thank-you you did not earn. You take both and wave at no one.',
                                    effects: [{ kind: 'resource', marbles: 4 }],
                                },
                            },
                            {
                                choice: 'Empty the whole freezer into the hold',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You clear it out, every tub. The jingle winds down to nothing, the truck dims, and ' +
                                        'somewhere a route that played that tune goes quiet for good.',
                                    effects: [
                                        { kind: 'resource', marbles: 9 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Follow it a while to see where it is going',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'It loops a cul-de-sac of empty driveways, jingling for children who are not there anymore. ' +
                            'You peel away before the loop can finish its thought.',
                        effects: [{ kind: 'flag', set: 'followed-ice-cream-truck' }],
                    },
                },
                {
                    choice: 'Kill the jingle — it is fraying your nerves',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A pulse from your comms and the tune chokes off mid-bar. The silence that rushes in is worse, ' +
                            'and colder, than the jingle ever was.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-garage-sale-asteroid',
        sector: 'home-reach',
        intro:
            'An asteroid wears folding tables across its whole surface, junk pegged out under handwritten prices, ' +
            'a cardboard arrow reading "SALE THIS WAY" pointing into open space. A grandfather clock ticks somewhere.',
        root: {
            prompt: 'Everything a household forgot it owned, laid out for marbles. Do you browse?',
            answers: [
                {
                    choice: 'Get under the hood and rummage properly',
                    tone: 'good',
                    gate: { kind: 'crew', member: 'dad' },
                    outcome: {
                        resultText:
                            'Dad knows junk from treasure on sight and digs out a fan housing that fits your dodgy thruster ' +
                            'like it was machined for it. Five marbles, a steal, and the rattle is finally gone.',
                        effects: [
                            { kind: 'resource', marbles: -5, hull: 1 },
                            { kind: 'item', grant: 'thruster-housing' },
                        ],
                    },
                },
                {
                    choice: 'Buy one small thing you do not need',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'A snow globe of a town you have never been to, three marbles, no haggling. It sits on the dash ' +
                            'now, snowing quietly, and you would not trade it.',
                        effects: [
                            { kind: 'resource', marbles: -3 },
                            { kind: 'item', grant: 'snow-globe' },
                        ],
                    },
                },
                {
                    choice: 'Lowball the seller into the ground',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You grind the price down past fair, past kind, to almost nothing. You leave with a bargain and ' +
                            'a seller who folds their tables early, the sale arrow pointing now at nothing at all.',
                        effects: [
                            { kind: 'resource', marbles: 6 },
                            { kind: 'resource', heart: -1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'home-paper-route',
        sector: 'home-reach',
        intro:
            'A canvas satchel tumbles past, still stuffed with rolled newspapers, each rubber-banded and addressed ' +
            'to a porch among the planets ahead. A bike bell tings somewhere out of sight.',
        root: {
            prompt: 'A paper round, mid-delivery, abandoned in the black. What do you make of it?',
            answers: [
                {
                    choice: 'Finish the route — porch to porch',
                    tone: 'good',
                    followUp: {
                        prompt: 'You thread the addresses one by one. The last paper has no address, just a name. What now?',
                        answers: [
                            {
                                choice: 'Track the name down and hand it over',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The name leads to a lit window the charts had let go dark. An old reader takes the ' +
                                        'paper with both hands and tells you a quiet road back through the green.',
                                    effects: [{ kind: 'openRoute', to: 'home-last-subscriber' }],
                                },
                            },
                            {
                                choice: 'Leave it on the nearest doorstep and go',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'Close enough. You weight the last paper under a flowerpot and ring the bike bell once ' +
                                        'for old times. A few tip-marbles rattle in the bottom of the satchel.',
                                    effects: [{ kind: 'resource', marbles: 5 }],
                                },
                            },
                            {
                                choice: 'Read the headline before delivering',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The front page is the day the grey came, frozen mid-sentence. You set the satchel ' +
                                        'down and cannot, for a while, pick it back up.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Use the papers as packing for fragile gear',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Old newsprint cushions your loose cargo nicely. The hold smells of ink and Sunday mornings now, ' +
                            'and nothing rattles loose on the next hard burn.',
                        effects: [{ kind: 'resource', hull: 1 }],
                    },
                },
                {
                    choice: 'Tip the satchel out and keep the canvas bag',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You shake the papers into the void and keep the sturdy bag. Headlines drift past the viewport for ' +
                            'a long time after, undelivered, and the bike bell does not ring again.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-trampoline-moon',
        sector: 'home-reach',
        intro:
            'A small moon is one enormous backyard trampoline, the springs singing in the vacuum, the mat still ' +
            'faintly warm from the last jump. It dips and rebounds all on its own, slow and inviting.',
        root: {
            prompt: 'The pet is vibrating with want. Do you set down on the bounce?',
            answers: [
                {
                    choice: 'Land light and let everyone jump',
                    tone: 'good',
                    followUp: {
                        prompt: 'The whole crew is airborne, whooping in the low gravity. How high do you push it?',
                        answers: [
                            {
                                choice: 'Just high enough — laughing, not reckless',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You all touch the top of the arc and come down giggling, again and again, until the ' +
                                        'aches of the road shake clean out of you. Nobody wants to be the one to stop.',
                                    effects: [{ kind: 'resource', heart: 2 }],
                                },
                            },
                            {
                                choice: 'Bounce a flat tool up to a high ledge',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        "You use the rebound to launch a stuck servo loose from the moon's far crag — practical " +
                                        'and a little bit fun. The part comes down right into your waiting hands.',
                                    effects: [{ kind: 'item', grant: 'spring-servo' }],
                                },
                            },
                            {
                                choice: 'Double-bounce the smallest crew member',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The classic cruelty. They go up further than anyone meant, come down wrong, and the ' +
                                        'laughing stops a beat too early. A bruise, an apology, a quiet ride out.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Harvest a few springs for the workshop',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You prise loose a couple of springs from the rim where they will not be missed. Good steel, ' +
                            'good tension — the mat sighs and keeps on bouncing without them.',
                        effects: [{ kind: 'item', grant: 'trampoline-spring' }],
                    },
                },
                {
                    choice: 'Touch down hard to test the springs',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You drop your full weight onto the mat. Three springs snap with a sound like a swear word, and ' +
                            'the bounce goes lopsided and sad. You scrape a strut on the rebound.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-sandbox-planet',
        sector: 'home-reach',
        intro:
            'A whole planet of clean yellow sand, raked smooth, a plastic bucket and spade left mid-castle near the ' +
            'pole. Tiny footprints lead away and stop. The sand is still damp where it was packed.',
        root: {
            prompt: 'Someone was building here, right up until they were not. What do you do?',
            answers: [
                {
                    choice: 'Finish the sandcastle they left',
                    tone: 'good',
                    followUp: {
                        prompt: 'You pack towers, dig a moat, plant the spade as a flag. What do you do with the bucket?',
                        answers: [
                            {
                                choice: 'Leave it on the parapet, waiting for them',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You set the bucket where small hands will find it, and lift off without disturbing ' +
                                        'a single grain. The castle stands behind you, finished, holding the place.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Scoop a bucket of the lucky sand to keep',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A bucket of warm yellow sand rides in the cockpit now. The pet naps in it on the cold ' +
                                        'legs, and it smells, faintly, of a summer no one will admit to remembering.',
                                    effects: [{ kind: 'item', grant: 'lucky-sand' }],
                                },
                            },
                            {
                                choice: 'Stamp it flat — the grey will only take it',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You flatten the lot, telling yourself it is mercy. The footprints that led away seem ' +
                                        'to lead a step closer now, and you do not like what your mercy felt like.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Sift the sand for anything dropped',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            "Under the surface your scoops turn up marbles — actual marbles, a child's buried hoard, " +
                            'cool and bright in your palm. You take half and leave half, because it feels right.',
                        effects: [{ kind: 'resource', marbles: 7 }],
                    },
                },
                {
                    choice: 'Strip-mine it for the glassmaking silica',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Good clean silica, a full hold of it, and a planet left cratered and grey where a castle stood. ' +
                            'The bucket tumbles into one of your pits as you climb away.',
                        effects: [
                            { kind: 'resource', marbles: 8 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'home-kite-comet',
        sector: 'home-reach',
        intro:
            'A diamond kite is snagged on a passing comet, string trailing back into the dark to a spool no hand ' +
            "holds. It flutters and dives in the comet's wind, bright red against all that cold tail.",
        root: {
            prompt: 'The kite tugs and twists like it still wants to fly. How do you free it?',
            answers: [
                {
                    choice: 'Ease in and work the string loose by hand',
                    tone: 'good',
                    followUp: {
                        prompt: "The kite comes free and lifts on your thrusters' wash, alive again. What do you do with it?",
                        answers: [
                            {
                                choice: 'Fly it off your aerial the rest of the run',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You lash the string to the comms mast and the kite rides your wake, a small red flag ' +
                                        'of nonsense streaming behind a serious ship. The crew salutes it every morning.',
                                    effects: [
                                        { kind: 'item', grant: 'red-kite' },
                                        { kind: 'resource', heart: 1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Wind the string for the strong cord',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You reel in a spool of kite line, tougher than it has any right to be — good for ' +
                                        'lashings and tow-jobs. The kite itself you set adrift to find its own thermals.',
                                    effects: [{ kind: 'item', grant: 'kite-line' }],
                                },
                            },
                            {
                                choice: 'Cut it loose to drift off and snag elsewhere',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You snip the string and let it go. It tumbles end over end into the cold, no longer ' +
                                        'flying, just falling, and you watch it until you cannot.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Photograph the impossible red against the tail',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'A kite on a comet — you log the shot for the crew who will not believe you. It is, you think, ' +
                            'the best picture you have taken since the grey came.',
                        effects: [{ kind: 'flag', set: 'photographed-kite-comet' }],
                    },
                },
                {
                    choice: 'Punch through the string at speed to pass',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You take the string across your bow at full burn. It parts with a shriek, fouls a vane on the ' +
                            'way past, and the kite spins away in pieces behind you.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-recess-bell',
        sector: 'home-reach',
        intro:
            'A brass school bell hangs on a rope from a floating archway, ringing itself in long lonely peals across ' +
            'an empty playground-world below — swings still creaking, a hopscotch grid half-faded under the dust.',
        root: {
            prompt: 'The bell calls a recess no children answer. What do you do at the sound of it?',
            answers: [
                {
                    choice: 'Ring it properly and play a round below',
                    tone: 'good',
                    followUp: {
                        prompt: 'Your boots hit the empty playground. The bell falls silent, waiting. Which game do you play?',
                        answers: [
                            {
                                choice: 'Hopscotch the faded grid, both feet, no peeking',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You hop the whole grid clean and the dust lifts off it, the chalk lines blazing bright ' +
                                        'again. Pure play, where the grey hates it most — the front loses its grip a notch.',
                                    effects: [{ kind: 'front', advance: -1 }],
                                },
                            },
                            {
                                choice: 'Push the swings and time them by the bell',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You set every swing arcing in time with the peals. It is a small daft ceremony, and ' +
                                        'when you leave the playground keeps swinging, a little less empty than you found it.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Crack the bell so the lonely peals stop',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You strike the bell until it splits and the ringing dies. The playground goes truly ' +
                                        'silent then, and silent is exactly what the grey was always after.',
                                    effects: [{ kind: 'front', advance: 1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Salvage the heavy brass from the bell',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Fine old brass, worth a fair few marbles to the right buyer. You take it gently, at least, and ' +
                            'leave the rope tied off so the archway does not look quite so bereft.',
                        effects: [{ kind: 'resource', marbles: 6 }],
                    },
                },
                {
                    choice: 'Ignore it — recess is not for you anymore',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You throttle past the ringing without slowing. Somewhere behind you a swing stills, and you tell ' +
                            'yourself you are too old and too late for playgrounds, and almost believe it.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-riderless-bicycle',
        sector: 'home-reach',
        intro:
            "A child's bicycle pedals steadily through space, training wheels spinning, a playing card still clipped " +
            'to the spokes flapping at nothing. The seat is empty. It is keeping to a lane only it can see.',
        root: {
            prompt: 'The little bike rides on with grim cheerful purpose, going somewhere. Do you follow?',
            answers: [
                {
                    choice: 'Pace it gently and see it home',
                    tone: 'good',
                    followUp: {
                        prompt: 'It leads you off the lanes toward a green planet with one lit porch light. How do you approach?',
                        answers: [
                            {
                                choice: 'Land soft and let the bike coast up the path',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The bike rolls up the garden path, leans itself against the porch, and the card stops ' +
                                        'flapping. The light stays on, and a road home you had lost lights up beside it.',
                                    effects: [{ kind: 'openRoute', to: 'home-porch-light' }],
                                },
                            },
                            {
                                choice: 'Take the spoke card as a keepsake first',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You unclip the worn playing card — a jack of hearts, soft at the corners — and let ' +
                                        'the bike go on without its engine-noise. It seems a little quieter for the loss.',
                                    effects: [{ kind: 'item', grant: 'spoke-card' }],
                                },
                            },
                            {
                                choice: 'Tow it back the way you came — wrong direction',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You decide you know better and reel it backward up the lane. The pedals fight you the ' +
                                        'whole way, and when you let go it just sits, lost, no longer sure which way is home.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Scan its course and chart the lane it follows',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Whatever invisible street the bike is riding, you log its heading. A faint old commuter lane, ' +
                            'it turns out, that the grey has not fully scrubbed. Good to know it is still there.',
                        effects: [{ kind: 'flag', set: 'charted-bike-lane' }],
                    },
                },
                {
                    choice: 'Strip the bike for the bearings and bell',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You catch it and take it apart. Good bearings, a working bell — and a small heap of bicycle ' +
                            'that will never reach whatever porch it was pedalling so hard toward.',
                        effects: [
                            { kind: 'item', grant: 'bike-bearings' },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'home-fort-blanket',
        sector: 'home-reach',
        intro:
            'A blanket fort the size of a station drifts ahead, sheets pinned over chair-backs into turrets, a ' +
            '"NO GROWNUPS" sign taped to the front flap. A torch glow flickers inside, and so does something else.',
        root: {
            prompt: 'The fort is occupied — you can see shapes moving by torchlight. How do you go in?',
            answers: [
                {
                    choice: 'Knock on the flap and ask the password',
                    tone: 'good',
                    followUp: {
                        prompt: "A nervy voice asks the password back. You realise the gnomes' counting rhyme might just fit. Try it?",
                        answers: [
                            {
                                choice: "Recite the Gnome King's rhyme you learned",
                                tone: 'good',
                                gate: { kind: 'flag', set: 'gnome-king-rhyme' },
                                outcome: {
                                    resultText:
                                        "The rhyme lands word-perfect and the flap flies open. The fort's keepers — runaway " +
                                        'gnome scouts — adopt you on the spot and press a fistful of marbles and a map-corner on you.',
                                    effects: [
                                        { kind: 'resource', marbles: 12 },
                                        { kind: 'openRoute', to: 'home-gnome-warren' },
                                    ],
                                },
                            },
                            {
                                choice: 'Just say you come in peace, bearing snacks',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'No password, but snacks are a language of their own. They let you sit by the torch a ' +
                                        'while and trade ghost stories, and you leave warmer than you arrived.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Pull rank — you are a grownup, open up',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The sign said NO GROWNUPS and they meant it. The torch snuffs, the fort bristles, and ' +
                                        'a pillow-and-ruler skirmish breaks out across the threshold.',
                                    effects: [{ kind: 'spawnGame', game: 'duel', reason: 'home-fort-defenders' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Leave a parcel of supplies at the flap and go',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You set down rations and a spare torch and pull back to give them their fort. A small hand ' +
                            'darts out, grabs the lot, and a muffled "thank you" follows you into the dark.',
                        effects: [{ kind: 'resource', marbles: -4, heart: 1 }],
                    },
                },
                {
                    choice: 'Disperse the sheets — they are a navigation hazard',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'A burst of thruster wash and the fort comes apart, sheets and chairs tumbling everywhere. The ' +
                            'torchlight scatters with it, and whoever was inside has nowhere to hide from the grey now.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-nightlight-buoy',
        sector: 'home-reach',
        intro:
            "A child's nightlight bobs alone at the edge of Home Reach, a little plastic crescent moon glowing soft " +
            'and steady where the green starts to grey out. It is the last warm light before the dark proper.',
        root: {
            prompt: 'Its tiny bulb holds the dark back about a metre. Past it, the Hush. What do you do here?',
            answers: [
                {
                    choice: 'Top up its battery so it keeps burning',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You trickle it a charge and the crescent brightens, throwing its small comfort a few metres ' +
                            'further into the grey. It is not much. Out here, it is everything, and you leave it lit.',
                        effects: [{ kind: 'front', advance: -1 }],
                    },
                },
                {
                    choice: 'Sit with it a moment before pressing on',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You cut the engines and just float in its soft glow for a while, the way you used to leave the ' +
                            'hall light on. Then you turn the ship to face the dark, and go.',
                        effects: [],
                    },
                },
                {
                    choice: 'Take the bulb — you could use a good lamp',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You pocket the little bulb, and the crescent moon goes dark behind you. The edge of Home Reach ' +
                            'has no warm light at its border now, and the grey leans in to fill the gap.',
                        effects: [
                            { kind: 'item', grant: 'crescent-bulb' },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'home-soapbox-derby-comet',
        sector: 'home-reach',
        intro:
            'A plank-and-pram-wheel soapbox racer is lashed to the nose of a comet, helmet of a saucepan, a hand-' +
            'chalked start line drifting just ahead. A checkered flag on a broom handle waves itself at the far turn.',
        root: {
            prompt: 'The comet is already rolling toward the line, and the racer needs a pilot. Do you take the wheel?',
            answers: [
                {
                    choice: 'Climb in and ride the comet flat-out for the flag',
                    tone: 'good',
                    cost: [{ kind: 'resource', hull: -2 }],
                    followUp: {
                        prompt: 'The racer rattles loose on the comet, wheels screaming, the turn coming up fast. How do you take it?',
                        answers: [
                            {
                                choice: 'Hold the racing line through the apex',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You clip the corner clean and cross under the broom-handle flag at a blur. A grandstand ' +
                                        'of small aliens erupts and rains down the whole derby purse on your dented hull.',
                                    effects: [{ kind: 'resource', marbles: 16 }],
                                },
                            },
                            {
                                choice: 'Brake into the turn and play it steady',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You feather the wheels and slide round wide, finishing a respectable second. The crowd ' +
                                        'claps anyway and a steward counts a modest handful of marbles into your palm.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Stand on it and pray through the corner',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'A wheel shears off mid-turn and the racer cartwheels across the line in pieces. You walk ' +
                                        'away to sympathetic applause and a saucepan ringing on your head.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Flag the race for the crowd from the sidelines',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You take up the broom-handle flag and wave the empty start line with great solemnity. The kids ' +
                            'cheer the ceremony of it, and a couple toss you marbles for being a good sport.',
                        effects: [{ kind: 'resource', marbles: 3 }],
                    },
                },
                {
                    choice: 'Snap the racer up as scrap and roll on',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You beam the little racer into the hold for the wheels and timber. The chalk start line scuffs ' +
                            'out behind you, and the broom-handle flag droops over a race that will not be run.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-pinata-asteroid',
        sector: 'home-reach',
        intro:
            'A papier-mache donkey the size of an asteroid sways on a cable strung between two moons, gaudy and ' +
            'fringed and very obviously stuffed. A bat carved from a fence post floats below, blindfold optional.',
        root: {
            prompt: 'Something rattles richly inside the great paper donkey. Do you take a swing?',
            answers: [
                {
                    choice: 'Charge the hull straight into it, full burn',
                    tone: 'good',
                    cost: [{ kind: 'resource', hull: -1 }],
                    followUp: {
                        prompt: 'You smash clean through the donkey and its belly splits wide. What comes spilling out?',
                        answers: [
                            {
                                choice: 'Scoop the lot before it scatters',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'A flood of marbles and wrapped sweets and a tin of something older — you net the whole ' +
                                        'glittering downpour with the tractor beam before it drifts. The crowd of moons cheers.',
                                    effects: [{ kind: 'resource', marbles: 14 }],
                                },
                            },
                            {
                                choice: 'Let the kids below have first grab, take the rest',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You hold the beam back and let the spill rain on the watching younglings first. They ' +
                                        'leave you a fair share, and a warmth besides, scrambling and shrieking with delight.',
                                    effects: [{ kind: 'resource', marbles: 5, heart: 1 }],
                                },
                            },
                            {
                                choice: 'Just enjoy watching it burst — keep nothing',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You sit back grinning as the candy storm whirls away unclaimed into the dark. A lovely ' +
                                        'sight, and not a single marble to show for the dent you just took.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Take one careful tap with the cargo arm',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You nudge the donkey with the arm and a single seam pops, dribbling a small bright trickle of ' +
                            'marbles into your hold. Modest, undamaged, and the donkey swings on for the next ship.',
                        effects: [{ kind: 'resource', marbles: 4 }],
                    },
                },
                {
                    choice: 'Cut the cable and let it drift off whole',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You sever the line and the great donkey wobbles away unbroken, its rattle fading. Somewhere a ' +
                            'party of small things waits for a piano that will never drop, and the grey eases a step nearer.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-dunk-tank-planet',
        sector: 'home-reach',
        intro:
            'A planet-sized dunk tank turns below, a grinning clown on the drop seat over a sea of warm blue water, ' +
            'a painted target the size of a continent beside it. "3 MARBLES A THROW," reads a banner. "SOAK THE CHUMP."',
        root: {
            prompt: 'The clown jeers up at you, daring a throw. Do you pay in and pitch?',
            answers: [
                {
                    choice: 'Buy a fistful of throws and let fly',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -9 }],
                    followUp: {
                        prompt: 'You have three good rocks and a continent-wide target. The clown stops jeering, watching. How do you throw?',
                        answers: [
                            {
                                choice: 'Wind up and bullseye the dead centre',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Your throw cracks the target square and the clown plunges into the sea with a planetary ' +
                                        'splash. The whole crowd-world roars and showers the prize bucket up into your hold.',
                                    effects: [{ kind: 'resource', marbles: 15 }],
                                },
                            },
                            {
                                choice: 'Settle for grazing the edge of the target',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You clip the rim and the seat half-tips, dropping the clown ankle-deep with an indignant ' +
                                        'squawk. Close enough for a consolation handful of marbles and a soggy bow.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Miss wide and lose your nerve on the last two',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Your first throw sails past the planet entirely and you fluff the rest, rattled. The dry ' +
                                        'clown laughs you off the line, and your marbles stay sunk in the booth.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Pay for a single polite throw',
                    tone: 'neutral',
                    cost: [{ kind: 'resource', marbles: -3 }],
                    outcome: {
                        resultText:
                            'One throw, one cheerful miss, one wave from the dry and delighted clown. You leave a few marbles ' +
                            'lighter and oddly buoyed, the painted target winking in your wake.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Heckle the clown and skip the booth',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You shout that the game is rigged and pull away without paying. The clown blows a long flat ' +
                            'raspberry that follows you halfway across the sector, and you feel weirdly stung by it.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'home-wishing-well-moon',
        sector: 'home-reach',
        intro:
            'A mossy stone wishing well stands on a bare moon, its bucket on a winding crank, the shaft dropping down ' +
            'into a dark that twinkles faintly with coin-light. A weathered sign reads only: "MAKE IT A GOOD ONE."',
        root: {
            prompt: 'The well is patient and very deep, and something down there glints back. What do you do?',
            answers: [
                {
                    choice: 'Toss in a generous wish and crank the bucket up',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -12 }],
                    followUp: {
                        prompt: 'Your marbles vanish into the dark with a long, long fall. The crank stiffens, then turns. What rises in the bucket?',
                        answers: [
                            {
                                choice: 'Haul it all the way to the lip',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The bucket comes up heaped with the wishes of a hundred years — old marbles, bright ' +
                                        'and granted, and a coil of clean route-map the well had been saving for a kind one.',
                                    effects: [
                                        { kind: 'resource', marbles: 16 },
                                        { kind: 'openRoute', to: 'home-well-bottom-road' },
                                    ],
                                },
                            },
                            {
                                choice: 'Take what is in the bucket and call it fair',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The bucket clears the lip half-full, your own marbles riding back up with a modest ' +
                                        'top-up of older ones. Not the jackpot, but the well does not stiff a generous wisher.',
                                    effects: [{ kind: 'resource', marbles: 8 }],
                                },
                            },
                            {
                                choice: 'Crank too hard and snap the rope',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The line parts with a twang and the bucket plummets back into the dark, your wish and ' +
                                        'your marbles with it. The well sighs out a cold draught and goes quiet.',
                                    effects: [],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Drop in a single coin and a small honest wish',
                    tone: 'neutral',
                    cost: [{ kind: 'resource', marbles: -3 }],
                    outcome: {
                        resultText:
                            'One marble, one quiet wish for the family ahead, a soft far-off plink. The well does not pay in ' +
                            'coin, but the crew sleeps a little easier for the wishing of it.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Lower a magnet and fish the bottom clean',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You drag up every coin a century of children ever wished on, a cold haul that rattles wrong in ' +
                            'the hold. The well goes dark and dry, and the grey settles into the empty shaft behind you.',
                        effects: [
                            { kind: 'resource', marbles: 10 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'home-go-kart-track',
        sector: 'home-reach',
        intro:
            'A figure-eight go-kart track loops through a knot of small moons, rubber-burned and bunting-strung, a ' +
            'single battered kart idling at the grid. A gnome in goggles flags you down and revs a thumb at the line.',
        root: {
            prompt: 'The gnome wants a race for pinks, your marbles against the track record. Do you grid up?',
            answers: [
                {
                    choice: 'Ante the entry fee and take the grid',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -8 }],
                    followUp: {
                        prompt: 'Lights out. The kart bites the first bend hard and the figure-eight crossover looms. How do you drive it?',
                        answers: [
                            {
                                choice: 'Late-brake the crossover and steal the lead',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You thread the crossover a hair ahead and never look back, beating the record by a ' +
                                        'whisker. The gnome whistles, pays out the pot in full, and salutes you with both goggles.',
                                    effects: [{ kind: 'resource', marbles: 15 }],
                                },
                            },
                            {
                                choice: 'Hold a clean tidy line and bank the finish',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You drive it neat and unhurried and take the flag a few lengths down, no record but no ' +
                                        'wreck. The gnome returns your stake and a little for the show, and shakes your hand.',
                                    effects: [{ kind: 'resource', marbles: 9 }],
                                },
                            },
                            {
                                choice: 'Send it through the crossover and spin out',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You carry too much speed into the eight, clip the apex, and spin the kart into the hay ' +
                                        'bales. The gnome keeps the entry fee and helps you brush off the straw, grinning.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Take a slow lap just for the feel of it',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You roll the figure-eight at a putter, no fee, no clock, the bunting flapping past. The gnome ' +
                            'shrugs and waves you round for free, and the pet hangs out the side the whole way.',
                        effects: [{ kind: 'resource', heart: 1 }],
                    },
                },
                {
                    choice: 'Tear up the track with the ship for laughs',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You strafe the figure-eight low and churn the surface to gravel under your wash. The gnome hurls ' +
                            'his goggles after you, the lap record now unbeatable because the track is wrecked.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
];
