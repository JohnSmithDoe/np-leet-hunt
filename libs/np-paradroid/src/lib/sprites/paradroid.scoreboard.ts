import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

const YOU_COLOR = '#7cfc9a'; // player green — matches the outro WIN colour
const DROID_COLOR = '#f6534d'; // droid red — matches the outro DEFEAT colour
const SCORE_COLOR = '#4dd3f6'; // cyan — matches the binary timer / result readout

/**
 * The duel scoreboard (Leet-40 polish). Two jobs:
 *   1. **Orient the player** — "YOU" over their (left) half of the mirrored board and "DROID" over the
 *      droid's (right) half, so it's obvious which side you're building while choosing the grid.
 *   2. **Show the swing** — a live "n — n" middle-row tally during the fight, fed by the game's
 *      `EVENT_SCORE_CHANGED`, so the duel reads as it tips one way or the other.
 *
 * Plain object (no textures → no preload): it builds its own text via `scene.add`, is repositioned over the
 * board's world bounds, and tears itself down on {@link destroy}. The labels show in selection + fight; the
 * score only in the fight (it's a meaningless 0 — 0 while the board is idle).
 */
export class ParadroidScoreboard {
    readonly #scene: NPScene;
    #you?: Phaser.GameObjects.Text;
    #droid?: Phaser.GameObjects.Text;
    #score?: Phaser.GameObjects.Text;

    constructor(scene: NPScene) {
        this.#scene = scene;
    }

    /** (Re)create the labels + score positioned just above `bounds` (the board's world bounds). */
    place(bounds: Phaser.Geom.Rectangle): void {
        this.destroy();
        const y = bounds.top - 6;
        const labelSize = Math.round(bounds.height * 0.06);
        const scoreSize = Math.round(bounds.height * 0.075);
        this.#you = this.#label('YOU', bounds.left + bounds.width * 0.06, y, YOU_COLOR, labelSize).setOrigin(0, 1);
        this.#droid = this.#label('DROID', bounds.right - bounds.width * 0.06, y, DROID_COLOR, labelSize).setOrigin(
            1,
            1
        );
        this.#score = this.#label('0 — 0', bounds.centerX, y, SCORE_COLOR, scoreSize).setOrigin(0.5, 1);
    }

    #label(text: string, x: number, y: number, color: string, fontSizePx: number): Phaser.GameObjects.Text {
        return this.#scene.add.text(x, y, text, {
            fontSize: `${fontSizePx}px`,
            color,
            stroke: '#02110a',
            strokeThickness: 3,
            fontStyle: 'bold',
        });
    }

    /** Update the live middle-row tally (player on the left of the dash, droid on the right). */
    setScore(player: number, droid: number): void {
        this.#score?.setText(`${player} — ${droid}`);
    }

    /** Toggle the orientation labels and the live score independently. */
    show(labels: boolean, score: boolean): void {
        this.#you?.setVisible(labels);
        this.#droid?.setVisible(labels);
        this.#score?.setVisible(score);
    }

    /** Keep the scoreboard drawn above a freshly re-rolled board. */
    bringToTop(): void {
        [this.#you, this.#droid, this.#score].forEach(text => text && this.#scene.children.bringToTop(text));
    }

    destroy(): void {
        [this.#you, this.#droid, this.#score].forEach(text => text?.destroy());
        this.#you = undefined;
        this.#droid = undefined;
        this.#score = undefined;
    }
}
