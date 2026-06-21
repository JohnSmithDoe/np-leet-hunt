import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPText } from '../sprites/np-text';

/**
 * Generic, project-agnostic text helpers — readable layout sugar over `new NPText(...)` + add-to-scene.
 * They own *layout* only (placement, origin, casing); the *styles* are passed in (the game keeps its
 * style registry in `@shared/np-config`). Pair them like `centeredText(scene, x, y, 'WINNER', TEXT.duelBannerWin)`.
 */

/** Create an {@link NPText}, add it to the scene, and return it. The base the others build on. */
export function npText(
    scene: NPScene,
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle
): NPText {
    const label = new NPText(scene, x, y, text, style);
    scene.addExisting(label);
    return label;
}

/** Text centred on its position (origin 0.5) — the common case for titles, banners and labels. */
export function centeredText(
    scene: NPScene,
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle
): NPText {
    return npText(scene, x, y, text, style).setOrigin(0.5);
}

/** Uppercased (a pure text transform), centred — for stamps and headings that should always shout. */
export function capitalText(
    scene: NPScene,
    x: number,
    y: number,
    text: string,
    style?: Phaser.Types.GameObjects.Text.TextStyle
): NPText {
    return centeredText(scene, x, y, text.toUpperCase(), style);
}
