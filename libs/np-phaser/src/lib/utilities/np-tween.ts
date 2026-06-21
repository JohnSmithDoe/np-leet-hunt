import * as Phaser from 'phaser';

/**
 * Convenience tween helpers — readable, well-named wrappers over `scene.tweens.add(...)` so game code
 * reads like prose (`floatUp(score)`, `pulse(planet)`, `lunge(mob, { x, y })`) instead of repeating
 * config objects with hand-tuned durations and eases.
 *
 * Every helper:
 *  - derives the scene from the target itself (a Phaser game object always knows its `scene`),
 *  - takes an options bag where everything has a sensible default — override only what you need,
 *  - returns the created {@link Phaser.Tweens.Tween} so you can keep a handle (e.g. to `stop()` a loop).
 *
 * Defaults match the durations/eases the game already used, so swapping a raw `tweens.add` for a helper
 * is behaviour-preserving. Pass an array of targets to drive several objects with one tween.
 */

/**
 * Anything these helpers can tween: a Phaser game object that carries the transform (x/y/scale/angle)
 * and alpha components — {@link NPSprite}, {@link NPText}, {@link NPRectangle}, images, shapes (circles)
 * and containers all qualify. We require `AlphaSingle` (just `alpha`/`setAlpha`) rather than the full
 * `Alpha` component so Phaser shapes like `Arc` — which only carry single-value alpha — are accepted too.
 */
export type NPTweenTarget = Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform &
    Phaser.GameObjects.Components.AlphaSingle;

export type NPTweenTargets = NPTweenTarget | NPTweenTarget[];

/** Options shared by every helper. */
export interface NPTweenOptions {
    duration?: number;
    delay?: number;
    ease?: string | ((t: number) => number);
    onComplete?: () => void;
}

const asArray = (target: NPTweenTargets): NPTweenTarget[] => (Array.isArray(target) ? target : [target]);

const sceneOf = (target: NPTweenTargets): Phaser.Scene => asArray(target)[0].scene;

/** The rest scale we breathe/pop around — read from the first target. */
const restScale = (target: NPTweenTargets): number => asArray(target)[0].scaleX;

/** Wrap an `onComplete` so it also destroys the target(s) — for throwaway one-shot effects. */
const thenDestroy = (
    target: NPTweenTargets,
    destroyOnComplete: boolean | undefined,
    onComplete: (() => void) | undefined
): (() => void) | undefined => {
    if (!destroyOnComplete) {
        return onComplete;
    }
    return () => {
        onComplete?.();
        asArray(target).forEach(t => t.destroy());
    };
};

// --- opacity -----------------------------------------------------------------------------------------

export interface NPFadeOptions extends NPTweenOptions {
    /** Alpha to start from. Omit to fade from the object's current alpha. */
    from?: number;
    /** Alpha to settle at. Defaults: {@link fadeIn} → 1, {@link fadeOut} → 0. */
    to?: number;
    /** Destroy the target(s) once faded. Handy for one-shot fade-outs. */
    destroyOnComplete?: boolean;
}

/** Tween alpha to an explicit value. {@link fadeIn} / {@link fadeOut} are the common shortcuts. */
export function fadeTo(target: NPTweenTargets, alpha: number, options: NPFadeOptions = {}): Phaser.Tweens.Tween {
    const { from, duration = 300, ease = 'Sine.easeOut', delay, onComplete, destroyOnComplete } = options;
    if (from !== undefined) {
        asArray(target).forEach(t => t.setAlpha(from));
    }
    return sceneOf(target).tweens.add({
        targets: target,
        alpha,
        duration,
        ease,
        delay,
        onComplete: thenDestroy(target, destroyOnComplete, onComplete),
    });
}

/** Snap to invisible (or `from`) and fade up to full opacity (or `to`). */
export function fadeIn(target: NPTweenTargets, options: NPFadeOptions = {}): Phaser.Tweens.Tween {
    return fadeTo(target, options.to ?? 1, { ...options, from: options.from ?? 0 });
}

