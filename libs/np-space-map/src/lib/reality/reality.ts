import { NPGameObject, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { FrontPoint } from './normality-front';

// The mask circle is drawn once at this radius then scaled to size — scaling a geometry-mask graphic
// is cheaper than redrawing it every collapse.
const BASE_RADIUS = 1000;

// Mundane, colour-drained sky. A flat fill rather than a tiled texture: the veil has to span the
// whole world, and a TileSprite that large would allocate a multi-gigabyte backing canvas.
const VEIL_COLOUR = 0x2c303b;
const VEIL_ALPHA = 0.64;

/**
 * Renders the normality front as a radial collapse: a veil of colourless sky covering everything
 * outside a circular bubble of still-distorted space. The bubble is punched out with an inverted
 * geometry mask, so collapsing the front is just shrinking that circle. The veil sits above the
 * planets/routes so they desaturate as it passes over them, but below the ship and HUD.
 */
export class Reality extends Phaser.GameObjects.Rectangle implements NPGameObject {
    #mask!: Phaser.Display.Masks.GeometryMask;
    #circle!: Phaser.GameObjects.Graphics;
    readonly #center: FrontPoint;
    #radius: number;

    constructor(
        public scene: NPScene,
        center: FrontPoint,
        radius: number
    ) {
        // Span the whole bubble plus a margin so the veil always fills the view outside it.
        super(
            scene,
            center.x,
            center.y,
            (radius + BASE_RADIUS) * 2,
            (radius + BASE_RADIUS) * 2,
            VEIL_COLOUR,
            VEIL_ALPHA
        );
        this.#center = center;
        this.#radius = radius;
        this.setName('reality');
    }

    create(): void {
        this.setDepth(10); // above planets (3) and routes (2), below the "here" ring (25) and ship (30)

        this.#circle = this.scene.add.graphics();
        this.#circle.fillStyle(0xffffff, 1).fillCircle(0, 0, BASE_RADIUS);
        this.#circle.setPosition(this.#center.x, this.#center.y).setVisible(false);
        this.#circle.setScale(this.#radius / BASE_RADIUS);

        this.#mask = this.#circle.createGeometryMask();
        this.#mask.invertAlpha = true; // veil shows OUTSIDE the circle; inside stays distorted/colourful
        this.setMask(this.#mask);
    }

    addToScene(): void {
        this.scene.addExisting(this);
    }

    /** Collapse (or, with pushback, re-grow) the distortion bubble to `radius`, tweened over `duration` ms. */
    collapseTo(radius: number, duration = 800): void {
        this.#radius = radius;
        this.scene.tweens.add({
            targets: this.#circle,
            scaleX: radius / BASE_RADIUS,
            scaleY: radius / BASE_RADIUS,
            duration,
            ease: 'Sine.easeInOut',
        });
    }
}
