import { NPRNG } from '@shared/np-library';
import { fadeOut, NPGameObjectList, NPScene, slideTo, swell } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { PARADROID_IMAGES } from './paradroid.image';

/** Scene-owned steps the splash triggers at the right beats — keeps board/camera ownership in the scene. */
export interface ParadroidIntroHooks {
    /** Fade the (hidden) board in over `durationMs`, synced with the VS crossfade-out. */
    revealBoard: (durationMs: number) => void;
    /** The splash is fully gone — start the match (the board is already on-screen at its picked size). */
    onComplete: () => void;
}

const SLIDE_MS = 450; // portraits charging in from the sides
const VS_STAMP_MS = 260; // "VS" punching in
const VS_HOLD_MS = 520; // beat to enjoy the shake before crossfading to the board
const CROSSFADE_MS = 450; // VS splash out / board in
const FIGHT_IN_MS = 320; // "FIGHT!" punching in over the live board
const FIGHT_HOLD_MS = 1500; // the "show it bigger" beat — lingers and slowly swells
const FIGHT_OUT_MS = 360; // blow up past the viewport and vanish

/**
 * The classic Street-Fighter "VS" splash, played between locking the grid in and the duel beginning:
 *
 *   portraits slide in → "VS" stamps with a screen shake → the VS splash crossfades out while the
 *   board fades in → a big "FIGHT!" punches in over the live board, lingers ~1.5s → it blows up out
 *   of the viewport and vanishes → the match starts.
 *
 * Registered as a scene component only so its textures preload at boot; the visuals are built fresh on
 * every {@link play}. It lays out over the **camera's current world view** (passed in as `view`) rather
 * than raw `scale.gameSize`: the scene keeps the camera at the board-fit it had during selection and never
 * zooms it, so the board is revealed at exactly the size the player picked — it never changes size. Because
 * `view` is the world rect the camera maps to the full screen, the splash still fills the screen at any zoom.
 */
export class ParadroidIntro extends NPGameObjectList {
    #view!: Phaser.Geom.Rectangle; // the camera's world view to lay the splash out over (set per play)

    constructor(scene: NPScene) {
        super(scene);
    }

    /** Load the splash textures up front (called via the scene's component lifecycle). */
    override preload() {
        this.scene.load.spritesheet(PARADROID_IMAGES.vsPlayerFemale);
        this.scene.load.image(PARADROID_IMAGES.vsImage);
        this.scene.load.image(PARADROID_IMAGES.vsDroid);
        this.scene.load.image(PARADROID_IMAGES.vsFight);
    }

    /** Play the VS splash over `view` (the camera's world view), driving the scene through `hooks`. */
    play(view: Phaser.Geom.Rectangle, hooks: ParadroidIntroHooks) {
        this.#view = view;
        const { x: ox, width, height } = view;
        const cx = view.centerX;
        const cy = view.centerY;

        // The VS splash (backdrop + portraits + "VS") lives in one group so it can crossfade out as a unit.
        const vsGroup = new Phaser.GameObjects.Container(this.scene, 0, 0, []);
        this.scene.addExisting(vsGroup);

        const backdrop = this.scene.add.rectangle(cx, cy, width, height, 0x02060a, 0.92).setOrigin(0.5);
        const player = this.#portrait('vsPlayerFemale', NPRNG.inRange(0, 20));
        const droid = this.#portrait('vsDroid').setFlipX(true); // face the player
        const vs = this.scene.add.image(cx, cy, PARADROID_IMAGES.vsImage.key).setOrigin(0.5);
        this.#fitHeight(player, height * 0.5);
        this.#fitHeight(droid, height * 0.5);
        this.#fitHeight(vs, height * 0.28);
        player.setPosition(ox - width * 0.3, cy); // charged off the left edge of the view
        droid.setPosition(ox + width * 1.3, cy); // ...and off the right edge
        vs.setScale(vs.scaleX * 3).setAlpha(0); // charged up + invisible until it stamps in
        vsGroup.add([backdrop, player, droid, vs]);

        // Portraits charge in from opposite sides (slideTo's springy Back.easeOut is the charge-in feel)...
        slideTo(player, { x: ox + width * 0.27, duration: SLIDE_MS });
        slideTo(droid, {
            x: ox + width * 0.73,
            duration: SLIDE_MS,
            onComplete: () => this.#stampVs(vsGroup, vs, hooks),
        });
    }

    /** The "VS" punches in over the portraits with a screen shake, then crossfades to the board. */
    #stampVs(vsGroup: Phaser.GameObjects.Container, vs: Phaser.GameObjects.Image, hooks: ParadroidIntroHooks) {
        const targetScale = vs.scaleX / 3; // undo the 3x charge-up scale set in play()
        this.scene.tweens.add({
            targets: vs,
            scaleX: targetScale,
            scaleY: targetScale,
            alpha: 1,
            ease: 'Back.easeOut',
            duration: VS_STAMP_MS,
            onComplete: () => {
                this.scene.cameras.main.shake(280, 0.012);
                this.scene.time.delayedCall(VS_HOLD_MS, () => this.#crossfade(vsGroup, hooks));
            },
        });
    }

    /** Fade the VS splash out while the scene fades the board in, then hand off to the FIGHT beat. */
    #crossfade(vsGroup: Phaser.GameObjects.Container, hooks: ParadroidIntroHooks) {
        hooks.revealBoard(CROSSFADE_MS);
        fadeOut(vsGroup, {
            ease: 'Sine.easeInOut',
            duration: CROSSFADE_MS,
            onComplete: () => {
                vsGroup.destroy(true); // destroy children too
                this.#fight(hooks);
            },
        });
    }

    /** Punch the big "FIGHT!" image in over the now-visible board, let it linger and swell. */
    #fight(hooks: ParadroidIntroHooks) {
        const { centerX, centerY, height } = this.#view;
        const fight = this.scene.add.image(centerX, centerY, PARADROID_IMAGES.vsFight.key).setOrigin(0.5);
        this.#fitHeight(fight, height * 0.6);
        const restScale = fight.scaleX;
        fight.setScale(restScale * 0.2).setAlpha(0);

        this.scene.tweens.add({
            targets: fight,
            scaleX: restScale,
            scaleY: restScale,
            alpha: 1,
            ease: 'Back.easeOut',
            duration: FIGHT_IN_MS,
            onComplete: () => {
                // Linger and slowly swell over the live board for the "show it bigger" beat...
                swell(fight, { duration: FIGHT_HOLD_MS, onComplete: () => this.#fightOut(fight, restScale, hooks) });
            },
        });
    }

    /** ...then blow the "FIGHT!" up past the viewport edges, vanish, and start the match. */
    #fightOut(fight: Phaser.GameObjects.Image, restScale: number, hooks: ParadroidIntroHooks) {
        this.scene.tweens.add({
            targets: fight,
            scaleX: restScale * 3.2,
            scaleY: restScale * 3.2,
            alpha: 0,
            ease: 'Quad.easeIn',
            duration: FIGHT_OUT_MS,
            onComplete: () => {
                fight.destroy();
                hooks.onComplete();
            },
        });
    }

    #portrait(image: 'vsPlayerFemale' | 'vsDroid', frame?: number): Phaser.GameObjects.Image {
        return this.scene.add.image(0, 0, PARADROID_IMAGES[image].key, frame).setOrigin(0.5);
    }

    /** Scale an image to a target on-screen height, preserving aspect ratio. */
    #fitHeight(image: Phaser.GameObjects.Image, targetHeight: number) {
        image.setScale(targetHeight / image.height);
    }
}