/** Fade from the current alpha down to 0 (or `to`). Pass `destroyOnComplete` for throwaway objects. */
export function fadeOut(target: NPTweenTargets, options: NPFadeOptions = {}): Phaser.Tweens.Tween {
    return fadeTo(target, options.to ?? 0, options);
}

export interface NPFloatUpOptions extends NPTweenOptions {
    /** Pixels to rise. Default 40. */
    distance?: number;
    /** Alpha to fade to while rising. Default 0 (fully gone). */
    to?: number;
    /** Destroy the target(s) when done. Default true — floaters are throwaway. */
    destroyOnComplete?: boolean;
}

/** Rise and fade — the classic damage / resource-gain floater. Auto-destroys by default. */
export function floatUp(target: NPTweenTargets, options: NPFloatUpOptions = {}): Phaser.Tweens.Tween {
    const {
        distance = 40,
        to = 0,
        duration = 1000,
        ease = 'Cubic.easeOut',
        delay,
        onComplete,
        destroyOnComplete = true,
    } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        y: `-=${distance}`,
        alpha: to,
        duration,
        ease,
        delay,
        onComplete: thenDestroy(target, destroyOnComplete, onComplete),
    });
}

// --- looping attention grabbers ----------------------------------------------------------------------

export interface NPPulseOptions extends NPTweenOptions {
    /** Peak scale as a multiple of the rest scale. Default 1.08. */
    scale?: number;
}

/** Looping scale "breathing" to draw attention (e.g. a reachable planet). Returns the tween to `stop()`. */
export function pulse(target: NPTweenTargets, options: NPPulseOptions = {}): Phaser.Tweens.Tween {
    const { scale = 1.08, duration = 700, ease = 'Sine.easeInOut', delay } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        scale: restScale(target) * scale,
        duration,
        ease,
        delay,
        yoyo: true,
        repeat: -1,
    });
}

export interface NPGlowOptions extends NPTweenOptions {
    /** Dim alpha at the bottom of the breath. Default 0.4. */
    to?: number;
}

/** Looping alpha "breathing" — a soft glow for rings and highlights. Returns the tween to `stop()`. */
export function glow(target: NPTweenTargets, options: NPGlowOptions = {}): Phaser.Tweens.Tween {
    const { to = 0.4, duration = 900, ease = 'Sine.easeInOut', delay } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        alpha: to,
        duration,
        ease,
        delay,
        yoyo: true,
        repeat: -1,
    });
}

// --- one-shot emphasis -------------------------------------------------------------------------------

export interface NPPopOptions extends NPTweenOptions {
    /** Overshoot scale as a multiple of the rest scale. Default 1.18. */
    from?: number;
}

/** A quick emphasis pop: jump to an overshoot scale, then settle back. Great for changed values. */
export function pop(target: NPTweenTargets, options: NPPopOptions = {}): Phaser.Tweens.Tween {
    const { from = 1.18, duration = 280, ease = 'Quad.easeOut', delay, onComplete } = options;
    const rest = restScale(target);
    asArray(target).forEach(t => t.setScale(rest * from));
    return sceneOf(target).tweens.add({
        targets: target,
        scale: rest,
        duration,
        ease,
        delay,
        onComplete,
    });
}

export interface NPPopInOptions extends NPTweenOptions {
    /** Final scale to settle at. Default 1. */
    scale?: number;
}

/** Stamp in from nothing: scale up from 0 with a springy Back.easeOut while fading in. */
export function popIn(target: NPTweenTargets, options: NPPopInOptions = {}): Phaser.Tweens.Tween {
    const { scale = 1, duration = 280, ease = 'Back.easeOut', delay, onComplete } = options;
    asArray(target).forEach(t => {
        t.setScale(0);
        t.setAlpha(0);
    });
    return sceneOf(target).tweens.add({
        targets: target,
        scale,
        alpha: 1,
        duration,
        ease,
        delay,
        onComplete,
    });
}

export interface NPSwellOptions extends NPTweenOptions {
    /** Target scale as a multiple of the rest scale. Default 1.12. */
    scale?: number;
}

