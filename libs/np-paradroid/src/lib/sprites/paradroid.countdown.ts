import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { toBinaryBlocks } from '../@types/paradroid.format';

/** Palette — the cyan matches the binary match-timer and the result readout; amber/red flag urgency. */
const CYAN = '#4dd3f6';
const AMBER = '#f6c14d';
const RED = '#f6534d';

const TICK_MS = 1000; // one beat per second of the selection window
const PUNCH_MS = 600; // each tick the big digit pops and fades back to its ghosted rest alpha
const REST_ALPHA = 0.22; // ghosted so the board the player is judging stays readable *through* the digit

/**
 * The grid-selection countdown (Leet-40): the fixed window during which the player may re-roll the duel
 * board as often as they like before it locks and the fight begins. Choosing the layout is part of the
 * gameplay — a good grid wins easier, a bad one loses more likely — so the randomness becomes the player's
 * call, not the game's.
 *
 * It honours the "binary clock countdown / 3-2-1 centre-screen" idea both ways: a big digit punches in at
 * the board's centre each second (ghosted so the board reads through it, reddening as time runs out) over a
 * compact binary block readout. Plain object (no textures → no preload, no component lifecycle): it builds
 * its own text via `scene.add`, ticks on the scene clock, and tears itself down on {@link stop}.
 */
export class ParadroidCountdown {
    readonly #scene: NPScene;
    readonly #objects: Phaser.GameObjects.GameObject[] = [];
    #event?: Phaser.Time.TimerEvent;
    #number?: Phaser.GameObjects.Text;
    #binary?: Phaser.GameObjects.Text;
    #bits = 3; // binary-readout width, fixed for the whole window so it doesn't shrink as it counts down
    #onExpire?: () => void;

    constructor(scene: NPScene) {
        this.#scene = scene;
    }

    /**
     * Start a `seconds`-long countdown ghosted over `bounds` (the board's world bounds). The digit ticks
     * `seconds → 1`; once it runs out `onExpire` fires (the scene then locks the grid and plays the intro).
     * The clock is *not* reset by a re-roll — the window is fixed, which is the pressure.
     */
    play(seconds: number, bounds: Phaser.Geom.Rectangle, onExpire: () => void): void {
        this.stop();
        this.#onExpire = onExpire;
        this.#bits = Math.max(3, seconds.toString(2).length); // wide enough for the starting count (e.g. 20 → 5)
        const cx = bounds.centerX;
        const cy = bounds.centerY;
        const size = bounds.height;

        // Sits centred above the board between the scoreboard's YOU / DROID corner labels (the score they
        // flank is hidden during selection), so keep it short — the "↻ Re-Roll" button conveys the action.
        const caption = this.#scene.add
            .text(cx, bounds.top - 6, 'CHOOSE YOUR GRID', {
                fontSize: `${Math.round(size * 0.09)}px`,
                color: CYAN,
                stroke: '#042b2c',
                strokeThickness: 3,
            })
            .setOrigin(0.5, 1)
            .setAlpha(0.9);
        this.#number = this.#scene.add
            .text(cx, cy, `${seconds}`, { fontSize: `${Math.round(size * 0.85)}px`, color: CYAN, fontStyle: 'bold' })
            .setOrigin(0.5)
            .setAlpha(REST_ALPHA);
        this.#binary = this.#scene.add
            .text(cx, cy + size * 0.46, toBinaryBlocks(seconds, this.#bits), {
                fontSize: `${Math.round(size * 0.12)}px`,
                color: CYAN,
            })
            .setOrigin(0.5)
            .setAlpha(0.55);
        this.#objects.push(caption, this.#number, this.#binary);
        this.#punch(seconds);

        // delay 1000 × (seconds repeats) fires `seconds` times — one per second; the last one runs out.
        let remaining = seconds;
        this.#event = this.#scene.time.addEvent({
            delay: TICK_MS,
            repeat: seconds - 1,
            callback: () => {
                remaining--;
                if (remaining <= 0) {
                    this.#expire();
                    return;
                }
                this.#number?.setText(`${remaining}`);
                this.#binary?.setText(toBinaryBlocks(remaining, this.#bits));
                this.#punch(remaining);
            },
        });
    }

    /** Pop the digit (scale + alpha flash back to rest) and tint it by urgency on each tick. */
    #punch(n: number): void {
        const digit = this.#number;
        if (!digit) return;
        const color = n <= 3 ? RED : n <= 6 ? AMBER : CYAN;
        digit.setColor(color);
        this.#binary?.setColor(color);
        this.#scene.tweens.killTweensOf(digit);
        digit.setScale(1.5).setAlpha(0.5);
        this.#scene.tweens.add({
            targets: digit,
            scale: 1,
            alpha: REST_ALPHA,
            ease: 'Back.easeOut',
            duration: PUNCH_MS,
        });
    }

    #expire(): void {
        const onExpire = this.#onExpire;
        this.stop();
        onExpire?.();
    }

    /** Keep the countdown drawn above a freshly re-rolled board (which is added on top of the display list). */
    bringToTop(): void {
        this.#objects.forEach(obj => this.#scene.children.bringToTop(obj));
    }

    /** Cancel the countdown and destroy its visuals (early lock-in, re-entry, or natural expiry). */
    stop(): void {
        this.#event?.remove();
        this.#event = undefined;
        this.#objects.forEach(obj => {
            this.#scene.tweens.killTweensOf(obj);
            obj.destroy();
        });
        this.#objects.length = 0;
        this.#number = undefined;
        this.#binary = undefined;
        this.#onExpire = undefined;
    }
}
