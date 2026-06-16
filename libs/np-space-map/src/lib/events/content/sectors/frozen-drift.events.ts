import { PlanetEvent } from '../../event.model';

/**
 * Frozen Drift sector pool (`sector: 'frozen-drift'`) — ice worlds and still, glittering space, a
 * register colder and greyer than Home Reach. The throughline is the *terrible quiet*: porcelain
 * statues that only move when unseen (the Porcelain Matron's bound court — GDD §5), glass cities
 * holding their breath, light that has forgotten how to leave. Consequence over punishment per the
 * authoring rules (event-system.md §4); bad branches sting hull/heart/marbles or feed the front, and
 * a couple of leaves resolve at depth 1. See event-system.md §3/§4 and game-design.md §5.
 */
export const frozenDriftEvents: PlanetEvent[] = [
    {
        id: 'frozen-statue-garden',
        sector: 'frozen-drift',
        intro:
            'Down on the ice, a garden of porcelain figures stands mid-gesture — reaching, bowing, ' +
            'one with a hand half-raised in greeting. None of them were facing you a moment ago.',
        root: {
            prompt: 'How do you cross the garden?',
            answers: [
                {
                    choice: 'Keep your eyes on them and back out',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You retreat without blinking, walking backward over the ice until the garden is a ' +
                            'pale smudge on the horizon. Nothing moved — because you never let it. Your nerves are ' +
                            'shot, but the ship is whole.',
                        effects: [{ kind: 'flag', set: 'frozen-watched-the-court' }],
                    },
                },
                {
                    choice: 'Walk through quickly, head down',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'Halfway across, glass scrapes glass behind you. Look?',
                        answers: [
                            {
                                choice: "Don't look — just run for the ship",
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You sprint blind across the last of the ice and slam the hatch, refusing the ' +
                                        'whole way to turn around. Whatever closed the distance, you never gave it a face.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Glance back, just once',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A figure stands an arm-length closer than it has any right to be, smiling its ' +
                                        'fixed smile. You hold its gaze and edge away. It cannot move while watched — but ' +
                                        'you cannot watch all of them.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Stop and stare it down to feel brave',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You plant your feet and lock eyes — until a second figure, the one at your ' +
                                        'shoulder, closes a porcelain hand around your wrist. You wrench free and flee, ' +
                                        'leaving skin and a little hope behind.',
                                    effects: [{ kind: 'resource', heart: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Pry loose a figurine to sell',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'It comes free with a sound like cracking ice, and the whole garden seems, for an instant, ' +
                            'to lean. You make the ship with your prize and a cold certainty that the court will remember ' +
                            'the theft.',
                        effects: [
                            { kind: 'resource', marbles: 6 },
                            { kind: 'flag', set: 'frozen-robbed-the-court' },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-glass-city',
        sector: 'frozen-drift',
        intro:
            'A city of spun glass spreads across the frost, every tower intact, every window lit, every ' +
            'street empty. The lights are on. No one is home, and no one ever left.',
        root: {
            prompt: 'You set down in the silent plaza. What draws you?',
            answers: [
                {
                    choice: 'The archive whose doors stand open',
                    tone: 'good',
                    followUp: {
                        prompt: 'Inside, shelves of glass tablets hum faintly. The hum sharpens as you near one shelf.',
                        answers: [
                            {
                                choice: 'Take the one tablet that is still warm',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It holds a map of the drift the way the city knew it — currents, safe ice, a ' +
                                        'shortcut the front has not yet found. The warmth fades in your hands as you carry ' +
                                        'it out, the last living thing in the archive.',
                                    effects: [
                                        { kind: 'openRoute', to: 'frozen-glass-shortcut' },
                                        { kind: 'resource', marbles: 8 },
                                    ],
                                },
                            },
                            {
                                choice: 'Read a tablet where you stand, touch nothing else',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A child of this city, recording the day the quiet came — how the streets emptied ' +
                                        'between one breath and the next. You leave the tablet on its shelf, but you carry ' +
                                        'the story out with you.',
                                    effects: [{ kind: 'flag', set: 'frozen-read-the-city' }],
                                },
                            },
                            {
                                choice: 'Sweep an armful of tablets into your pack',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'They shatter against each other before you reach the door, glass dust and lost ' +
                                        'voices spilling through your fingers. You leave with cut hands and nothing whole.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'The market stalls, frozen mid-trade',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'Goods sit out on every counter, coins still on the glass. You leave a fair price for a ' +
                            'satchel of trade-marbles and tell yourself the city would have wanted the bargain honoured.',
                        effects: [{ kind: 'resource', marbles: 9 }],
                    },
                },
                {
                    choice: 'Throw a stone to hear the silence break',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The crack runs out through the plaza, up the towers, into the sky — and the whole city sings ' +
                            'one long shattering note before it stills again. You run for the ship as the front, drawn by ' +
                            'the noise, gains a layer behind you.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-weeping-angel',
        sector: 'frozen-drift',
        intro:
            'A single statue stands on the open ice between you and the ship — wings folded, hands over its ' +
            'face, weeping the way carved things weep. It was not there when you landed.',
        root: {
            prompt: 'It will only move when you look away. What do you do?',
            answers: [
                {
                    choice: 'Walk a wide arc, watching it the whole time',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You sidestep around it in a slow, unblinking circle, never letting it leave the corner of ' +
                            'your eye. It stays a statue — frozen mid-weep — and you reach the hatch with your heart ' +
                            'hammering and your skin intact.',
                        effects: [{ kind: 'flag', set: 'frozen-outstared-the-angel' }],
                    },
                },
                {
                    choice: 'Send the robo-pet ahead to keep eyes on it',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'The pet plants itself and stares the angel down so you can cross. Then it must follow you. How?',
                        answers: [
                            {
                                choice: 'Walk backward together, eyes locked on the angel',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You back to the ship in lockstep, two pairs of eyes never leaving the weeping ' +
                                        'thing. It never gains an inch. The pet hops the hatch last, and you are both away ' +
                                        'clean.',
                                    effects: [{ kind: 'resource', marbles: 5 }],
                                },
                            },
                            {
                                choice: 'Call the pet to run — break its watch for a second',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'In the half-second the pet turns to bolt, the angel is suddenly between you and it. ' +
                                        'The pet scrambles past, you both make the ship — but it clipped the little ' +
                                        'machine, and something inside it now ticks wrong.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                            {
                                choice: 'Leave the pet to hold the angel and seal the hatch',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You abandon it on the ice to keep the angel pinned — then cannot leave without it, ' +
                                        'and dash back into the dark to drag it home. You make it. The shame of nearly ' +
                                        'leaving it costs you more than the ice did.',
                                    effects: [{ kind: 'resource', heart: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Blink — surely it is just a statue',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You blink. It is at your shoulder, hands no longer over its face. You blink again and it has ' +
                            'your collar; a third time and you are halfway to nowhere before you wrench your eyes open and ' +
                            'run. You reach the ship, but the angel sent you the long way round.',
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
        id: 'frozen-frozen-fleet',
        sector: 'frozen-drift',
        intro:
            'A whole convoy hangs dead in the glittering black — a dozen ships rimed in frost, drifting in ' +
            'perfect formation, their running lights still patiently blinking to no one.',
        root: {
            prompt: 'How do you approach the frozen fleet?',
            answers: [
                {
                    choice: 'Hail them and wait, in case anyone answers',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You broadcast a slow, patient greeting into the cold and wait the way you would for a ' +
                            'friend. Nothing answers — but as your beam sweeps the lead ship, a frost-locked supply hatch ' +
                            'clicks open in something like thanks.',
                        effects: [
                            { kind: 'resource', marbles: 7 },
                            { kind: 'item', grant: 'frozen-ration-cache' },
                        ],
                    },
                },
                {
                    choice: 'Board the flagship for salvage',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'The corridors are frost and silence, the crew nowhere. A sealed engineering bay holds the prize.',
                        answers: [
                            {
                                choice: 'Take the spare hull plating, leave the rest',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Honest, careful work — you cut free what your ship can use and nothing it cannot. ' +
                                        'The plating still bears the convoy crest. You weld it on with a nod to whoever ' +
                                        'flew her.',
                                    effects: [{ kind: 'resource', hull: 2 }],
                                },
                            },
                            {
                                choice: 'Strip everything that is not bolted down',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You load up until the cargo bay groans — good haul, heavy heart. The frozen fleet ' +
                                        'is a little more hollow for your passing.',
                                    effects: [
                                        { kind: 'resource', marbles: 12 },
                                        { kind: 'resource', heart: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Force the frost-welded reactor door',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The seal was holding back more than cold. Pressure and ice blow the corridor; you ' +
                                        'barely make your own ship before the flagship folds in on itself, and your hull ' +
                                        'takes the parting shrapnel.',
                                    effects: [{ kind: 'resource', hull: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Tractor a ship loose and tow it home for parts',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Your beam locks on — and the whole formation lurches with it, a dozen dead ships swinging like ' +
                            'a single frozen chain. You cut the tow before they crush you, but the strain has wrenched ' +
                            'something in your own drive.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-matron-invitation',
        sector: 'frozen-drift',
        intro:
            'A porcelain courier — gowned, gloved, perfectly still until your back is turned — leaves a frost-' +
            'rimed card on your hull. The Porcelain Matron, it reads, requests the honour of your stillness at court.',
        root: {
            prompt: 'Do you accept the Matron’s invitation?',
            answers: [
                {
                    choice: 'Decline, gracefully, and leave a gift of marbles',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You send the courier back with regrets and a small, bright tribute. The card melts to water in ' +
                            'your hand. Somewhere in the still palace, a door you have not yet found unlocks for the day ' +
                            'you must come.',
                        effects: [
                            { kind: 'resource', marbles: -4 },
                            { kind: 'openRoute', to: 'frozen-matron-court' },
                            { kind: 'flag', set: 'frozen-matron-respected' },
                        ],
                    },
                },
                {
                    choice: 'Send the courier away with no answer',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You hand the card back and seal the hatch. The courier stands on the ice exactly as long as ' +
                            'you watch, and is gone the instant you look away. The court will keep, and so, for now, will ' +
                            'you.',
                        effects: [],
                    },
                },
                {
                    choice: 'Accept and step into the still court alone',
                    tone: 'bad',
                    followUp: {
                        prompt: 'The court is a hall of motionless courtiers. The Matron sits at the far end. She has not blinked.',
                        answers: [
                            {
                                choice: 'Bow, keep your eyes up, and refuse a seat',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You pay your respects without ever sitting, without ever closing your eyes, and ' +
                                        'back out of the hall a guest and not a fixture. The Matron inclines her head a ' +
                                        'fraction. You have her measure now.',
                                    effects: [{ kind: 'flag', set: 'frozen-met-the-matron' }],
                                },
                            },
                            {
                                choice: 'Take the offered chair to be polite',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The moment you sit, the cold of the court starts to set into you like a glaze. You ' +
                                        'lurch up before it finishes and flee the hall, leaving a little warmth behind in ' +
                                        'the chair.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Demand she release whatever she is holding',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The whole court turns to face you between your blinks — closer, then closer still. ' +
                                        'You will not win her hall with words. If you want what she keeps, you will take it ' +
                                        'the only way she respects.',
                                    effects: [
                                        {
                                            kind: 'spawnGame',
                                            game: 'duel',
                                            launch: { reason: 'frozen-matron-affront' },
                                        },
                                        { kind: 'resource', heart: -1 },
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
        id: 'frozen-aurora-pulse',
        sector: 'frozen-drift',
        intro:
            'A slow aurora ripples over the ice cap below — not wind-driven but breathing, in and out, as ' +
            'though the whole frozen world were asleep and dreaming in light.',
        root: {
            prompt: 'The dream-light is reaching the same colour the distortion runs on. What do you do?',
            answers: [
                {
                    choice: 'Skim the upper light to feed the distortion',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You fly your ship slow through the breathing light, drinking the colour into the battery banks. ' +
                            'For a little while, the grey behind you stops gaining. The drift dreams on, none the lighter ' +
                            'for your borrowing.',
                        effects: [{ kind: 'front', advance: -1 }],
                    },
                },
                {
                    choice: 'Drift in it a while and just watch',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You cut the engines and let the aurora wash over the canopy, the first warm thing in this cold ' +
                            'sector. It costs you nothing and gives you nothing but a breath — and out here a breath is ' +
                            'not nothing.',
                        effects: [{ kind: 'flag', set: 'frozen-watched-the-aurora' }],
                    },
                },
                {
                    choice: 'Fire a charge into it to harvest it all at once',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The light flinches like a struck animal and goes out, cap to horizon, dark. You scrape a little ' +
                            'colour from the collapse and a lot of dread. Something that was sleeping down there is awake ' +
                            'now, and the grey rushes into the dark you made.',
                        effects: [
                            { kind: 'resource', marbles: 5 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-doll-orphan',
        sector: 'frozen-drift',
        intro:
            'On a snow-blown step at the edge of a dead settlement sits a single porcelain doll, upright, ' +
            'lap full of frost. Its painted eyes are open. It is the only thing on the planet that is small.',
        root: {
            prompt: 'The doll watches you. What do you do?',
            answers: [
                {
                    choice: 'Sit with it a moment, then leave it where it waits',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You brush the frost from its lap and sit on the cold step until you are sure it is not crying. ' +
                            'It is just a doll. You leave it watching the road, in case whoever set it there ever comes ' +
                            'back. The kindness sits warm in you for the rest of the day.',
                        effects: [{ kind: 'flag', set: 'frozen-sat-with-the-doll' }],
                    },
                },
                {
                    choice: 'Take it aboard so it is not alone',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'On the ship the doll sits where you set it. By the next watch it is facing a different way.',
                        answers: [
                            {
                                choice: 'Set it gently outside the airlock and let it go',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You carry it back out to the cold it came from and set it down facing the stars. ' +
                                        'Whatever rides in a porcelain thing from this sector, it is not yours to keep, and ' +
                                        'you part on kind terms.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Keep it but never let it out of your sight',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It rides on the dash where you can watch it, and it never moves while you look. You ' +
                                        'sleep badly and lose a little of yourself to the watching, but it has, oddly, kept ' +
                                        'worse things at bay.',
                                    effects: [
                                        { kind: 'item', grant: 'frozen-watchful-doll' },
                                        { kind: 'resource', heart: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Lock it in a locker and forget about it',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You shut it away and turn your back. When you open the locker again it is sitting ' +
                                        'on your bunk, and the locker is full of frost. You spend the jump unable to look ' +
                                        'anywhere but over your shoulder.',
                                    effects: [{ kind: 'resource', heart: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Smash it before it can do anything',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'It breaks easily, painted eyes and all, and the cold rushes in where it sat as though something ' +
                            'had been holding it back. You leave quickly. The settlement feels, suddenly, like it is ' +
                            'paying attention.',
                        effects: [{ kind: 'front', advance: 1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-stopped-clocktower',
        sector: 'frozen-drift',
        intro:
            'An ice-locked colony tower rises from the floe, and at its peak a great clock stands stopped — ' +
            'hands frozen at the same minute every other clock in the dead town agrees on.',
        root: {
            prompt: 'The whole place stopped at once. Do you investigate the tower?',
            answers: [
                {
                    choice: 'Climb up and gently wind the great clock by hand',
                    tone: 'good',
                    followUp: {
                        prompt: 'The mechanism is frozen but whole. One hard turn of the key would start it. Wind it?',
                        answers: [
                            {
                                choice: 'Wind it slow and steady until it ticks',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'The clock catches, ticks, and chimes once across the dead town — and for a single ' +
                                        'turn of the minute hand, colour creeps back into the frost. It does not last. But ' +
                                        'the town got one more minute of being alive, and that pushes the grey back a step.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'flag', set: 'frozen-wound-the-tower' },
                                    ],
                                },
                            },
                            {
                                choice: 'Wind it hard to make up the lost time',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You over-wind in your eagerness; a spring lets go with a bang and the hands spin ' +
                                        'wild before stopping again, a minute off from all the rest. The town keeps its ' +
                                        'broken time. You keep a bruise.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Pry the gilded clock-face off for the gold',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You lever the face loose and the whole mechanism sighs and dies for good behind it. ' +
                                        'The gold is real enough, but you have made the stopped town a little more stopped, ' +
                                        'and the grey closes gladly over the gap.',
                                    effects: [
                                        { kind: 'resource', marbles: 14 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Read the last entries in the keeper’s log',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'The clock-keeper wrote until the cold reached the ink: the day the world went quiet, the ' +
                            'neighbours who stopped waving back, the decision to keep the clock running as long as a hand ' +
                            'could turn it. The last line is unfinished. You close the book softly.',
                        effects: [{ kind: 'flag', set: 'frozen-read-the-keeper' }],
                    },
                },
                {
                    choice: 'Leave the dead town to its dead time',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You turn the ship around without setting foot in the tower. Nothing is lost, nothing is gained, ' +
                            'and the stopped clock keeps its stopped minute a little longer, waiting for a hand that is ' +
                            'now not coming.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-distress-beacon',
        sector: 'frozen-drift',
        intro:
            'A distress beacon blinks from a crevasse in the ice, faint and slow. The signal is old — older, ' +
            'maybe, than anyone left alive to have sent it. But it is still calling.',
        root: {
            prompt: 'Do you answer the old beacon?',
            answers: [
                {
                    choice: 'Climb down to the source, prepared for the worst',
                    tone: 'good',
                    followUp: {
                        prompt: 'At the bottom: a sealed survival pod, frost-furred, its life-light a steady, impossible green.',
                        answers: [
                            {
                                choice: 'Carefully thaw and open the pod',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Inside, a long-sleeping traveller wakes blinking into your light, alive against every ' +
                                        'odd. They have nothing to give but a stash they hoarded against this day, and the ' +
                                        'sight of one more living face in the drift.',
                                    effects: [
                                        { kind: 'resource', marbles: 15 },
                                        { kind: 'flag', set: 'frozen-woke-the-sleeper' },
                                    ],
                                },
                            },
                            {
                                choice: 'Crack it open fast before you lose your nerve',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You force the seal and the thaw goes wrong — the pod fogs, the light gutters. You drag ' +
                                        'the sleeper out coughing into the cold; they live, just, but the rush cost them the ' +
                                        'gentle waking they had earned.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Strip the pod of supplies and leave it sealed',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You take the externals and tell yourself the sleeper is past saving. The life-light ' +
                                        'is still green when you climb out. You will not think about that. The supplies do ' +
                                        'not warm you the way you hoped.',
                                    effects: [
                                        { kind: 'resource', marbles: 8 },
                                        { kind: 'resource', heart: -1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Boost and relay the signal onward for someone closer',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You cannot make the descent in time, so you do the next thing — pump the failing beacon full of ' +
                            'power and fling its cry further into the drift, in the hope a nearer ship can answer. You will ' +
                            'never know if one did.',
                        effects: [{ kind: 'flag', set: 'frozen-relayed-the-beacon' }],
                    },
                },
                {
                    choice: 'Mark it a trap and jump away',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You log it as bait and burn for open space. Maybe it was. But the slow green blink stays with ' +
                            'you across the next three jumps, and you keep checking a rescue channel that no one answers.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-mirror-floe',
        sector: 'frozen-drift',
        intro:
            'You set down on a floe of black ice so still and polished it holds the whole starfield — and, ' +
            'standing in it where your reflection should be, a figure that has not yet copied your pose.',
        root: {
            prompt: 'The reflection waits to see what you will do. What do you do?',
            answers: [
                {
                    choice: 'Greet it like a stranger and ask its name',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You crouch and speak gently to the figure in the ice. It mouths a name you almost catch, presses ' +
                            'a hand up flat against yours through the surface, and is content. When you stand, your ' +
                            'reflection is finally just your reflection, and it gives you a parting wink.',
                        effects: [
                            { kind: 'resource', marbles: 6 },
                            { kind: 'flag', set: 'frozen-met-the-mirror' },
                        ],
                    },
                },
                {
                    choice: 'Copy its stillness and wait it out',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You hold as still as it does, two figures frozen on the glass, until your patience outlasts its ' +
                            'curiosity and it settles into mimicking you at last. You leave with nothing but a hard-won ' +
                            'lesson in this sector: stillness is a language here, and you can speak it.',
                        effects: [],
                    },
                },
                {
                    choice: 'Reach down to drag it out of the ice',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Your hand closes on a wrist that is suddenly very real and very cold, and it pulls back twice as ' +
                            'hard. You wrench free in a spray of black ice, leaving it half-out and furious behind you, and ' +
                            'fly off with frost in your veins and a thing now loose on the floe.',
                        effects: [
                            { kind: 'resource', heart: -2 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
];