/** Slowly grow — a held "breath in" beat (e.g. a title swelling while it sits on screen). */
export function swell(target: NPTweenTargets, options: NPSwellOptions = {}): Phaser.Tweens.Tween {
    const { scale = 1.12, duration = 1500, ease = 'Sine.easeInOut', delay, onComplete } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        scale: restScale(target) * scale,
        duration,
        ease,
        delay,
        onComplete,
    });
}

export interface NPShrinkAwayOptions extends NPTweenOptions {
    /** Target scale as a multiple of the rest scale. Default 0.3. */
    scale?: number;
    /** Target alpha. Default 0.3. */
    alpha?: number;
    /** Destroy the target(s) once shrunk. */
    destroyOnComplete?: boolean;
}

/** Shrink and fade — an object being swallowed or dismissed. Optionally destroy when done. */
export function shrinkAway(target: NPTweenTargets, options: NPShrinkAwayOptions = {}): Phaser.Tweens.Tween {
    const {
        scale = 0.3,
        alpha = 0.3,
        duration = 800,
        ease = 'Sine.easeIn',
        delay,
        onComplete,
        destroyOnComplete,
    } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        scale: restScale(target) * scale,
        alpha,
        duration,
        ease,
        delay,
        onComplete: thenDestroy(target, destroyOnComplete, onComplete),
    });
}

// --- movement --------------------------------------------------------------------------------------

export interface NPSlideToOptions extends NPTweenOptions {
    x?: number;
    y?: number;
    /** Optionally scale during the slide (e.g. a winner growing as it centres). */
    scale?: number;
}

/** Slide to a position (and optionally scale) with a springy Back.easeOut by default. */
export function slideTo(target: NPTweenTargets, options: NPSlideToOptions = {}): Phaser.Tweens.Tween {
    const { x, y, scale, duration = 450, ease = 'Back.easeOut', delay, onComplete } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        ...(x !== undefined ? { x } : {}),
        ...(y !== undefined ? { y } : {}),
        ...(scale !== undefined ? { scale } : {}),
        duration,
        ease,
        delay,
        onComplete,
    });
}

export type NPSlideFrom = 'left' | 'right' | 'top' | 'bottom';

export interface NPSlideInOptions extends NPTweenOptions {
    /** Screen edge to slide in from. */
    from: NPSlideFrom;
    /** How far off the current position to start. Default 200 px. */
    distance?: number;
}

/** Slide in from an off-screen edge to the object's current position. */
export function slideIn(target: NPTweenTargets, options: NPSlideInOptions): Phaser.Tweens.Tween {
    const { from, distance = 200, duration = 450, ease = 'Back.easeOut', delay, onComplete } = options;
    const startDelta = {
        left: { x: -distance, y: 0 },
        right: { x: distance, y: 0 },
        top: { x: 0, y: -distance },
        bottom: { x: 0, y: distance },
    }[from];
    asArray(target).forEach(t => t.setPosition(t.x + startDelta.x, t.y + startDelta.y));
    const back: { x?: string; y?: string } = {};
    if (startDelta.x) {
        back.x = `${startDelta.x < 0 ? '+' : '-'}=${Math.abs(startDelta.x)}`;
    }
    if (startDelta.y) {
        back.y = `${startDelta.y < 0 ? '+' : '-'}=${Math.abs(startDelta.y)}`;
    }
    return sceneOf(target).tweens.add({ targets: target, ...back, duration, ease, delay, onComplete });
}

export interface NPLungeOptions extends NPTweenOptions {
    x: number;
    y: number;
    /** Fires at the peak of the lunge (the yoyo turn) — e.g. apply the hit there. */
    onContact?: () => void;
}

/** Thrust toward a point and snap back (yoyo) — the classic melee jab. Fire `onContact` at the peak. */
export function lunge(target: NPTweenTargets, options: NPLungeOptions): Phaser.Tweens.Tween {
    const { x, y, duration = 250, ease = 'Power1', delay, onComplete, onContact } = options;
    return sceneOf(target).tweens.add({
        targets: target,
        x,
        y,
        duration,
        ease,
        delay,
        yoyo: true,
        onYoyo: onContact,
        onComplete,
    });
}
