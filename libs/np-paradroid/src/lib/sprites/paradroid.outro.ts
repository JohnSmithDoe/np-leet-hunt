import { TEXT } from '@shared/np-config';
import { NPRNG } from '@shared/np-library';
import { centeredText, fadeIn, fadeTo, NPGameObjectList, NPScene, popIn, slideTo } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { TParadroidMatchResult } from '../core/paradroid.game';
import { PARADROID_IMAGES } from './paradroid.image';

const APPEAR_MS = 420; // backdrop + both portraits settle in over the cleared board
const HOLD_MS = 320; // a beat with both fighters up before the verdict resolves
const RESOLVE_MS = 760; // loser drops off-screen while the winner moves to centre and grows
const STAMP_MS = 300; // the WINNER / PROMOTED banner punching in
const FINISH_HOLD_MS = 950; // let the promotion read before handing control back to the scene
const PROMOTE_SCALE = 1.4; // how much the winner swells when promoted to the centre

/** Scene-owned hand-back for the outro — mirrors {@link ParadroidIntroHooks}. */
export interface ParadroidOutroHooks {
    /** The promotion has played out — the scene now reveals the "return to map" control. */
    onComplete: () => void;
}

/**
 * The duel's ending animation (Leet-40) — a bookend to {@link ParadroidIntro}'s VS splash. Built fresh on
 * every {@link play} over the cleared board (the scene hides the board and holds the camera at a neutral
 * 1:1 view, same as the intro), so it lays out in plain `scale.gameSize` screen coordinates:
 *
 *   both portraits fade up → the **loser drops out of the bottom** of the screen, tumbling and fading,
 *   while the **winner slides to the centre and swells** (is promoted) → a "WINNER — PROMOTED" banner
 *   stamps in with a screen shake over the final score → a beat, then control hands back to the scene.
 *
 * A draw skips the drop: both hold and a "DRAW" banner stamps in. Registered as a scene component only so
 * its portraits preload at boot; the textures are shared with the VS intro (loaded once).
 */
export class ParadroidOutro extends NPGameObjectList {
    constructor(scene: NPScene) {
        super(scene);
    }

    /** Portraits are shared with the VS intro; request them only if the intro hasn't already loaded them. */
    override preload() {
        if (!this.scene.textures.exists(PARADROID_IMAGES.vsPlayerFemale.key)) {
            this.scene.load.spritesheet(PARADROID_IMAGES.vsPlayerFemale);
        }
        if (!this.scene.textures.exists(PARADROID_IMAGES.vsDroid.key)) {
            this.scene.load.image(PARADROID_IMAGES.vsDroid);
        }
    }

    /** Play the ending animation for a decided (or drawn) match, then run `hooks.onComplete`. */
    play(result: TParadroidMatchResult, hooks: ParadroidOutroHooks) {
        const { width, height } = this.scene.scale.gameSize;
        const cy = height / 2;

        const group = new Phaser.GameObjects.Container(this.scene, 0, 0, []);
        this.scene.addExisting(group);
        const backdrop = this.scene.add.rectangle(width / 2, cy, width, height, 0x02060a, 0).setOrigin(0.5);
        const player = this.#portrait('vsPlayerFemale', NPRNG.inRange(0, 20)).setPosition(width * 0.27, cy);
        const droid = this.#portrait('vsDroid')
            .setFlipX(true)
            .setPosition(width * 0.73, cy);
        this.#fitHeight(player, height * 0.5);
        this.#fitHeight(droid, height * 0.5);
        player.setAlpha(0);
        droid.setAlpha(0);
        group.add([backdrop, player, droid]);

        fadeTo(backdrop, 0.92, { duration: APPEAR_MS });
        fadeIn([player, droid], {
            duration: APPEAR_MS,
            onComplete: () =>
                this.scene.time.delayedCall(HOLD_MS, () => this.#resolve(result, player, droid, group, hooks)),
        });
    }

    /** Drop the loser, promote the winner to the centre, then stamp the verdict banner (or "DRAW"). */
    #resolve(
        result: TParadroidMatchResult,
        player: Phaser.GameObjects.Image,
        droid: Phaser.GameObjects.Image,
        group: Phaser.GameObjects.Container,
        hooks: ParadroidOutroHooks
    ) {
        const { width, height } = this.scene.scale.gameSize;
        const cx = width / 2;
        const cy = height / 2;

        if (result.winner === 'draw') {
            this.#banner(group, cx, cy - height * 0.34, 'DRAW', result, TEXT.duelBannerDraw);
            this.scene.time.delayedCall(STAMP_MS + FINISH_HOLD_MS, () => hooks.onComplete());
            return;
        }

        const winnerIsPlayer = result.winner === 'player';
        const winner = winnerIsPlayer ? player : droid;
        const loser = winnerIsPlayer ? droid : player;
        const promoted = winner.scale * PROMOTE_SCALE;

        // The loser tumbles out of the bottom of the screen and fades.
        this.scene.tweens.add({
            targets: loser,
            y: height * 1.5,
            angle: winnerIsPlayer ? 28 : -28,
            alpha: 0.15,
            ease: 'Back.easeIn',
            duration: RESOLVE_MS,
        });
        // The winner slides to the centre and swells — promoted.
        slideTo(winner, {
            x: cx,
            y: cy * 0.96,
            scale: promoted,
            ease: 'Cubic.easeInOut',
            duration: RESOLVE_MS,
            onComplete: () => {
                this.scene.cameras.main.shake(220, 0.01);
                this.#banner(
                    group,
                    cx,
                    cy - height * 0.34,
                    winnerIsPlayer ? 'WINNER — PROMOTED' : 'DROID WINS',
                    result,
                    winnerIsPlayer ? TEXT.duelBannerWin : TEXT.duelBannerLose
                );
                this.scene.time.delayedCall(STAMP_MS + FINISH_HOLD_MS, () => hooks.onComplete());
            },
        });
    }

    /** Punch in a headline banner with the final score beneath it. */
    #banner(
        group: Phaser.GameObjects.Container,
        x: number,
        y: number,
        label: string,
        result: TParadroidMatchResult,
        style: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        const title = centeredText(this.scene, x, y, label, style);
        const score = centeredText(
            this.scene,
            x,
            y + 92,
            `${result.playerScore} — ${result.droidScore}`,
            TEXT.duelScore
        );
        group.add([title, score]);
        popIn(title, { duration: STAMP_MS }); // stamps in from nothing (was scale 0.2 → 0; visually the same punch)
        fadeIn(score, { duration: STAMP_MS, delay: 120 });
    }

    #portrait(image: 'vsPlayerFemale' | 'vsDroid', frame?: number): Phaser.GameObjects.Image {
        return this.scene.add.image(0, 0, PARADROID_IMAGES[image].key, frame).setOrigin(0.5);
    }

    /** Scale an image to a target on-screen height, preserving aspect ratio. */
    #fitHeight(image: Phaser.GameObjects.Image, targetHeight: number) {
        image.setScale(targetHeight / image.height);
    }
}
