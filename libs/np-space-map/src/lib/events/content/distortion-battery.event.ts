import { DISTORTION_BATTERY, PlanetEvent } from '../event.model';

/**
 * Core pool — the Phase-1 source of a distortion battery (GDD §4 / Leet-36): a derelict still cradling a
 * live charge of raw distortion. The *good* branch feeds that charge to the grey, pushing the front back
 * one node (the `distortion-battery` item grant is consumed at once by the map). The canonical source
 * becomes the Sabotage dungeon drop in Phase 3; until then, this rare find is how you buy back room.
 */
export const distortionCache: PlanetEvent = {
    id: 'distortion-cache',
    intro:
        'A dead hauler drifts across your path, its reactor still humming — a pocket of stolen distortion ' +
        'the grey never finished tidying away. The core holds a live charge.',
    root: {
        prompt: 'The wreck cradles a charge of raw distortion. How do you take it?',
        answers: [
            {
                choice: 'Rig it to feed the grey behind you',
                tone: 'good',
                outcome: {
                    resultText:
                        'The pet wires the charge into your wake and lets it go. Behind you the grey hesitates ' +
                        '— then sighs and pulls back a whole notch. Room to breathe.',
                    effects: [{ kind: 'item', grant: DISTORTION_BATTERY }],
                },
            },
            {
                choice: 'Strip it for marbles instead',
                tone: 'neutral',
                outcome: {
                    resultText:
                        'You crack the core for parts. A tidy haul of marbles — but the charge bleeds out, wasted.',
                    effects: [{ kind: 'resource', marbles: 10 }],
                },
            },
            {
                choice: 'Bottle the whole charge at once',
                tone: 'bad',
                outcome: {
                    resultText:
                        'Too greedy. The core overloads in your grip and the blast rakes the hull before you cut loose.',
                    effects: [{ kind: 'resource', hull: -2 }],
                },
            },
        ],
    },
};
