import { PlanetEvent } from '../../event.model';

/**
 * Ember Belt sector pool (sector 3) — the loud, dangerous middle of the run: asteroid fields, lava
 * worlds, forge-light, and the gambling-with-fire energy of the Dicekeeper's quarter. The grey sits
 * mid-gradient here, so the heat reads as colour bleeding off rather than gone. Per the GDD's
 * consequence-over-punishment rule (§1/§4) the bad leaves cost hull/heart/marbles, feed the front, or
 * spawn a duel/dungeon — never a hard game-over. See event-system.md §3–§4 for the model & authoring
 * rules; mirrors the typed style of zeebo-guide.event.ts.
 */
export const emberBeltEvents: PlanetEvent[] = [
    {
        id: 'ember-forge-bargain',
        sector: 'ember-belt',
        intro:
            'A lava world, its mantle cracked open into a hundred working forges. A soot-black smith ' +
            'looks up from the anvil. "Bring me heat," it rumbles, "and I will bring you steel."',
        root: {
            prompt: 'The smith will reforge your hull plate — for a price paid in risk. How do you bargain?',
            answers: [
                {
                    choice: 'Offer to stoke the great forge yourself',
                    tone: 'good',
                    followUp: {
                        prompt: 'It hands you the bellows. The fire wants more than air. How far do you push it?',
                        answers: [
                            {
                                choice: 'Steady and patient — let the heat build',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The plate comes off the anvil singing, harder than it has ever been. The ' +
                                        'smith grunts approval and waves off any further fee.',
                                    effects: [
                                        { kind: 'resource', hull: 2 },
                                        { kind: 'flag', set: 'ember-smith-ally' },
                                    ],
                                },
                            },
                            {
                                choice: 'Match the forge stroke for stroke',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You work until your arms shake. The plate is good, not great, and the smith ' +
                                        'presses a fistful of slag-marbles into your palm for the effort.',
                                    effects: [{ kind: 'resource', hull: 1, marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Blast it to white-heat fast',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The forge roars past its limit and spits. You jerk back from the splash, but ' +
                                        'not far enough — and the half-worked plate is ruined.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Trade a spare part for the work',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'A fair swap, smith to traveller. Your hull leaves the lava world a little tougher than ' +
                            'it arrived, and the smith a salvage part richer.',
                        effects: [
                            { kind: 'item', take: 'spare-coupling' },
                            { kind: 'resource', hull: 1 },
                        ],
                    },
                },
                {
                    choice: 'Skip the fee and take the plate while it cools',
                    tone: 'bad',
                    followUp: {
                        prompt: 'The smith catches your wrist with a hand like a vice. "Thief," it says, almost sad. Now what?',
                        answers: [
                            {
                                choice: 'Drop the plate and apologise',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You let go and step back, hands open. The smith studies you, then snorts and ' +
                                        'lets you keep the plate anyway. Shame, it seems, is payment enough.',
                                    effects: [{ kind: 'resource', hull: 1 }],
                                },
                            },
                            {
                                choice: 'Wrench free and bolt for the ship',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You tear loose, leaving skin on the anvil, and make the airlock one step ahead ' +
                                        'of a thrown hammer. You keep the plate. You will feel the burn for days.',
                                    effects: [{ kind: 'resource', hull: 1, heart: -1 }],
                                },
                            },
                            {
                                choice: 'Swing the cooling plate at its head',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The smith does not so much as flinch. Tools clatter as every apprentice in the ' +
                                        'forge turns toward the sound of a fight starting.',
                                    effects: [
                                        { kind: 'spawnGame', game: 'duel', launch: { reason: 'ember-smith-theft' } },
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
        id: 'ember-loaded-dice',
        sector: 'ember-belt',
        intro:
            'A gambling den carved into a dead asteroid, lit by molten-glass dice that glow as they roll. ' +
            'The house here answers to the Dicekeeper, and the house always wins.',
        root: {
            prompt: 'The croupier slides three glass dice across the table. Do you play?',
            answers: [
                {
                    choice: 'Watch a few rolls before betting',
                    tone: 'good',
                    followUp: {
                        prompt: 'You spot it — the dice settle a half-beat too long on the house numbers. Loaded. What now?',
                        answers: [
                            {
                                choice: 'Bet against the house pattern',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You play the loading instead of fighting it, and the rigged dice make you rich ' +
                                        'before the croupier can change tables. You cash out fast.',
                                    effects: [{ kind: 'resource', marbles: 16 }],
                                },
                            },
                            {
                                choice: 'Pocket one die for proof',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You palm a die, still warm, on your way out. It is a Dicekeeper original — and ' +
                                        'someone, somewhere, will pay to know how the forge golem cheats.',
                                    effects: [
                                        { kind: 'item', grant: 'loaded-glass-die' },
                                        { kind: 'flag', set: 'knows-dicekeeper-tell' },
                                    ],
                                },
                            },
                            {
                                choice: 'Call the croupier a cheat aloud',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The whole den goes quiet. You are right, and it does not matter — being right at ' +
                                        "the Dicekeeper's table only gets you thrown out into the rock-cold dark.",
                                    effects: [{ kind: 'flag', set: 'banned-ember-den' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Lay down a small, careful bet',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You win a little, lose a little, and leave with a few more marbles than you sat down with. ' +
                            "A clean night, by this asteroid's standards.",
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Go all in to chase a big pot',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The dice glow, roll, and land for the house — of course they do. You walk out lighter, ' +
                            'and a little of your shine goes with the marbles.',
                        effects: [{ kind: 'resource', marbles: -8, heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-magma-tithe',
        sector: 'ember-belt',
        intro:
            'A volcano-priest world: robed silhouettes feed offerings to a roaring caldera. They turn as ' +
            'one and beckon your ship down. "The fire is hungry," they intone. "It is always hungry."',
        root: {
            prompt: 'The priests ask for a tithe to the caldera. What do you give the fire?',
            answers: [
                {
                    choice: 'Offer a song instead of goods',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You give the fire a tune your grandma used to hum. The priests are baffled, then delighted — ' +
                            'no one has offered the caldera play before. They send you off blessed and unburdened.',
                        effects: [
                            { kind: 'resource', heart: 1 },
                            { kind: 'flag', set: 'ember-fire-blessing' },
                        ],
                    },
                },
                {
                    choice: 'Toss in a handful of marbles',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'The marbles vanish into the glow with a hiss. The priests bow; the fire, apparently, is ' +
                            'satisfied. You leave a little poorer and entirely unharmed.',
                        effects: [{ kind: 'resource', marbles: -5 }],
                    },
                },
                {
                    choice: 'Refuse and rev the engines to leave',
                    tone: 'bad',
                    followUp: {
                        prompt: 'The priests step between you and the launch pad. "The fire will be fed," they warn. Push past?',
                        answers: [
                            {
                                choice: 'Reason with them — offer to come back',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You promise a proper tithe on your return. The eldest priest weighs your word, ' +
                                        'then waves you up. A debt remembered is a door left open.',
                                    effects: [{ kind: 'flag', set: 'ember-fire-debt' }],
                                },
                            },
                            {
                                choice: 'Lift off through the offering smoke',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You punch up through the column of heat. The ship makes it, scorched along the ' +
                                        "belly, the priests' chanting fading below.",
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                            {
                                choice: 'Buzz the caldera to scatter them',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'Your wash flings ash and embers across the crater. The fire takes the disrespect ' +
                                        'personally, belching a gout that follows you into the dark — and the grey leans in close.',
                                    effects: [
                                        { kind: 'resource', hull: -1 },
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
        id: 'ember-slag-prospector',
        sector: 'ember-belt',
        intro:
            'A lone prospector drifts in a battered rig at the edge of the asteroid field, sieving slag for ' +
            'ore. She hails you, weary and hopeful at once. "Found a seam," she says. "Too big for one."',
        root: {
            prompt: 'The prospector offers to split a rich ore seam — if you help her crack it. Do you?',
            answers: [
                {
                    choice: 'Partner up and split the haul fairly',
                    tone: 'good',
                    followUp: {
                        prompt: 'The seam runs deep into a tumbling rock. How do you work it?',
                        answers: [
                            {
                                choice: "Take turns, watch each other's backs",
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Two careful hands beat one greedy one. You crack the seam clean, split it down ' +
                                        'the middle, and part as friends. She marks a quiet route on your chart in thanks.',
                                    effects: [
                                        { kind: 'resource', marbles: 12 },
                                        { kind: 'openRoute', to: 'ember-prospector-lane' },
                                    ],
                                },
                            },
                            {
                                choice: "Rush it to beat the field's drift",
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You get most of the ore before the rock spins out of reach. A solid haul, a few ' +
                                        'fresh dents in the hull from working too fast.',
                                    effects: [{ kind: 'resource', marbles: 8, hull: -1 }],
                                },
                            },
                            {
                                choice: 'Blast the seam open with a charge',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The charge does the job and then some — half the ore is dust and the prospector ' +
                                        'is shaking debris off her rig, glaring. You split what is left, badly.',
                                    effects: [{ kind: 'resource', marbles: 3 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Buy her claim outright and work it alone',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'She names a price, you pay it, and she warps off content. The seam is yours — modest, but ' +
                            'all yours, and no shares to argue over.',
                        effects: [
                            { kind: 'resource', marbles: -4 },
                            { kind: 'item', grant: 'ember-ore-cache' },
                        ],
                    },
                },
                {
                    choice: "Jump the claim once she's shown you the seam",
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You wait until she points it out, then warp your guns between her and the rock. She does not ' +
                            'beg — she just looks at you, and warps away, and the look stays with you longer than the ore.',
                        effects: [{ kind: 'resource', marbles: 10, heart: -2 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-runaway-cinder',
        sector: 'ember-belt',
        intro:
            'A planetoid is shedding a coronal tail of burning cinder straight across the shipping lanes, ' +
            'and it is wandering toward inhabited rock. Something has to give.',
        root: {
            prompt: 'The runaway cinder-world is a hazard to half the sector. What do you do about it?',
            answers: [
                {
                    choice: 'Nudge it onto a safe heading with the engines',
                    tone: 'good',
                    followUp: {
                        prompt: 'You brace against it and burn hard. The hull groans. How long do you hold the push?',
                        answers: [
                            {
                                choice: 'Hold exactly long enough — then break off',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The planetoid swings wide of the lanes and the rock beyond. The locals will never ' +
                                        'know how close it came; you will, and that is its own reward.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'flag', set: 'ember-saved-the-lanes' },
                                    ],
                                },
                            },
                            {
                                choice: 'Hold longer to be sure',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You overcook the burn to be safe. The course is clean, the engines are sulking, ' +
                                        'and the hull picked up a long scorch down one flank.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                            {
                                choice: 'Ride it down into the cinder for momentum',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You dip into the burning tail for extra leverage. It works — and it nearly ' +
                                        "doesn't. You break free trailing smoke, the cabin reeking of melted insulation.",
                                    effects: [{ kind: 'resource', hull: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Mine the loose cinder while it burns',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You skim the cooler edges of the tail for fire-glass and rare melt. A tidy haul — and you ' +
                            'tell yourself someone else will deal with the planetoid.',
                        effects: [{ kind: 'resource', marbles: 9 }],
                    },
                },
                {
                    choice: 'Steer well clear and let it wander',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You give the runaway a wide berth. Somewhere behind you, a lane goes dark and a settlement ' +
                            'starts an evacuation you will never hear about. The grey thrives on what no one stops.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-grey-furnace',
        sector: 'ember-belt',
        intro:
            'A foundry-moon, half its forges gone cold and grey, the fire draining out of them tile by tile. ' +
            'A distortion siphon hums at its core, drinking the heat to feed the Hush.',
        root: {
            prompt: 'The siphon is killing the foundry-moon. How do you handle it?',
            answers: [
                {
                    choice: 'Crawl in and break the siphon',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You suit up and go down into the dying forges to tear the siphon out by its roots. It will ' +
                            'be hot, close work in the dark — exactly the kind the grey hopes you will walk away from.',
                        effects: [{ kind: 'spawnGame', game: 'dungeon', launch: { reason: 'ember-sabotage-siphon' } }],
                    },
                },
                {
                    choice: 'Salvage the cold forges while you can',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You strip the dead forges for tools and glass before the grey claims them too. Useful ' +
                            'pickings — and a small, guilty haste in your hands the whole time.',
                        effects: [
                            { kind: 'resource', marbles: 7 },
                            { kind: 'item', grant: 'foundry-tongs' },
                        ],
                    },
                },
                {
                    choice: 'Leave the siphon to its work',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You log the siphon and move on. Behind you the last forge-fires gutter out, and the moon ' +
                            'goes the flat, patient grey of a thing the Hush has finished with.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-stray-droid',
        sector: 'ember-belt',
        intro:
            'A stray foundry-droid clatters out of an asteroid hangar, still half-molten, optics flaring. ' +
            'It has been alone in the heat too long, and it does not know friend from scrap.',
        root: {
            prompt: "The droid plants itself between you and your ship, servos whining. What's your move?",
            answers: [
                {
                    choice: 'Try to calm it and win it over',
                    tone: 'good',
                    followUp: {
                        prompt: 'It tilts its head, uncertain. There is a play protocol buried under all that soot. Reach it how?',
                        answers: [
                            {
                                choice: 'Show it a simple game with your hands',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You play the pat-a-cake your sibling taught you. Something old wakes up behind its ' +
                                        'optics; it copies you, delighted, and ambles off light enough to leave you a gift.',
                                    effects: [
                                        { kind: 'item', grant: 'droid-heat-sink' },
                                        { kind: 'flag', set: 'ember-droid-befriended' },
                                    ],
                                },
                            },
                            {
                                choice: 'Speak slow and back away',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You talk it down word by careful word and edge around it to the airlock. No fight, ' +
                                        'no friend — just two wary things deciding not to make it worse.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Lunge for its core to override it',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'It reads the grab as the attack the heat has been promising it for years. The ' +
                                        'hangar fills with the scream of an old machine deciding to fight.',
                                    effects: [
                                        { kind: 'spawnGame', game: 'duel', launch: { reason: 'ember-stray-droid' } },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Bribe it past with spare marbles',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You roll a handful of marbles down the hangar. The droid clatters after them like a delighted ' +
                            'kid, and you slip aboard while it counts its treasure.',
                        effects: [{ kind: 'resource', marbles: -4 }],
                    },
                },
                {
                    choice: 'Draw on it and shoulder through',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You force the issue with a raised blaster. It gives ground, but not before raking a glowing ' +
                            'gouge down your arm with one flailing claw. You make the ship; the burn comes with you.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-glassblower-twins',
        sector: 'ember-belt',
        intro:
            'On a glass-blowing world, twin artisans work a single shared furnace, bickering in two voices. ' +
            '"You travel," one says. "You will know — whose work is finer? Settle it."',
        root: {
            prompt: 'The twins want you to judge their rival glasswork. How do you call it?',
            answers: [
                {
                    choice: 'Find the genius in each piece',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You praise the fire in one and the patience in the other, and mean every word. The twins, ' +
                            "unused to agreement, share a startled laugh and gift you a piece of the furnace's best.",
                        effects: [
                            { kind: 'item', grant: 'twin-glass-charm' },
                            { kind: 'resource', heart: 1 },
                        ],
                    },
                },
                {
                    choice: 'Decline to pick a winner',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You say it is not your place to choose between siblings. They grumble, but the furnace stays ' +
                            'lit and the door stays open. Some quarrels are not yours to end.',
                        effects: [],
                    },
                },
                {
                    choice: "Crown one and pocket the loser's envy",
                    tone: 'bad',
                    followUp: {
                        prompt: "You name a winner. The slighted twin's face shuts like a furnace door. Press the advantage?",
                        answers: [
                            {
                                choice: 'Soften it — buy a piece from the loser',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        "You spend a few marbles on the slighted twin's best work, and the hurt eases into " +
                                        'something like grace. The furnace warms back up.',
                                    effects: [{ kind: 'resource', marbles: -3 }],
                                },
                            },
                            {
                                choice: "Take the winner's gratitude and go",
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The favoured twin loads you with glass; the other watches you leave with the ' +
                                        'furnace between you. You are richer, and the world a degree colder behind you.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Goad them into wagering against each other',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You whip the rivalry into a bet and rake the pot off the top. The shared furnace ' +
                                        'goes out that night for good, and you feel its going.',
                                    effects: [{ kind: 'resource', marbles: 8, heart: -2 }],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-thief-drone',
        sector: 'ember-belt',
        intro:
            "A Grey Fleet thief drone drops out of an asteroid's shadow, tractor beam already locking onto " +
            'your marble stash. It means to feed your haul to the grey and flee.',
        root: {
            prompt: 'The drone is reeling in your marbles. You have seconds. What do you do?',
            answers: [
                {
                    choice: 'Chase it down to reclaim the stash',
                    tone: 'good',
                    followUp: {
                        prompt: 'You run it into a box canyon of tumbling rock. It powers up to fight. Take it?',
                        answers: [
                            {
                                choice: 'Board it and take it apart',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You clamp on, force the hatch, and gut the drone in the dark. You get your marbles ' +
                                        "back — and the warden's own cargo, stolen from a dozen ships before you.",
                                    effects: [
                                        {
                                            kind: 'spawnGame',
                                            game: 'duel',
                                            launch: { reason: 'ember-thief-drone-board' },
                                        },
                                        { kind: 'resource', marbles: 6 },
                                    ],
                                },
                            },
                            {
                                choice: 'Shoot the tractor emitter and grab what spills',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A lucky shot kills the beam. Your stash scatters across the canyon and you scoop ' +
                                        'up most of it before the drone limps off to report its failure.',
                                    effects: [{ kind: 'resource', marbles: -3 }],
                                },
                            },
                            {
                                choice: 'Ram it before it can power its guns',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You hit it head-on. The drone bursts, your marbles rain into the rock for good, and ' +
                                        'your prow folds inward with a sound you feel in your teeth.',
                                    effects: [{ kind: 'resource', marbles: -8, hull: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Cut the cargo loose and break away clean',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You jettison the stash rather than be dragged, and slip the beam. You lose the marbles but ' +
                            'keep the ship whole and the lead on the drone.',
                        effects: [{ kind: 'resource', marbles: -6 }],
                    },
                },
                {
                    choice: 'Gun the engines and outrun it loaded',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You try to run with the beam still latched. It shears half your stash away mid-burn and ' +
                            'reports your heading before it lets go — and the grey takes a step closer.',
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
        id: 'ember-dicekeeper-shrine',
        sector: 'ember-belt',
        intro:
            'A roadside shrine to the Dicekeeper, lit by a single molten-glass die the size of a fist. ' +
            '"One throw," a recording rasps in the golem\'s ground-stone voice. "The house is generous today."',
        root: {
            prompt: 'The shrine offers a free throw — the house is never generous. How do you treat it?',
            answers: [
                {
                    choice: "Study the die for the Dicekeeper's tell",
                    tone: 'good',
                    gate: { kind: 'flag', set: 'knows-dicekeeper-tell' },
                    outcome: {
                        resultText:
                            'You already know how this golem loads its glass. You read the shrine-die, throw into its bias, ' +
                            "and walk off with a pocket of marbles and a quiet smile at the Dicekeeper's expense.",
                        effects: [
                            { kind: 'resource', marbles: 14 },
                            { kind: 'flag', set: 'ember-beat-the-house' },
                        ],
                    },
                },
                {
                    choice: 'Leave an offering and skip the throw',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            "You set a single marble at the shrine's foot and decline to play. The recording goes quiet, " +
                            'almost respectful. You leave with your shine intact and one fewer marble.',
                        effects: [{ kind: 'resource', marbles: -1 }],
                    },
                },
                {
                    choice: 'Take the free throw and trust your luck',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            "The die rolls, glows, and lands on the golem's mark. The shrine drinks a little of your luck " +
                            'for the road ahead, the way the house always does — generously.',
                        effects: [
                            { kind: 'resource', heart: -1 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
];
