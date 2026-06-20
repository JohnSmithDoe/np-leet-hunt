import { PlanetEvent } from '../event.model';

/**
 * En-route intercept events (Leet-35 / GDD §3): a jump can be intercepted by the Grey Fleet before
 * arrival, resolved through the same choice dialog as a planet event. These are pool-agnostic (no
 * `sector` tag) — `resolveEnRouteEvent` draws from them on an intercept roll, whatever the sector.
 *
 * Authoring note: outcomes here stay to resources / items / flags — no `front` effects (the front already
 * advances exactly once per jump at commit; an intercept must not move it) and no `spawnGame` (ship fights
 * + boarding are Phase 2/3). One level deep, three tones good | neutral | bad (event-system.md §4).
 */

/** A thief drone reaching for your marble stash to feed it to the grey (GDD §3 Grey Fleet behaviour). */
export const greyThiefDrone: PlanetEvent = {
    id: 'grey-thief-drone',
    intro:
        'A Grey Fleet thief drone slides out of the dark, tractor beam already reaching for your marble ' +
        'stash — it means to feed your hoard to the Hush.',
    root: {
        prompt: 'The beam locks on mid-jump. What do you do?',
        answers: [
            {
                choice: 'Cut the engines and juke the beam',
                tone: 'good',
                outcome: {
                    resultText:
                        'You go dark and drift sideways; the beam slips off you and you snatch a loose cargo ' +
                        'pod off the drone on the way past.',
                    effects: [
                        { kind: 'resource', marbles: 8 },
                        { kind: 'flag', set: 'shook-a-drone' },
                    ],
                },
            },
            {
                choice: 'Jettison a stash to break the lock',
                tone: 'neutral',
                outcome: {
                    resultText: 'You dump a sack of marbles into the beam. The drone chases the bait; you slip free.',
                    effects: [{ kind: 'resource', marbles: -6 }],
                },
            },
            {
                choice: 'Gun it straight through the beam',
                tone: 'bad',
                outcome: {
                    resultText:
                        'The tractor field grinds down your hull as you tear loose — and it still skims some marbles.',
                    effects: [{ kind: 'resource', hull: -2, marbles: -3 }],
                },
            },
        ],
    },
};

/** An escort fighter pacing your wing — bluff, evade, or dare it (escort fighters, GDD §3 later sectors). */
export const greyEscortFighter: PlanetEvent = {
    id: 'grey-escort-fighter',
    intro:
        'An escort fighter from the Grey Fleet falls in alongside, wings painted the colour of forgetting. ' +
        "It hasn't fired — yet.",
    root: {
        prompt: 'It paces your wing, scanning. Your move?',
        answers: [
            {
                choice: 'Spoof a Fleet transponder',
                tone: 'good',
                // The stake: you spend marbles forging credentials before you know if the bluff lands (§8).
                cost: [{ kind: 'resource', marbles: 4 }],
                outcome: {
                    resultText:
                        'Your forged squawk reads as one of theirs. It dips a wing in salute and even waves you ' +
                        'through the picket ahead.',
                    effects: [
                        { kind: 'resource', marbles: 10 },
                        { kind: 'flag', set: 'fleet-spoofed' },
                    ],
                },
            },
            {
                choice: 'Ease wide and let it lose interest',
                tone: 'neutral',
                outcome: {
                    resultText: 'A long, nervous detour around its patrol arc. Nothing lost but your nerve.',
                    effects: [{ kind: 'resource', heart: -1 }],
                },
            },
            {
                choice: 'Hold course and dare it',
                tone: 'bad',
                outcome: {
                    resultText: 'It strafes you on the way past — a cold raking burst — then peels off, bored.',
                    effects: [{ kind: 'resource', hull: -2 }],
                },
            },
        ],
    },
};

/** A field of Hush picket buoys across the lane — thread, coast, or blast through. */
export const greyDriftPicket: PlanetEvent = {
    id: 'grey-drift-picket',
    intro:
        'Your course threads a field of grey buoys — Hush pickets, blinking slow, swallowing the colour ' +
        'out of the space around them.',
    root: {
        prompt: 'The pickets drift across your lane. How do you pass?',
        answers: [
            {
                choice: 'Thread the gaps on manual',
                tone: 'good',
                outcome: {
                    resultText: 'Hands steady, you weave the gaps clean — and scoop a dead buoy’s core for parts.',
                    effects: [
                        { kind: 'resource', marbles: 6 },
                        { kind: 'item', grant: 'picket-core' },
                    ],
                },
            },
            {
                choice: 'Power down and coast through dark',
                tone: 'neutral',
                outcome: {
                    resultText:
                        'You run cold and silent. The pickets ignore the dead-looking ship; you slip by untouched.',
                    effects: [],
                },
            },
            {
                choice: 'Blast a path clear',
                tone: 'bad',
                outcome: {
                    resultText:
                        'The noise wakes them. They clamp on and drain a little life and metal before you punch out.',
                    effects: [{ kind: 'resource', hull: -1, heart: -1 }],
                },
            },
        ],
    },
};

/** Every en-route intercept event, for the pool + validation. */
export const enRouteEvents: PlanetEvent[] = [greyThiefDrone, greyEscortFighter, greyDriftPicket];
