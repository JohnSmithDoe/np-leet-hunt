import { angleBetween, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { Planet } from '../planet/planet';
import { SPACE_EVENTS } from '../space.events';

interface TravelButton {
    planet: Planet;
    bg: Phaser.GameObjects.Arc;
    arrow: Phaser.GameObjects.Triangle;
}

// World-space sizing: the buttons live on the map (so they scale with zoom and sit right on the "here"
// marker). The map only shows them when zoomed in, so these read as compact controls at that zoom.
const BUTTON_RADIUS = 62;
const ARROW_W = 44;
const ARROW_H = 26; // half-height; the triangle spans 2*ARROW_H tall
const GAP = 22; // clearance between the "here" ring and the button

const REST = { fill: 0x0a1830, stroke: 0x66ccff, arrow: 0x66ccff };
const ARMED = { fill: 0x123a5c, stroke: 0xaee3ff, arrow: 0xffffff };

/**
 * The ring of one-tap travel buttons drawn around the ship's current node — one arrow per reachable
 * neighbour, pointing toward it. They give the player a way to navigate while zoomed in on the rocket
 * (where the destination planets are off-screen): the buttons are anchored to the "here" marker, which
 * is always under the ship. The map owns the two-tap logic; this class only draws and reports taps.
 */
export class TravelButtons {
    #scene: NPScene;
    #buttons: TravelButton[] = [];

    /** Tapped a direction button; the map decides whether that arms a target or commits the jump. */
    onTap: (planet: Planet) => void = () => undefined;

    constructor(scene: NPScene) {
        this.#scene = scene;
    }

    /**
     * Rebuild the button ring around `center`, sitting `centerRadius` + button + gap out from it — pass the
     * ship's radius so the buttons cluster tight around the ship, not the larger current-node marker.
     */
    render(center: { x: number; y: number }, centerRadius: number, neighbours: Planet[], armed?: Planet): void {
        this.clear();
        const offset = centerRadius + BUTTON_RADIUS + GAP;
        for (const planet of neighbours) {
            const angle = angleBetween(center.x, center.y, planet.x, planet.y);
            const x = center.x + Math.cos(angle) * offset;
            const y = center.y + Math.sin(angle) * offset;
            this.#buttons.push(this.#make(x, y, angle, planet));
        }
        this.setArmed(armed);
    }

    /** Highlight the button whose target is currently selected (tap-again-to-go), reset the rest. */
    setArmed(armed?: Planet): void {
        for (const button of this.#buttons) {
            const on = button.planet === armed;
            const look = on ? ARMED : REST;
            button.bg.setFillStyle(look.fill, 0.9).setStrokeStyle(on ? 5 : 4, look.stroke, on ? 1 : 0.85);
            button.arrow.setFillStyle(look.arrow);
            button.bg.setScale(on ? 1.14 : 1);
            button.arrow.setScale(on ? 1.14 : 1);
        }
    }

    /** Destroy every button (used on rebuild and whenever the buttons should be hidden). */
    clear(): void {
        this.#buttons.forEach(button => {
            button.bg.destroy();
            button.arrow.destroy();
        });
        this.#buttons = [];
    }

    #make(x: number, y: number, angle: number, planet: Planet): TravelButton {
        const bg = this.#scene.add
            .circle(x, y, BUTTON_RADIUS, REST.fill, 0.9)
            .setStrokeStyle(4, REST.stroke, 0.85)
            .setDepth(28)
            .setInteractive({ useHandCursor: true });
        bg.on('pointerup', () => {
            this.#scene.game.events.emit(SPACE_EVENTS.TRAVEL_TAP); // app plays the click SFX (np-space-map stays audio-free)
            this.onTap(planet);
        });
        // Arrow points along +x at rotation 0 (tip at the bbox's mid-right), so setRotation aims it outward.
        const arrow = this.#scene.add
            .triangle(x, y, 0, 0, 0, 2 * ARROW_H, ARROW_W, ARROW_H, REST.arrow)
            .setRotation(angle)
            .setDepth(29);
        return { planet, bg, arrow };
    }
}
