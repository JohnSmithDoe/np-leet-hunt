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
                                            reason: 'frozen-matron-affront',
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
    {
        id: 'frozen-frozen-waterfall',
        sector: 'frozen-drift',
        intro:
            'A whole waterfall hangs off the cliff mid-fall, caught between one instant and the next — a wall ' +
            'of glass spray frozen in the act of crashing, with the roar still trapped somewhere inside it.',
        root: {
            prompt: 'You hover at the frozen falls. What do you do?',
            answers: [
                {
                    choice: 'Press your palm to the ice and listen for the roar',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'Through your glove you feel it — the river still trying to fall, the whole roar held under ' +
                            'glass like a held breath. You leave without taking a single shard, and the warmth of having ' +
                            'heard it stays with you.',
                        effects: [{ kind: 'flag', set: 'frozen-heard-the-falls' }],
                    },
                },
                {
                    choice: 'Chip a few clear shards to trade as curios',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You knock loose a handful of frozen droplets, each one a tiny suspended splash. They will fetch ' +
                            'a fair price as oddities, and the falls hang on undiminished, missing only the spray you ' +
                            'pocketed.',
                        effects: [{ kind: 'resource', marbles: 7 }],
                    },
                },
                {
                    choice: 'Blast the falls to free the river underneath',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The ice lets go all at once, and a winter of water comes down on you — the trapped roar finally ' +
                            'loosed, deafening, furious. You claw clear with a cracked hull and the falls freeze again above ' +
                            'you as if nothing was ever owed.',
                        effects: [{ kind: 'resource', hull: -2 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-comet-rink',
        sector: 'frozen-drift',
        intro:
            'A comet has flattened into a glittering disc of glass-smooth ice, and across it old skate-tracks ' +
            'loop and figure-eight — fresh, frost-edged, leading from nowhere to nowhere.',
        root: {
            prompt: 'The tracks beg to be followed. What do you do?',
            answers: [
                {
                    choice: 'Lace on and skate the old loops yourself',
                    tone: 'good',
                    followUp: {
                        prompt: 'You find a single skate frozen to the ice where the tracks begin. The other is somewhere out there.',
                        answers: [
                            {
                                choice: 'Skate the figure-eights until you find the second skate',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You trace every loop the way they were cut, and at the heart of the last eight the ' +
                                        'matching skate waits, and with it a small joy the skater left behind — proof someone ' +
                                        'played here once. Play is the one thing the grey can not take, and it shows you a way ' +
                                        'on.',
                                    effects: [
                                        { kind: 'openRoute', to: 'frozen-skater-trail' },
                                        { kind: 'resource', heart: 1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Cut your own fresh loops over the top of theirs',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You skate hard and happy until your legs burn, your tracks crossing the old ones in a ' +
                                        'tangle. It felt good — but you have lost the thread of where the first skater was ' +
                                        'going, and that is gone for keeps now.',
                                    effects: [{ kind: 'resource', heart: 1 }],
                                },
                            },
                            {
                                choice: 'Skate full-tilt for the far edge to feel the speed',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You misjudge the comet edge in the dark and go over it into open space, snatching at ' +
                                        'the ship line with frost-numb hands. You make it back aboard, shaking, having learned ' +
                                        'this rink has no boards and no mercy.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Photograph the tracks and leave the rink untouched',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You log the loops carefully and lift off, leaving the only marks on the comet exactly as you ' +
                            'found them. A record of someone’s play, kept safe, for whatever that is worth out here.',
                        effects: [{ kind: 'flag', set: 'frozen-logged-the-rink' }],
                    },
                },
                {
                    choice: 'Land the ship on the rink to refuel from the ice',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Your landing struts shear the old tracks to slush and crack the comet from edge to edge. You get ' +
                            'your water, but the rink will never hold a skate again, and somehow that costs you more than the ' +
                            'ice was worth.',
                        effects: [{ kind: 'resource', heart: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-ice-hermit',
        sector: 'frozen-drift',
        intro:
            'A lone figure sits on a stool over a hole cut in the floe, line in the water, back to the whole ' +
            'frozen sky. They have, it seems, been ice-fishing here long enough to forget there are no fish.',
        root: {
            prompt: 'The hermit does not turn around. What do you do?',
            answers: [
                {
                    choice: 'Sit down on the ice beside them and wait',
                    tone: 'good',
                    followUp: {
                        prompt: 'After a long silence the hermit speaks: “Caught nothing in years. But I keep a place warm. Tea?”',
                        answers: [
                            {
                                choice: 'Accept the tea and let your grandmother brew the next pot',
                                tone: 'good',
                                gate: { kind: 'crew', member: 'grandma' },
                                outcome: {
                                    resultText:
                                        'Grandma takes over the little stove and makes something that actually tastes of home, ' +
                                        'and the hermit weeps without knowing why. You all sit warm a while. You leave full, ' +
                                        'mended a little, with a jar of the good leaves for the road.',
                                    effects: [
                                        { kind: 'resource', heart: 2 },
                                        { kind: 'item', grant: 'frozen-warm-tea-leaves' },
                                    ],
                                },
                            },
                            {
                                choice: 'Accept the tea and trade stories of the road',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'The tea is thin and the stories thinner, but you part as something near friends. The ' +
                                        'hermit presses a few cold marbles on you, all they have, for the company.',
                                    effects: [{ kind: 'resource', marbles: 4 }],
                                },
                            },
                            {
                                choice: 'Tell them there are no fish and they should leave',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You say it kindly and it lands cruelly. The hermit reels in their empty line, packs ' +
                                        'the stool, and walks off into the white without the tea, without a word. You watch ' +
                                        'them go and wish you had let them keep the hole and the hope.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Leave a parcel of supplies and slip away quietly',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You set down food and a heat-cell within arm’s reach and lift off before they notice, so they ' +
                            'need not perform gratitude. The line never twitches. Some kindnesses are best left unwitnessed.',
                        effects: [
                            { kind: 'resource', marbles: -3 },
                            { kind: 'flag', set: 'frozen-fed-the-hermit' },
                        ],
                    },
                },
                {
                    choice: 'Snatch the catch from their bucket while they fish',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The bucket holds only frozen river-water and a child’s lost mitten, kept like treasure. You take ' +
                            'it before you understand what it is, and put it back with shaking hands, but the hermit has ' +
                            'already gone still as the statues, watching the place you stood.',
                        effects: [{ kind: 'resource', heart: -2 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-snow-globe',
        sector: 'frozen-drift',
        intro:
            'A tiny world floats inside a perfect dome of clear ice — one toy town under one toy sky, snow ' +
            'forever falling, small lights forever lit in small windows. It is no bigger than your ship.',
        root: {
            prompt: 'The snow-globe world turns slowly before you. What do you do?',
            answers: [
                {
                    choice: 'Tip it gently to set the snow falling and watch',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You give the dome the softest push and a whole tiny winter swirls up inside — and in the swirl ' +
                            'you swear the little figures look up, delighted, at the snow. You set it spinning slow and leave ' +
                            'it to its falling forever. Some things are perfect because no one touches them.',
                        effects: [{ kind: 'flag', set: 'frozen-shook-the-globe' }],
                    },
                },
                {
                    choice: 'Tow it carefully home as a wonder to keep',
                    tone: 'neutral',
                    followUp: {
                        prompt: 'In the tractor field the dome chimes a high, thin note of strain. Hold the field, or let go?',
                        answers: [
                            {
                                choice: 'Ease off and let it drift back to where it floated',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You release it before the chime becomes a crack and watch it settle back into its ' +
                                        'orbit, whole. You go without your wonder, but the little town goes on snowing, and ' +
                                        'that is its own kind of keeping.',
                                    effects: [{ kind: 'flag', set: 'frozen-spared-the-globe' }],
                                },
                            },
                            {
                                choice: 'Cushion it in the cargo bay and creep home slow',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You pad it in everything soft you own and nurse it aboard at a crawl. It survives, ' +
                                        'mostly — one tiny crack now lets a single flake escape each day. You will spend the ' +
                                        'rest of the voyage counting them out.',
                                    effects: [{ kind: 'item', grant: 'frozen-cracked-snow-globe' }],
                                },
                            },
                            {
                                choice: 'Crank the field harder to muscle it free',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The dome shatters in the beam and the little world breathes out — snow, lights, and a ' +
                                        'town’s worth of forever, gone to glittering dust across your canopy. You fly on through ' +
                                        'a fading snow that was a whole place a moment ago.',
                                    effects: [
                                        { kind: 'resource', heart: -2 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Crack the dome to scavenge the lights inside',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You break the sky open and pluck out the little lamps, still warm, still lit. They are worth ' +
                            'something. The town goes dark behind you under snow that no longer falls, and the grey leans in ' +
                            'where the lights were.',
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
        id: 'frozen-frostbit-greenhouse',
        sector: 'frozen-drift',
        intro:
            'A dome of cracked glass on the ice still tries to be a garden — rows of flowers caught at full ' +
            'bloom in a sheath of frost, colour locked under ice the moment the warmth ran out.',
        root: {
            prompt: 'The frozen garden holds the last colour for a hundred light-years. What do you do?',
            answers: [
                {
                    choice: 'Coax one bloom back to life with the ship’s heat',
                    tone: 'good',
                    followUp: {
                        prompt: 'You thread a heat-line to a single frozen rose. The frost on it begins, very slowly, to bead.',
                        answers: [
                            {
                                choice: 'Let your father tune the line to a gardener’s warmth',
                                tone: 'good',
                                gate: { kind: 'crew', member: 'dad' },
                                outcome: {
                                    resultText:
                                        'Dad nurses the heat down to almost nothing, the way you warm a cold engine, and the ' +
                                        'rose opens — one living red thing in all that frost. You cut it for the cockpit, and ' +
                                        'it does not wilt. A scrap of colour, carried up the channel against the grey.',
                                    effects: [
                                        { kind: 'item', grant: 'frozen-living-rose' },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Warm it fast so it blooms before the front comes',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'It opens too quick and too far, blazes one brilliant second, and drops every petal at ' +
                                        'once. You hold a bare stem and a memory of red. Better, maybe, than leaving it frozen ' +
                                        'shut — but only just.',
                                    effects: [{ kind: 'flag', set: 'frozen-bloomed-the-rose' }],
                                },
                            },
                            {
                                choice: 'Run the heat hot to thaw the whole row at once',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The blast thaws the row to mush and overloads your heat-line in a shower of sparks. ' +
                                        'Nothing blooms; everything rots; and your ship limps off a little wounded, the garden ' +
                                        'now just a black smear under glass.',
                                    effects: [{ kind: 'resource', hull: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Gather frozen seed-pods to plant somewhere warmer',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You collect a pouch of seeds still good under their frost, tucking them away for a world that ' +
                            'might one day have a spring again. They weigh almost nothing. You carry them like a promise you ' +
                            'are not sure you can keep.',
                        effects: [{ kind: 'item', grant: 'frozen-seed-pouch' }],
                    },
                },
                {
                    choice: 'Smash the glass to grab the rarest bloom whole',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The dome implodes in the cold and the whole garden shatters to coloured ice in the same breath — ' +
                            'a hundred years of bloom gone to glitter, the rare one with it. You leave with cut hands and the ' +
                            'colour bleeding out of the place behind you.',
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
        id: 'frozen-lighthouse-keeper',
        sector: 'frozen-drift',
        intro:
            'An ice-rimed lighthouse stands on a black reef of frozen wrecks, its great lamp still sweeping ' +
            'the dark — and in the glass room at the top, a keeper, frost on their shoulders, still standing watch.',
        root: {
            prompt: 'The lamp turns. The keeper does not. What do you do?',
            answers: [
                {
                    choice: 'Climb up to keep the watch with them',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You stand the watch beside the frozen keeper through one full sweep of the lamp, and in the ' +
                            'turning light you understand: they kept the beacon lit so the next ship would not wreck on the ' +
                            'reef they did. You trim the lamp before you go. It will burn a while longer now.',
                        effects: [{ kind: 'flag', set: 'frozen-stood-the-watch' }],
                    },
                },
                {
                    choice: 'Chart the reef of wrecks the lamp has been warning of',
                    tone: 'neutral',
                    gate: { kind: 'crew', member: 'mom' },
                    outcome: {
                        resultText:
                            'Mom reads the lamp’s sweep like a sentence and maps every black wreck on the reef, turning the ' +
                            'keeper’s long warning into a safe lane through the drift. The keeper, you like to think, would be ' +
                            'glad the watch finally caught something.',
                        effects: [{ kind: 'openRoute', to: 'frozen-reef-lane' }],
                    },
                },
                {
                    choice: 'Take the great lamp’s lens for the colour it throws',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You pry the lens free and the lighthouse goes dark behind you for the first time in who knows how ' +
                            'long. The lens is worth a fortune in light. The reef of wrecks, unwarned, will be worth more in ' +
                            'ships before long, and the grey loves an unlit shore.',
                        effects: [
                            { kind: 'resource', marbles: 13 },
                            { kind: 'front', advance: 1 },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-iceberg-armada',
        sector: 'frozen-drift',
        intro:
            'A fleet of icebergs sails the void in eerie formation, and frozen inside the largest, dim behind ' +
            'fathoms of blue ice, are the masts and hulls of actual ships — a harbour that drifted away whole.',
        root: {
            prompt: 'The frozen harbour glides past in silence. What do you do?',
            answers: [
                {
                    choice: 'Map the formation to learn where the harbour is bound',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You pace the armada for a day and read its slow current: it is drifting, impossibly, back the way ' +
                            'the families were taken — toward the front, against all sense, going home. You log the heading. ' +
                            'Someday it might mean something.',
                        effects: [
                            { kind: 'openRoute', to: 'frozen-armada-heading' },
                            { kind: 'flag', set: 'frozen-charted-the-armada' },
                        ],
                    },
                },
                {
                    choice: 'Mine a low berg for fresh water and clean ice',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You carve a clean cargo of ice from an empty berg at the edge of the fleet, careful to take none ' +
                            'with a ship inside it. The water runs sweet in your tanks, and the armada sails on one berg ' +
                            'lighter, none the wiser.',
                        effects: [{ kind: 'resource', marbles: 6 }],
                    },
                },
                {
                    choice: 'Cut into the great berg to reach the trapped ships',
                    tone: 'bad',
                    followUp: {
                        prompt:
                            'Your cutter bites blue ice — and from deep inside the berg, something that was frozen with the ' +
                            'fleet stirs toward the warmth of your beam.',
                        answers: [
                            {
                                choice: 'Kill the cutter and back away before it surfaces',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You cut the beam and drift back into the dark, and the stirring in the ice goes still ' +
                                        'again, sinking back to whatever sleep it kept with the drowned harbour. You leave the ' +
                                        'berg sealed and your nerves frayed.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                            {
                                choice: 'Grab the nearest salvage and run for it',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You snatch a crate of frozen cargo through the gap and gun the engines as the ice ' +
                                        'behind it groans. You get clear with your prize and the cold sense that you woke ' +
                                        'something that will remember being woken.',
                                    effects: [
                                        { kind: 'resource', marbles: 8 },
                                        { kind: 'flag', set: 'frozen-woke-the-berg' },
                                    ],
                                },
                            },
                            {
                                choice: 'Cut deeper toward it, drawn to see its face',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You widen the breach and it comes through — a drowned harbour-thing, all frost and ' +
                                        'reaching, that will not let you leave with its cargo unanswered. There is no talking ' +
                                        'to it now. Only the fight.',
                                    effects: [
                                        {
                                            kind: 'spawnGame',
                                            game: 'duel',
                                            reason: 'frozen-armada-thing',
                                        },
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
        id: 'frozen-held-breath-field',
        sector: 'frozen-drift',
        intro:
            'You drift into a field of small white clouds that do not move — clouds the exact shape of breath ' +
            'on a cold morning, each one frozen the instant it was exhaled, hanging in the dark with no mouths near.',
        root: {
            prompt: 'A whole crowd breathed here once, all at once, and the breath stayed. What do you do?',
            answers: [
                {
                    choice: 'Fly through slowly, breathing with them',
                    tone: 'good',
                    outcome: {
                        resultText:
                            'You match your own breath to the frozen ones and slip through the field, one more exhalation ' +
                            'among the lost. Nothing is gained that a meter could measure. But you leave the field feeling ' +
                            'less alone in the cold than you went in.',
                        effects: [],
                    },
                },
                {
                    choice: 'Sample one frozen breath into a stasis flask',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You ease a single white wisp into a chilled flask — the last breath of someone, kept. It is ' +
                            'worth something to a collector and worth more than that to you, and you are not sure you will ' +
                            'ever be able to sell it.',
                        effects: [{ kind: 'item', grant: 'frozen-last-breath' }],
                    },
                },
                {
                    choice: 'Burn through the field to clear a faster lane',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'Your engines scatter the frozen breaths to nothing in a single hot pass — a crowd’s last morning ' +
                            'gone in your wake. You save a few minutes. You do not feel them as a saving. The grey slides ' +
                            'into the empty space you cleared.',
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
        id: 'frozen-music-box',
        sector: 'frozen-drift',
        intro:
            'Adrift in the still black turns a music box carved from a single block of ice — comb, cylinder, ' +
            'tiny dancer and all — its mechanism so cold it has slowed to one note every long, long minute.',
        root: {
            prompt: 'The ice box plays its slow, slow song to no one. What do you do?',
            answers: [
                {
                    choice: 'Warm it just enough to hear the whole tune',
                    tone: 'good',
                    followUp: {
                        prompt: 'As it warms, the tune speeds toward something you half-know — a lullaby, maybe, from before the grey.',
                        answers: [
                            {
                                choice: 'Hold the warmth steady and let the song finish',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'It plays the lullaby through, the ice dancer turning, and for the length of one small ' +
                                        'song the cold sector feels like a nursery instead of a tomb. You hum it under your ' +
                                        'breath for days. Play is the one thing the grey can not take, and you have taken it ' +
                                        'back a little.',
                                    effects: [
                                        { kind: 'resource', heart: 1 },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Record the tune and let the box cool again',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You capture the lullaby to your log and ease the box back to its slow frozen sleep, ' +
                                        'one note a minute. You have the song now, even if you had to stop it playing to keep ' +
                                        'it.',
                                    effects: [{ kind: 'flag', set: 'frozen-recorded-the-lullaby' }],
                                },
                            },
                            {
                                choice: 'Wind it faster to hear it all before it melts',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You over-warm it and the ice comb snaps mid-phrase, the dancer toppling, the tune cut ' +
                                        'off forever one note from its end. You will never know how the lullaby finished, and ' +
                                        'that unfinished note follows you out.',
                                    effects: [{ kind: 'resource', heart: -1 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Leave it turning and just listen to one slow note',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You cut your engines and wait out one whole minute for the single note it owes the dark. It comes ' +
                            '— low, clear, lovely — and you fly on having heard exactly one note of a song you will never hear ' +
                            'the rest of. It is enough.',
                        effects: [{ kind: 'flag', set: 'frozen-heard-one-note' }],
                    },
                },
                {
                    choice: 'Crack it open for the gilded mechanism inside',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You break the ice for the little gold comb and cylinder, and they are worth real marbles — but the ' +
                            'song dies in your hands with a last flat clunk, and the silence afterward is colder than the ice ' +
                            'ever was.',
                        effects: [{ kind: 'resource', marbles: 10 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-glacier-tomb',
        sector: 'frozen-drift',
        intro:
            'A glacier the size of a moon hangs in the void, and pressed flat in its deep blue heart, perfectly ' +
            'preserved, is a single small thing — too far down to make out, too clearly there to ignore.',
        root: {
            prompt: 'Something is kept in the glacier’s heart. Do you go down for it?',
            answers: [
                {
                    choice: 'Cut a careful shaft down to whatever it is',
                    tone: 'good',
                    followUp: {
                        prompt: 'Two hundred metres down, your lamp finds it: a child’s toy ship, painted, exactly the make of yours.',
                        answers: [
                            {
                                choice: 'Free it gently and carry it back up to the light',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You thaw it loose and cradle it up the shaft — a toy ship like the one that became ' +
                                        'yours, kept by the ice against all the years. Some other kid flew this once, and ' +
                                        'played, and the grey did not get the playing. You set it on your dash beside the ' +
                                        'controls.',
                                    effects: [
                                        { kind: 'item', grant: 'frozen-twin-toy-ship' },
                                        { kind: 'resource', heart: 1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Leave it where it lies and seal the shaft behind you',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You decide some things are kept better than taken, and pack the shaft with snow so the ' +
                                        'toy ship sleeps on undisturbed in the blue. You climb out empty-handed and oddly at ' +
                                        'peace. The glacier will mind it longer than you could.',
                                    effects: [],
                                },
                            },
                            {
                                choice: 'Blast the last ice away to grab it quickly',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The charge shatters the toy ship along with the ice — paint and timber and a stranger’s ' +
                                        'whole childhood, gone in your haste. You climb out with splinters and a hollow you can ' +
                                        'not name, and the cold follows you up the shaft.',
                                    effects: [
                                        { kind: 'resource', heart: -2 },
                                        { kind: 'front', advance: 1 },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Send the robo-pet down on a tether to scout it',
                    tone: 'neutral',
                    gate: { kind: 'petClass', atLeast: 2 },
                    outcome: {
                        resultText:
                            'Your upgraded pet drops into the blue dark and sends back clean images of what waits below — a ' +
                            'child’s toy ship, a twin to yours — then climbs out chirping. You know now what the glacier keeps, ' +
                            'and you can choose when to come back for it.',
                        effects: [{ kind: 'openRoute', to: 'frozen-glacier-heart' }],
                    },
                },
                {
                    choice: 'Strip-mine the glacier’s surface for cheap, fast ice',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You rake the surface for quick water and never look at the heart at all. The tanks fill; the ' +
                            'glacier groans and calves a wall of ice into your flank as it settles, and you limp away with a ' +
                            'dented hull and a thing left unseen below.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-vault-of-thaw',
        sector: 'frozen-drift',
        intro:
            'A bank vault stands alone on the floe, blast-door ajar by a hand’s width, the cold inside it so ' +
            'absolute it has frosted the air solid in the gap. Something behind the door catches the light and ' +
            'will not let go of it.',
        root: {
            prompt: 'The door is frozen mid-swing. How do you open it?',
            answers: [
                {
                    choice: 'Pour marbles’ worth of heat-charges to thaw it open clean',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -8 }],
                    followUp: {
                        prompt: 'The seal sighs and gives. Cold rolls out, and beyond it the strongroom waits with its hoard.',
                        answers: [
                            {
                                choice: 'Take only the deed-box left out on the counter',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'Inside the box is a clear title to a safe berth on the far side of the drift, signed ' +
                                        'and never claimed. The owner is a hundred winters gone. You take the berth they never ' +
                                        'reached, and a fat purse besides.',
                                    effects: [
                                        { kind: 'openRoute', to: 'frozen-claimed-berth' },
                                        { kind: 'resource', marbles: 16 },
                                    ],
                                },
                            },
                            {
                                choice: 'Sweep the open shelf of loose marbles into your pack',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'A respectable scoop of cold currency, no more than the thaw cost and a little over. You ' +
                                        'break even on the gamble and come away with the story of a vault that kept its secrets ' +
                                        'longer than its owners.',
                                    effects: [{ kind: 'resource', marbles: 11 }],
                                },
                            },
                            {
                                choice: 'Force the inner safe behind the counter for the big haul',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The inner safe was a decoy rigged to seize — it clamps shut on your tools and the ' +
                                        'refrozen door nearly takes your arm. You wrench loose with a couple of stray coins and ' +
                                        'a cracked plate, the thaw-charges spent for almost nothing.',
                                    effects: [{ kind: 'resource', hull: -1, marbles: 3 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Slip a thin probe through the gap and skim what you can reach',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'No fortune spent, no fortune found — the probe hooks a single coin off the lip of the gap and ' +
                            'comes back rimed in frost. The vault keeps the rest, and you keep your charges.',
                        effects: [{ kind: 'resource', marbles: 4 }],
                    },
                },
                {
                    choice: 'Leave the frozen vault to guard whatever it is guarding',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You lift off without testing the cold. Probably wise. But the catch of light behind that door ' +
                            'follows you for three jumps, and you will always wonder what the drift was keeping safe.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-geyser-gamble',
        sector: 'frozen-drift',
        intro:
            'A frozen geyser rises from the ice like a glass tree, branch on branch of suspended spray — and ' +
            'deep in its trunk, a slow blue glow pulses, warm enough that the ice around it weeps. Heat, down ' +
            'here, where there should be none.',
        root: {
            prompt: 'The geyser could blow if it thaws. Do you tap the warmth inside?',
            answers: [
                {
                    choice: 'Vent hull heat into the trunk to coax the glow up gently',
                    tone: 'good',
                    cost: [{ kind: 'resource', hull: -1 }],
                    followUp: {
                        prompt: 'The glass trunk warms and brightens. Then it shudders — the pressure inside is rising fast.',
                        answers: [
                            {
                                choice: 'Catch the rising column in your battery banks and ride it out',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You time the surge and drink the whole warm column into the banks before it can blow — ' +
                                        'a flood of living colour that shoves the grey back a full step and leaves the geyser ' +
                                        'spent but standing.',
                                    effects: [
                                        { kind: 'front', advance: -1 },
                                        { kind: 'resource', marbles: 6 },
                                    ],
                                },
                            },
                            {
                                choice: 'Cap the trunk early and bottle the warm overflow',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You seal it before the big surge and skim off a flask of the glowing melt — modest, ' +
                                        'but real, and enough to warm the cabin for a week. The geyser sinks back to its frozen ' +
                                        'sleep, undisturbed.',
                                    effects: [{ kind: 'resource', marbles: 5 }],
                                },
                            },
                            {
                                choice: 'Crack the trunk wide to take the whole glow at once',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The geyser blows. A column of frozen spray and superheated melt slams your hull and the ' +
                                        'glow gutters out in the blast. You limp clear scalded and dented, with a thimble of warmth ' +
                                        'for all the damage done.',
                                    effects: [{ kind: 'resource', hull: -1, marbles: 2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Chip a few warm shards off the outer branches',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You break loose a handful of shards still faintly glowing — they will sell as novelties and warm ' +
                            'your gloves on the way home. The geyser does not stir. A small, safe taking.',
                        effects: [{ kind: 'resource', marbles: 4 }],
                    },
                },
                {
                    choice: 'Photograph the glass tree and leave the warmth be',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You log the impossible warm thing and fly on without touching it. A scientist’s caution. But you ' +
                            'leave the only heat for light-years burning alone in the dark, and the cold of the cabin feels ' +
                            'sharper for the choice.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-thin-ice-crossing',
        sector: 'frozen-drift',
        intro:
            'Between you and a frost-locked observatory lies a sheet of new black ice, thin as window-glass, ' +
            'and under it the dark water shows the dim drowned shapes of a sunken supply train — crates and ' +
            'crates of it, just below the surface.',
        root: {
            prompt: 'The ice will not hold long. How do you reach the sunken train?',
            answers: [
                {
                    choice: 'Crawl out flat on your belly, spreading your weight thin',
                    tone: 'good',
                    cost: [{ kind: 'resource', heart: -1 }],
                    followUp: {
                        prompt: 'The ice creaks under you like a living thing. A crate sits within reach, lid already sprung.',
                        answers: [
                            {
                                choice: 'Ease the one nearest crate up through a cut hole',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You fish the crate up slow and patient and the ice never breaks. Inside: sealed rations ' +
                                        'and a spare drive-coil, dry as the day they sank. You belly back to shore richer and ' +
                                        'shaking, having paid only in nerve.',
                                    effects: [
                                        { kind: 'item', grant: 'frozen-dry-drive-coil' },
                                        { kind: 'resource', marbles: 9 },
                                    ],
                                },
                            },
                            {
                                choice: 'Grab the loose marbles spilled across the nearest crate-lid',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You sweep the spilled coins into your glove and inch back the way you came. A fair handful ' +
                                        'for the fear, and the ice held — barely. You will dream about the creaking for a while.',
                                    effects: [{ kind: 'resource', marbles: 7 }],
                                },
                            },
                            {
                                choice: 'Lunge for the deep crate before the ice gives',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You overreach and the sheet splits. You go through to your chest in the killing water and ' +
                                        'haul yourself out empty-handed, soaked, your heart hammering pure cold. You make the ship ' +
                                        'with nothing but the chill in your bones.',
                                    effects: [{ kind: 'resource', heart: -2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Cast a magnet-line from the safe shore and trawl',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You stay on solid ice and fish blind with a magnet, snagging one small tin off the top of the ' +
                            'pile before the line ices up. Modest, but you never trusted your weight to glass, and that counts ' +
                            'for something.',
                        effects: [{ kind: 'resource', marbles: 4 }],
                    },
                },
                {
                    choice: 'Drive the ship out onto the ice to lift the whole train',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'The ice never had a chance against your landing struts. The whole sheet caves and the train sinks ' +
                            'a fathom deeper into black water, gone for good, while you claw the ship back skyward off a ' +
                            'collapsing shelf with a wrenched strut.',
                        effects: [{ kind: 'resource', hull: -1 }],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-avalanche-shelf',
        sector: 'frozen-drift',
        intro:
            'A shelf of blue ice the size of a city overhangs a frozen ravine, and pinned in the wall beneath ' +
            'it, half-buried, is a courier drone with its cargo light still blinking. One loud noise and the ' +
            'whole shelf comes down.',
        root: {
            prompt: 'The drone’s cargo is right there, under a hanging death. What do you do?',
            answers: [
                {
                    choice: 'Hover under the shelf and pluck the drone free by hand',
                    tone: 'good',
                    cost: [{ kind: 'resource', hull: -2 }],
                    followUp: {
                        prompt: 'Ice groans overhead as you ease in close, hull shaving the shelf. The drone’s cargo hatch pops.',
                        answers: [
                            {
                                choice: 'Take the sealed cargo and drift out the way you came in',
                                tone: 'good',
                                outcome: {
                                    resultText:
                                        'You lift the drone clear without a sound and back out under the groaning shelf. Its cargo ' +
                                        'is a relief-run of medicine and marbles bound for a colony that never got it — yours now, ' +
                                        'and worth every scrape on the hull.',
                                    effects: [
                                        { kind: 'item', grant: 'frozen-relief-cargo' },
                                        { kind: 'resource', marbles: 14 },
                                    ],
                                },
                            },
                            {
                                choice: 'Snatch just the loose pouch off the drone’s hook',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You grab the dangling pouch and pull out fast, leaving the bolted-down cargo to the ice. A ' +
                                        'decent purse for a bad position, and the shelf holds. You count yourself lucky and a little ' +
                                        'poorer than you hoped.',
                                    effects: [{ kind: 'resource', marbles: 6 }],
                                },
                            },
                            {
                                choice: 'Fire the cutter to free the bolted cargo faster',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'The cutter’s whine is the one loud thing the shelf could not abide. It comes down in a ' +
                                        'white roar; you punch out from under it with the drone’s pouch and a hull battered front ' +
                                        'to back, the cargo buried under a hundred metres of fresh ice.',
                                    effects: [{ kind: 'resource', hull: -1, marbles: 5 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Snipe the drone loose with a soft grapple from a safe distance',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You hang well back and tease the drone out with a low-power line. It comes free missing half its ' +
                            'cargo, snagged on the ice, but you keep your distance and your hull. A cautious half-prize.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
                {
                    choice: 'Mark the wreck and move on — not worth the shelf',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You log the drone’s position and burn for clear sky, leaving its blinking light to the hanging ' +
                            'ice. Sensible. But somewhere a colony’s relief is still waiting under a cliff, and you chose not to ' +
                            'be the one who brought it.',
                        effects: [],
                    },
                },
            ],
        },
    },
    {
        id: 'frozen-aurora-forge',
        sector: 'frozen-drift',
        intro:
            'In a cavern under the ice cap, a smith’s forge stands cold, and racked above it hang half-made ' +
            'blades of frozen aurora — light worked like steel, then abandoned mid-temper when the warmth ran ' +
            'out. One anvil still holds a blade waiting for its final quench.',
        root: {
            prompt: 'The forge is dead, but the aurora-steel is sound. Do you finish the work?',
            answers: [
                {
                    choice: 'Feed the forge a charge of your own marbles to relight it',
                    tone: 'good',
                    cost: [{ kind: 'resource', marbles: -6 }],
                    followUp: {
                        prompt: 'Spent currency burns colour-bright in the firebox; the aurora-blade glows, ready for the quench.',
                        answers: [
                            {
                                choice: 'Quench it slow in the cavern’s meltwater, the smith’s way',
                                tone: 'good',
                                gate: { kind: 'crew', member: 'grandpa' },
                                outcome: {
                                    resultText:
                                        'Grandpa reads the colour of the steel like he was born to it and calls the quench to the ' +
                                        'heartbeat. The aurora-blade comes out singing, a thing of worked light that throws the ' +
                                        'grey back wherever it points. Worth ten times what you fed the fire.',
                                    effects: [
                                        { kind: 'item', grant: 'frozen-aurora-blade' },
                                        { kind: 'front', advance: -1 },
                                    ],
                                },
                            },
                            {
                                choice: 'Quench it quick before the forge cools again',
                                tone: 'neutral',
                                outcome: {
                                    resultText:
                                        'You dunk it the moment it glows and it sets — not the masterwork the smith meant, but a ' +
                                        'sound bright tool that fetches a fair price and lights a dark hold. You break even on the ' +
                                        'marbles and come out a little ahead in wonder.',
                                    effects: [{ kind: 'resource', marbles: 9 }],
                                },
                            },
                            {
                                choice: 'Crank the firebox white-hot to forge the whole rack at once',
                                tone: 'bad',
                                outcome: {
                                    resultText:
                                        'You overfeed the fire and the rack of half-blades flares and shatters, raw aurora bleeding ' +
                                        'out into the cavern in a useless dazzle. The forge dies for good, your marbles with it, and ' +
                                        'you climb out with a single warped sliver and a hard lesson.',
                                    effects: [{ kind: 'resource', marbles: 2 }],
                                },
                            },
                        ],
                    },
                },
                {
                    choice: 'Pry one finished blade off the cold rack and go',
                    tone: 'neutral',
                    outcome: {
                        resultText:
                            'You take a single completed aurora-blade from the rack without lighting a thing — duller than a ' +
                            'fresh-quenched one, but real, and bought with nothing but the care to lift it clean. The forge ' +
                            'stays dark behind you.',
                        effects: [{ kind: 'item', grant: 'frozen-cold-aurora-blade' }],
                    },
                },
                {
                    choice: 'Strip the forge of its rare fittings for scrap',
                    tone: 'bad',
                    outcome: {
                        resultText:
                            'You wrench loose the brass and the bellows-coils and leave the aurora-steel to dull on its dead ' +
                            'anvil. The scrap is worth a little. The smith’s whole life’s work, abandoned a second time, is ' +
                            'worth more than you can carry, and you carried none of it.',
                        effects: [{ kind: 'resource', marbles: 5 }],
                    },
                },
            ],
        },
    },
];
