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
    {
        id: 'ember-card-sharp',
        sector: 'ember-belt',
        intro:
            'A card sharp works a cinder-station table, dealing from a deck printed on sheets of cooled lava-glass. ' +
            'Each card catches the forge-light and throws it back as a wink. "Sit," he says. "Win something."',
        root: {
            prompt: 'The sharp fans the glass deck and waits. How do you sit down at his table?',
            answers: [
                {
                    choice: 'Play the man, not the cards',
                    tone: 'good',
                    followUp: {
                        prompt: 'You watch his hands instead of the deck. Twice he glances left before a big hand. Use it how?',
                        answers: [
                            {
                                choice: 'Wait for the tell, then bet big',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You let him think he has you, then call the hand his eyes already named. He pays ' +
                                        'out laughing, a man who respects being read more than he loves winning.',
                                    effects: [{ kind: 'resource', marbles: 13 }],
                                },
                            },
                            {
                                choice: 'Play it safe and grind small pots',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You nickel-and-dime him for an hour and leave a little ahead. He tips an imaginary ' +
                                        'hat; you both know nothing real changed hands.',
                                    effects: [{ kind: 'resource', marbles: 4 }],
                                },
                            },
                            {
                                choice: 'Accuse him before you are sure',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You name the glance a cheat too loud and too soon. He folds the deck, the table ' +
                                        'empties, and you leave the cinder-station with nothing but the heat on your face.',
                                    effects: [{ kind: 'flag', set: 'ember-burned-the-table' }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Buy a glass card off him as a souvenir',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You skip the game and buy a single card — the ace, glowing faintly, warm as a held hand. He ' +
                            'sells it gladly; he can print another, and you cannot keep a moment like this otherwise.',
                        effects: [
                            { kind: 'resource', marbles: -3 },
                            { kind: 'item', grant: 'glass-ace' },
                        ],
                    },
                },
                {
                    choice: 'Bet the ship papers on one big hand',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You shove everything onto the felt to feel the heat of it. The river card lands cold and ' +
                            'his, and you buy the papers back at his price — a stupid tax on a stupid thrill.',
                        effects: [{ kind: 'resource', marbles: -12 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-lava-surfer',
        sector: 'ember-belt',
        intro:
            'A lava-surfer rides a heat-shield board across the molten seas of a forge world, trailing sparks ' +
            'and whooping. She carves up alongside your hull. "You fly that thing or just sit in it?" she grins.',
        root: {
            prompt: 'The surfer dares you to run the magma channel with her. What do you say to the dare?',
            answers: [
                {
                    choice: 'Match her run, flying for the joy of it',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You drop into the channel beside her and just fly — no cargo, no front, no family, only the ' +
                            'roar and the laughing. For one bright minute the grey has nothing to take, and it knows it.',
                        effects: [
                            { kind: 'resource', heart: 1 },
                            { kind: 'front', advance: -1 },
                        ],
                    },
                },
                {
                    choice: 'Pace her carefully and learn the channel',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You hang back a length and read the heat-currents off her board, banking your flying knowledge ' +
                            'for later. She calls you cautious. You call it surviving.',
                        effects: [{ kind: 'flag', set: 'ember-knows-magma-currents' }],
                    },
                },
                {
                    choice: 'Show off with a tight pass over the magma',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You dive too low to impress her and the magma kisses your belly plating. She hauls you up by ' +
                            'a tow-line, shaking her head — the joy curdled the second you made it about being watched.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-meteor-foundry',
        sector: 'ember-belt',
        intro:
            'A foundry built into a captured meteor catches falling rock and forges it mid-flight, hammers ' +
            'ringing in the vacuum. The foundry-master leans out a glowing port. "Bring me work or bring me ore."',
        root: {
            prompt: 'The meteor foundry will forge you a part — if you supply the labour or the raw rock. Which?',
            answers: [
                {
                    choice: 'Haul it a fresh meteor and earn the work honestly',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You drag in a fat, ore-heavy rock the foundry can chew on for a week. Delighted, the master ' +
                            'forges you a part of his very best steel and waves the fee — fair trade, well met.',
                        effects: [
                            { kind: 'item', grant: 'meteor-forged-strut' },
                            { kind: 'resource', hull: 1 },
                        ],
                    },
                },
                {
                    choice: 'Lend your tinkerer to dial in the hammers',
                    tone: 'neutral',
                    gate: { kind: 'crew', member: 'grandpa' },
                    outcome: {
                        resultText:
                            'Grandpa squints at the hammer-timing, mutters about lazy calibration, and rebuilds the cadence ' +
                            'over an afternoon. The master pays for the tune-up in a sturdy part and a fistful of marbles.',
                        effects: [
                            { kind: 'item', grant: 'meteor-forged-strut' },
                            { kind: 'resource', marbles: 5 },
                        ],
                    },
                },
                {
                    choice: 'Rush the master to forge it hot and fast',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You badger him into skipping the temper. The part comes out fast and brittle, and it cracks the ' +
                            'first time the hull takes a real strain. You paid for the privilege of doing it twice.',
                        effects: [{ kind: 'resource', marbles: -4, hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-fireworks-barge',
        sector: 'ember-belt',
        intro:
            'A drifting barge packed with festival fireworks signals weakly — its crew long gone, its cargo ' +
            'still live and humming with stored colour. The grey has been nibbling at one corner of the hold.',
        root: {
            prompt: 'The abandoned fireworks barge is half-claimed by the Hush. What do you do with it?',
            answers: [
                {
                    choice: 'Tow it clear and set the whole sky alight',
                    tone: 'good',
                    followUp: {
                        prompt: 'You drag it into open space, finger over the launch key. How do you fire the display?',
                        answers: [
                            {
                                choice: 'Burn it all at once in one mad bloom',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You light the lot. The dark blooms purple and gold and impossible green for a full ' +
                                        'minute, and the front actually recoils from a hold full of pure, useless joy.',
                                    effects: [{ kind: 'front', advance: -1 }],
                                },
                            },
                            {
                                choice: 'Sell the fireworks to the next station',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You ration the colour into crates and trade them down the line. Good marbles for ' +
                                        'someone else to set off. Practical. A little sad, in the quiet after.',
                                    effects: [{ kind: 'resource', marbles: 10 }],
                                },
                            },
                            {
                                choice: 'Pry into the grey-touched corner first',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You poke at the Hush-bitten crates and a string of half-drained rockets cooks off ' +
                                        'wrong, all ash and no colour. The blast rattles your hull and the grey leans in.',
                                    effects: [
                                        { kind: 'resource', hull: -1 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Strip the launch tubes for parts',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You salvage the firing rigs and leave the colour to the grey. Useful hardware, a hold that ' +
                            'still smells faintly of festivals you will not get to.',
                        effects: [{ kind: 'item', grant: 'firework-launch-tube' }],
                    },
                },
                {
                    choice: 'Leave the barge to the Hush',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You log it and pass it by. By the time you look back the colour has gone out of the hold ' +
                            'entirely, one more bright thing the grey ate while you watched.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-coin-flip-toll',
        sector: 'ember-belt',
        intro:
            'A toll-gate spans the only safe gap through a grinding asteroid wall. The keeper, a one-eyed ' +
            'tinker-bot, flips a forge-cast coin in the air. "Heads you pass free," it clicks. "Tails you pay."',
        root: {
            prompt: 'The toll-bot offers a coin flip for passage. How do you take the gamble?',
            answers: [
                {
                    choice: 'Ask to inspect the coin before the flip',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You turn the coin over and feel the weighted rim — tails, every time. The bot freezes, then ' +
                            'clicks something that might be a laugh and waves you through free for catching it.',
                        effects: [{ kind: 'flag', set: 'ember-caught-the-toll' }],
                    },
                },
                {
                    choice: 'Just pay the toll and skip the flip',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You drop the marbles in the slot without playing. The gate grinds open. The bot seems almost ' +
                            'disappointed not to fleece you, but a toll paid is a toll paid.',
                        effects: [{ kind: 'resource', marbles: -4 }],
                    },
                },
                {
                    choice: 'Take the flip and trust the coin',
                    tone: 'bad',
                    followUp: {
                        prompt: 'The coin spins up glinting and comes down tails, of course. The bot extends a hand. Pay up?',
                        answers: [
                            {
                                choice: 'Pay the loss and let it go',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You hand over the toll without a fuss. The bot pockets it and, oddly touched by ' +
                                        'the grace, marks a shortcut on your chart for the trouble.',
                                    effects: [
                                        { kind: 'resource', marbles: -5 },
                                        { kind: 'openRoute', to: 'ember-asteroid-shortcut' },
                                    ],
                                },
                            },
                            {
                                choice: 'Haggle the toll down by half',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You argue the rigged coin entitles you to a discount. The bot considers the logic, ' +
                                        'concedes it, and takes half. A small win dressed up as a loss.',
                                    effects: [{ kind: 'resource', marbles: -2 }],
                                },
                            },
                            {
                                choice: 'Run the gate without paying',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You gun it through the closing gate. The asteroid wall takes its own toll off your ' +
                                        'flank in scrapes, and the bot transmits your heading to the grey out of spite.',
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
        id: 'ember-salamander-pet',
        sector: 'ember-belt',
        intro:
            'A creature-seller hawks a forge-salamander from a heat-lamp cage — a little fire-lizard that ' +
            'curls round a hot coal and purrs sparks. "Lonely up here, traveller?" she asks. "It runs cold engines warm."',
        root: {
            prompt: 'The salamander blinks up at you, its tail-flame guttering. What do you do about the little thing?',
            answers: [
                {
                    choice: 'Take it aboard as ship-pet and friend',
                    tone: 'good',
                    followUp: {
                        prompt: 'It settles by your robo-pet at once, sparks meeting servos. Where do you let it live?',
                        answers: [
                            {
                                choice: 'Let it nest in the cold engine bay',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It coils in the engine bay and runs the whole drive a few degrees warmer, purring. ' +
                                        'Your robo-pet adopts it instantly. The ship feels less empty with two small things in it.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'flag', set: 'ember-salamander-aboard' },
                                    ],
                                },
                            },
                            {
                                choice: 'Keep it caged where it is safe',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You keep it lamp-lit and contained, fed and dim. It survives. It does not sing. You ' +
                                        'tell yourself caution is kindness and almost believe it.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Let it roam the wiring unwatched',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You let it explore and it nests in the wiring loom, chewing through a heat-line ' +
                                        'before you smell the smoke. You love it anyway; the repair still stings.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Buy a season of feed for the cage instead',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You cannot keep it, but you pay for its coal and care so it stays fed and warm here. The ' +
                            'seller nods. The salamander watches you leave with one bright, unbothered eye.',
                        effects: [{ kind: 'resource', marbles: -3 }],
                    },
                },
                {
                    choice: 'Haggle her down by talking the beast cheap',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You run the salamander down to drop the price — sickly, common, half-cooked. It works, and the ' +
                            'creature flinches at every word, and you carry a small mean thing away wrapped in cheap cloth.',
                        effects: [
                            { kind: 'resource', marbles: -1, heart: -1 },
                            { kind: 'item', grant: 'forge-salamander' },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-blacksmith-ghost',
        sector: 'ember-belt',
        intro:
            'A forge-world long gone cold, every fire grey ash — yet one anvil still rings, struck by a smith ' +
            'who is mostly memory now, a flicker of orange in the shape of a worker who would not stop working.',
        root: {
            prompt: 'The ghost-smith hammers nothing on a dead anvil, over and over. How do you meet it?',
            answers: [
                {
                    choice: 'Sit with it and listen to the old work-songs',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You sit on the cold step and let it tell you, in clangs and half-words, about the apprentices ' +
                            'and the orders and the heat. When the song ends the flicker simply goes out, finished, at peace.',
                        effects: [],
                    },
                },
                {
                    choice: "Take a tool from the smith's cold rack",
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You lift a hammer the ghost no longer needs. It does not stop you — perhaps it is glad the ' +
                            'tools will swing again. The grip is still warm where a hand held it for forty years.',
                        effects: [{ kind: 'item', grant: 'ghost-smith-hammer' }],
                    },
                },
                {
                    choice: 'Demand it forge you something before it fades',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You bark an order at the dead like it is a vending machine. The flicker turns, and what little ' +
                            'warmth was left in the forge-world goes out faster — you hurried a thing that wanted only to rest.',
                        effects: [
                            { kind: 'resource', heart: -1 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-demolition-derby',
        sector: 'ember-belt',
        intro:
            'A demolition derby roars inside a hollowed asteroid arena — junk-ships ramming junk-ships for a pot ' +
            'of marbles and the howl of the crowd. A barker waves you toward the starting grid. "Fresh meat! Sign here!"',
        root: {
            prompt: 'The asteroid derby wants your ship on the grid. How do you take the bait?',
            answers: [
                {
                    choice: 'Race clean, win on flying not wrecking',
                    tone: 'good',
                    followUp: {
                        prompt: 'You enter the chaos meaning to dance, not crash. The pack closes in fast. How do you run it?',
                        answers: [
                            {
                                choice: 'Thread the wrecks and never get touched',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You slip every ram and let the bruisers total each other behind you, then coast in ' +
                                        'untouched to take the pot. The crowd hates it and the marbles spend the same.',
                                    effects: [{ kind: 'resource', marbles: 12 }],
                                },
                            },
                            {
                                choice: 'Trade a few hits for a podium finish',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You take some knocks staying in the scrum and finish third — a fair pot for a few ' +
                                        'fresh dents. The hull will forgive you eventually.',
                                    effects: [{ kind: 'resource', marbles: 6, hull: -1 }],
                                },
                            },
                            {
                                choice: 'Pick a grudge match with the favourite',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You single out the crowd favourite and it becomes personal fast. The derby stops ' +
                                        'being a race and becomes a fight, and the arena loves it.',
                                    effects: [
                                        { kind: 'spawnGame', game: 'duel', launch: { reason: 'ember-derby-grudge' } },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Bet on a driver from the stands instead',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You sit it out and back a grizzled veteran in a patched hauler. She survives, you cash a modest ' +
                            'ticket, and your hull stays pristine through the whole glorious mess.',
                        effects: [{ kind: 'resource', marbles: 4 }],
                    },
                },
                {
                    choice: 'Enter the wreckers and ram for the lead',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You go in swinging your prow like a hammer. You win some marbles and lose more hull, and limp ' +
                            'out the gate while the barker cheerfully books you for a rematch you cannot afford.',
                        effects: [{ kind: 'resource', marbles: 5, hull: -2 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-marble-kiln',
        sector: 'ember-belt',
        intro:
            "A magma kiln on a smith-moon casts marbles by the thousand — the sector's mint, where the world's " +
            'currency is literally made. The kilnmaster offers you a turn at the casting trough. "Pour true," she warns.',
        root: {
            prompt: 'The kiln lets you cast your own marbles from molten glass. How steady is your hand?',
            answers: [
                {
                    choice: 'Pour slow and let each bead cool true',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You take your time at the trough and pour a tray of flawless marbles, each one catching light ' +
                            'like a tiny captured sun. The kilnmaster lets you keep the lot for the craft of it.',
                        effects: [{ kind: 'resource', marbles: 10 }],
                    },
                },
                {
                    choice: 'Cast one perfect marble and keep it',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You pour a single marble, slow and deliberate, and pocket it instead of spending it — a small ' +
                            'round thing the colour of a home you are flying to find. It is not currency. It is a promise.',
                        effects: [
                            { kind: 'item', grant: 'kept-marble' },
                            { kind: 'resource', heart: 1 },
                        ],
                    },
                },
                {
                    choice: 'Pour fast to flood the tray and grab more',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You rush the pour, greedy for volume, and the trough overflows in a wave of glass that sets ' +
                            'half the tray bubbling worthless. The kilnmaster sweeps the slag away and you with it.',
                        effects: [{ kind: 'resource', marbles: -3 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-roulette-comet',
        sector: 'ember-belt',
        intro:
            'A comet has been hollowed into a roulette wheel a kilometre wide, its tail the spinning rim, ' +
            'lit pockets streaking through the dark. A casino-warden hails you from the hub. "Place your final bet."',
        root: {
            prompt: 'The roulette comet spins toward its next number. The warden waits for your bet. How do you play it?',
            answers: [
                {
                    choice: "Read the comet's drift yourself and bet the physics",
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You watch the tail slow for three spins, eyeball the arc, and call a pocket on a hunch dressed ' +
                            'as arithmetic. The wheel lands close enough to pay, and the warden settles up grinding his teeth.',
                        effects: [{ kind: 'resource', marbles: 11 }],
                    },
                },
                {
                    choice: 'Let your navigator chart the spin exactly',
                    tone: 'neutral',
                    gate: { kind: 'crew', member: 'mom' },
                    outcome: {
                        resultText:
                            "Mom plots the comet's spin off your charts in her head and names the pocket cold. You bet small " +
                            "and sure, win clean, and best of all she logs the wheel's orbit as a quiet new route home.",
                        effects: [
                            { kind: 'resource', marbles: 6 },
                            { kind: 'openRoute', to: 'ember-comet-orbit-lane' },
                        ],
                    },
                },
                {
                    choice: 'Stake it all on a single lit pocket',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            "You ride one number all the way down. The comet's tail sweeps past your pocket and stops a " +
                            "hair short, the way the house likes it. The warden bows; the marbles are already the comet's.",
                        effects: [{ kind: 'resource', marbles: -10 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-ante-pit',
        sector: 'ember-belt',
        intro:
            'A sunken ante-pit on a smelter-station, ringed by gamblers who bet on which crucible cracks first. ' +
            'The pit-boss, a slag-jawed golem cousin to the Dicekeeper, rakes the pot with a glowing hook.',
        root: {
            prompt: 'The pit-boss waves you to a seat at the crucible-bet. How heavy do you sit down?',
            answers: [
                {
                    choice: 'Ante a fat stack and read the heat-cracks yourself',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -10 }],
                    followUp: {
                        prompt:
                            'Your stack is on the rail and the crucibles glow hotter. One is hairlining early. ' +
                            'How do you call it?',
                        answers: [
                            {
                                choice: 'Bet the hairline crucible and ride it hard',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You called the crack three breaths before it split. The pot lands in your lap ' +
                                        'in a steaming heap and the pit-boss bows like it tastes something sour.',
                                    effects: [{ kind: 'resource', marbles: 16 }],
                                },
                            },
                            {
                                choice: 'Hedge across two likely crucibles',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You spread the stack and one of your picks goes early. A tidy return, nothing ' +
                                        'wild — you walk a little ahead of where you sat down.',
                                    effects: [{ kind: 'resource', marbles: 13 }],
                                },
                            },
                            {
                                choice: 'Chase the long-shot last crucible',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You held for the cold one that never split, and the rake hooks your stack into ' +
                                        "the pot. You leave with a thin handful and the pit-boss's grinding chuckle.",
                                    effects: [{ kind: 'resource', marbles: 2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Lay one careful chip on the safe crucible',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You bet small on the obvious crack and collect small. Nobody at the rail is impressed, ' +
                            'but your stack is intact and your night is calm.',
                        effects: [{ kind: 'resource', marbles: 4 }],
                    },
                },
                {
                    choice: 'Watch the pit and bet nothing at all',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You keep your marbles in your pocket and your nerve to yourself. The pit-boss reads the ' +
                            'cowardice off you and signals the door; you leave learning nothing and earning less.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-slag-plunge',
        sector: 'ember-belt',
        intro:
            'A slag-diving crew has cordoned off a cooling lake of molten waste, betting on who can dredge the ' +
            'most fire-glass before the crust sets. "Heat-shield only gets you so far," their captain warns, grinning.',
        root: {
            prompt: 'The crew dares you to plunge your ship into the slag-lake for the deep glass. Do you dive?',
            answers: [
                {
                    choice: 'Plunge prow-first and dredge the deep seam',
                    tone: 'good',
                    cost: [{ kind: 'resource', hull: -2 }],
                    followUp: {
                        prompt:
                            'The hull screams as it sinks, scoops filling with white-hot glass. The crust is closing ' +
                            'overhead. How long do you stay under?',
                        answers: [
                            {
                                choice: 'Grab a full load and punch out clean',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You break the setting crust at the last second, scoops brimming, prow glowing. ' +
                                        'The diving crew whoops and counts you a champion of the slag-lake.',
                                    effects: [{ kind: 'resource', marbles: 15 }],
                                },
                            },
                            {
                                choice: 'Surface early with a partial scoop',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You pull out cautious and half-full, sloshing glass over the rim as you climb. ' +
                                        'A fair haul for a careful dive; the crew shrugs and toasts you anyway.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                            {
                                choice: 'Stay down for the richest pocket',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The crust seals while you greedily dredge, and you have to blast up through it. ' +
                                        'You surface with a thin take, a cracked scoop, and the heat still in your bones.',
                                    effects: [{ kind: 'resource', marbles: 3, hull: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Skim the cool rim with a tow-net',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You trawl the safe edge of the lake for the glass that floats. A modest catch, no scorch, ' +
                            'and the crew razzes you for fishing instead of diving.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Wave the dare off and watch from above',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You hang back and let the divers risk their hulls. They surface rich and laughing, and ' +
                            'you fly on with nothing but the secondhand thrill of someone else having lived a little.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-molten-auction',
        sector: 'ember-belt',
        intro:
            'A molten-glass auction floats in a forge-bubble: artisan beads, still glowing, sold blind in clay ' +
            'pots so no one sees the colour until they pay. The auctioneer rings a tuning-fork hot off the anvil.',
        root: {
            prompt: 'The blind pots come up one by one, contents unknown. How do you bid the molten auction?',
            answers: [
                {
                    choice: 'Pay big for the pot the artisans whisper about',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -9 }],
                    followUp: {
                        prompt:
                            'The pot is yours. You crack the clay in the forge-light and the glow spills out. What ' +
                            'has the heat made?',
                        answers: [
                            {
                                choice: 'A masterwork bead, flawless and rare',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The bead inside is a once-a-decade pour, colour shifting like a memory you almost ' +
                                        'have. Collectors mob you the moment it catches light, and you sell it for a fortune.',
                                    effects: [{ kind: 'resource', marbles: 16 }],
                                },
                            },
                            {
                                choice: 'A solid, sellable piece of trade-glass',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It is honest work, well-poured and worth its weight. No fortune, but you turn it ' +
                                        'over for a fair return and call the gamble settled.',
                                    effects: [{ kind: 'resource', marbles: 11 }],
                                },
                            },
                            {
                                choice: 'A cracked dud the kiln rejected',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The clay holds a fractured bead that crazes the moment it cools. The artisans were ' +
                                        'whispering a warning, not a wonder. You salvage a few marbles of slag and your pride.',
                                    effects: [{ kind: 'resource', marbles: 1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Bid modestly on a plain, visible lot',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You take the one open pot on the floor — a simple bead, no mystery, no markup. You pay ' +
                            'what it is worth and flip it for the same. A wash, but a safe one.',
                        effects: [{ kind: 'resource', marbles: -2 }],
                    },
                },
                {
                    choice: 'Heckle the prices and bid on nothing',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You call every lot overpriced until the auctioneer rings you out of the bubble. You keep ' +
                            'every marble and miss every bead, which the floor agrees is its own kind of poverty.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-meteor-snatch',
        sector: 'ember-belt',
        intro:
            'Bookmakers run a meteor-catch wager off a forge-platform: a burning rock falls on a timer, and the ' +
            'crowd bets whether anyone is mad enough to net it mid-fall. The odds-bot flashes a fat payout at you.',
        root: {
            prompt: 'The bookmakers want you to catch the falling meteor for the long-odds pot. How do you wager?',
            answers: [
                {
                    choice: 'Ante deep and fly the catch yourself',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -8, hull: -1 }],
                    followUp: {
                        prompt:
                            'You climb to meet the falling rock, hull already singed from the ante-run. The net-field ' +
                            'hums hot. How do you take the meteor?',
                        answers: [
                            {
                                choice: 'Cradle it soft and ride the heat down',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You meet the rock at its own speed and let the net soak the fall. It settles glowing ' +
                                        'in your arms and the long-odds pot avalanches onto your tab — the crowd loses its mind.',
                                    effects: [{ kind: 'resource', marbles: 16 }],
                                },
                            },
                            {
                                choice: 'Snatch it hard and brace for the jolt',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You grab the meteor late and the catch nearly tears the net off its mounts. You ' +
                                        'keep it, barely, and collect a bruised pot with a fresh dent to remember it by.',
                                    effects: [{ kind: 'resource', marbles: 10, hull: -1 }],
                                },
                            },
                            {
                                choice: 'Misjudge the fall and clip it sideways',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You meet the rock at the wrong angle and it skips off the net into the platform. The ' +
                                        'bookmakers void the pot, dock you for the damage, and the grey grins at the wreckage.',
                                    effects: [
                                        { kind: 'resource', hull: -1 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Lay a small bet on the house catcher',
                    tone: 'neutral',
                    gate: { kind: 'crew', member: 'sibling' },
                    outcome: {
                        resultText:
                            'Your sibling eyes the house catcher, picks the steady one, and nudges you to back them. ' +
                            'The pro nets the rock clean and your modest ticket pays out without a single scorch on you.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Bet against the catch out of spite',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You put your marbles on disaster and the crowd jeers you for it. Some hotshot nets the rock ' +
                            'perfectly, the odds-bot eats your stake, and you fly off poorer and meaner than you arrived.',
                        effects: [{ kind: 'resource', marbles: -4 }],
                    },
                },
            ],
        },
    },
    {
        id: 'ember-rigged-wheel',
        sector: 'ember-belt',
        intro:
            'A back-room forge-casino runs a glowing prize-wheel that everyone knows is rigged — that is the draw. ' +
            'The croupier-golem, another of the Dicekeeper\'s kin, slaps the wheel and lets it shed sparks. "Buy a spin?"',
        root: {
            prompt: 'The croupier-golem offers a spin on the rigged wheel. How do you take it on?',
            answers: [
                {
                    choice: 'Buy the maximum spin and play the rig itself',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -12 }],
                    followUp: {
                        prompt:
                            'The wheel screams round, sparks fanning. You can see the loaded pocket dragging it. What ' +
                            'do you do as it slows?',
                        answers: [
                            {
                                choice: 'Bet the loaded pocket and call its bluff',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You play the rig against itself and land exactly where the golem meant the house to. ' +
                                        'The jackpot drum cracks open and you rake out more glass than you can comfortably carry.',
                                    effects: [{ kind: 'resource', marbles: 18 }],
                                },
                            },
                            {
                                choice: 'Demand a fair re-spin when it slows',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You call the rig aloud and the golem, caught, grudgingly re-spins clean. You win a ' +
                                        'middling pocket — less than the jackpot, more than your stake. A small justice, paid out.',
                                    effects: [{ kind: 'resource', marbles: 14 }],
                                },
                            },
                            {
                                choice: 'Grab the wheel and force it where you want',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You clamp the spinning rim to steer it and the golem decides the house is being robbed. ' +
                                        'The back room empties of friendly faces and fills with the hum of a fight about to start.',
                                    effects: [
                                        {
                                            kind: 'spawnGame',
                                            game: 'duel',
                                            launch: { reason: 'ember-rigged-wheel-grab' },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Buy the cheapest token spin and shrug at the odds',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You drop one marble for a courtesy spin, expecting nothing and getting nearly that. The ' +
                            'wheel pays a consolation handful and the golem waves you on, mildly bored.',
                        effects: [{ kind: 'resource', marbles: 2 }],
                    },
                },
                {
                    choice: 'Lecture the floor that the wheel is rigged',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You announce the obvious to a room that came precisely for the rig. The golem flicks a spark ' +
                            'at your boots, the floor laughs, and the bouncer-arms walk you out into the rock-cold dark.',
                        effects: [{ kind: 'flag', set: 'ember-banned-rigged-wheel' }],
                    },
                },
            ],
        },
    },
];
