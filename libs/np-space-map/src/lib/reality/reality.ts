import { NPGameObject, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { FrontPoint } from './normality-front';

// The veil is a single rectangle big enough to overhang the whole world from any front position; it's
// a flat fill rather than a tiled texture because a TileSprite this large would allocate a multi-
// gigabyte backing canvas, whereas a Shape is just vector geometry.
const VEIL_SIZE = 80000;

// Mundane, colour-drained sky.
const VEIL_COLOUR = 0x2c303b;
const VEIL_ALPHA = 0.64;

/**
 * Renders the normality front as a diagonal sweep: a veil of colourless sky covering everything behind
 * the front line, which slides in from one side of the map. The veil is one big rectangle, rotated to
 * the front angle and pinned by its leading edge to the line — so advancing the front is just sliding
 * that rectangle along the sweep axis. It sits above the planets/routes so they desaturate as it passes
 * over them, but below the ship and HUD.
 */
export class Reality extends Phaser.GameObjects.Rectangle implements NPGameObject {
    readonly #origin: FrontPoint;
    readonly #axis: FrontPoint;
    readonly #angle: number;

    constructor(
        public scene: NPScene,
        origin: FrontPoint,
        axis: FrontPoint,
        position: number
    ) {
        const front = pointAt(origin, axis, position);
        super(scene, front.x, front.y, VEIL_SIZE, VEIL_SIZE, VEIL_COLOUR, VEIL_ALPHA);
        this.#origin = origin;
        this.#axis = axis;
        this.#angle = Math.atan2(axis.y, axis.x);
        this.setName('reality');
    }

    create(): void {
        // Origin on the right-edge midpoint, rotated to the sweep angle: the rectangle's leading edge
        // becomes the front line and its body fills the greyed side behind it.
        this.setOrigin(1, 0.5);
        this.setRotation(this.#angle);
        this.setDepth(10); // above planets (3) and routes (2), below the "here" ring (25) and ship (30)
    }

    addToScene(): void {
        this.scene.addExisting(this);
    }

    /** Sweep the front line to `position` along the axis (or, with pushback, back out), tweened over `duration` ms. */
    sweepTo(position: number, duration = 800): void {
        const front = pointAt(this.#origin, this.#axis, position);
        this.scene.tweens.add({
            targets: this,
            x: front.x,
            y: front.y,
            duration,
            ease: 'Sine.easeInOut',
        });
    }
}

// World-space point on the front line at the given sweep position.
const pointAt = (origin: FrontPoint, axis: FrontPoint, position: number): FrontPoint => ({
    x: origin.x + axis.x * position,
    y: origin.y + axis.y * position,
});
