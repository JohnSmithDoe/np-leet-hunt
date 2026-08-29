import { EFeatureKind, NPSceneWithBoard } from '../../@types/pixel-dungeon.types';
import { PixelDungeonFeature } from './pixel-dungeon.feature';

/**
 * The exit stairs (RPG cluster C, step 0). Placed by the {@link PixelDungeonDecorator} in the room
 * farthest from the start; the engine's `mob:entered-tile` trigger reads {@link kind} === `stairs-down`
 * to complete the run when the *player* steps onto it.
 *
 * **Non-blocking**: the player must be able to walk onto the stairs (and A\* must route there), so
 * {@link blocks} is `false` — the level never sets a rex blocker for it. Visual is the placeholder `>`
 * glyph (the classic roguelike down-stairs mark); real stair art is the cluster-C art TODO on the base.
 */
export class StairsFeature extends PixelDungeonFeature {
    readonly kind = EFeatureKind.stairsDown;
    readonly blocks = false;

    protected readonly glyph = '>';
    // A bright cyan reads clearly against the dim dungeon floor; placeholder only (see base art TODO).
    protected readonly color = 0x4dd3f6;

    constructor(scene: NPSceneWithBoard) {
        super(scene);
    }
}
