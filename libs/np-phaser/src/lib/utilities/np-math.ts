import * as Phaser from 'phaser';

/**
 * Friendly, named wrappers around the `Phaser.Math` helpers the game uses, so app code reaches for a
 * clear name from `@shared/np-phaser` instead of spelling out the Phaser namespace. (Vector2 is not
 * wrapped on purpose — use `Phaser.Math.Vector2` / `NPVec2` directly.)
 */

/** Clamp `value` into the range [`min`, `max`]. */
export const clamp = (value: number, min: number, max: number): number => Phaser.Math.Clamp(value, min, max);

/** Linear interpolation between `from` and `to` — `from` at t=0, `to` at t=1. */
export const lerp = (from: number, to: number, t: number): number => Phaser.Math.Linear(from, to, t);

/** Convert degrees to radians. */
export const degToRad = (degrees: number): number => Phaser.Math.DegToRad(degrees);

/** Angle in radians from point (x1, y1) to point (x2, y2). */
export const angleBetween = (x1: number, y1: number, x2: number, y2: number): number =>
    Phaser.Math.Angle.Between(x1, y1, x2, y2);

/** Rotate `point` to sit `distance` away from (`x`, `y`) at `angle` radians; mutates and returns `point`. */
export const rotateTo = (point: Phaser.Math.Vector2, x: number, y: number, angle: number, distance: number) =>
    Phaser.Math.RotateTo(point, x, y, angle, distance);
