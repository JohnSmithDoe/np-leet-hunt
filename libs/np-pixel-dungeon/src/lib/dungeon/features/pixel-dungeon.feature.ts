import { NPSprite } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import ChessData from 'phaser4-rex-plugins/plugins/board/chess/ChessData';

import { EFeatureKind, NPSceneWithBoard } from '../../@types/pixel-dungeon.types';

/**
 * A world-content feature placed by the post-carve {@link PixelDungeonDecorator} (RPG cluster C) — the
 * shared base for stairs, and (later, #14/#16) traps, chests, keys and boss markers. A feature is an
 * *entity*, not a tile: it rides the `ChessLayer.features` band on TOP of the unchanged floor, so adding
 * one never touches `ETileType` or the autotiler. Modelled on {@link PixelDungeonItem} — same board-chess
 * shape, same scene-scoped lifetime (the dungeon scene is non-persistent and rebuilt each entry).
 *
 * Each subclass declares:
 *  - its {@link EFeatureKind} ({@link kind}) — what the engine's trigger reads to decide what stepping on
 *    it means (e.g. `stairs-down` ⇒ objective met);
 *  - its {@link blocks} choice — whether it obstructs movement / A\* pathfinding. Stairs are NON-blocking
 *    (walkable); a future locked chest would block. The level reads this when registering the chess.
 *
 * Visual: a deliberate **placeholder glyph** baked to a generated texture (see {@link ensureTexture}),
 * which needs no spritesheet, no Tiled role, and no autotiler involvement — so a new feature kind renders
 * instantly. The glyph + colour are owned by each subclass via {@link glyph} / {@link color}.
 * TODO (cluster C real art): swap the glyph for proper per-feature art via a `tilesetRole` on the feature
 * + a `STAIRS_DOWN`/`TRAP`/… role in `PixelDungeon.tsj` + `REQUIRED_ROLES`, the way wall/floor tiles work.
 */
export abstract class PixelDungeonFeature extends NPSprite {
    // Injected by the rex board plugin via `board.addChess`, exactly like mobs / tiles / items carry it.
    rexChess!: ChessData;

    /** What kind of feature this is — the engine's step-trigger switches on this. */
    abstract readonly kind: EFeatureKind;
    /** Whether the feature obstructs movement / pathfinding. Stairs: `false` (walkable). */
    abstract readonly blocks: boolean;

    /** The placeholder glyph drawn on the floor (e.g. `>` for stairs-down). */
    protected abstract readonly glyph: string;
    /** The glyph colour as a `0xRRGGBB` number. */
    protected abstract readonly color: number;

    // The tile the decorator chose for this feature; the level reads it to place the chess.
    #tileX = 0;
    #tileY = 0;

    constructor(scene: NPSceneWithBoard) {
        super(scene, 0, 0);
        this.setOrigin(0.5);
    }

    get tileX(): number {
        return this.#tileX;
    }

    get tileY(): number {
        return this.#tileY;
    }

    /**
     * Record the tile the decorator placed this feature on. The subclass texture is generated lazily here
     * (now that `glyph`/`color` are available on the constructed instance) rather than in the base ctor,
     * which would run before the subclass fields are initialised.
     */
    place(tileX: number, tileY: number): this {
        this.#tileX = tileX;
        this.#tileY = tileY;
        this.setTexture(this.#ensureTexture());
        this.setDisplaySize(12, 12);
        return this;
    }

    /**
     * Lazily generate (once per glyph+colour) a small texture of the placeholder glyph and return its key.
     * Phaser textures are global to the texture manager, so keying by glyph+colour de-duplicates: every
     * stairs-down feature shares one `>` texture. A `Text` object is rendered into an off-screen
     * `RenderTexture`, which `saveTexture`s under the key; both the temp text and the render texture are
     * then destroyed — only the saved texture lives on. (`Text` has no `generateTexture`; this is the
     * Text→texture route that does, keeping the placeholder a real glyph rather than a hand-drawn shape.)
     */
    #ensureTexture(): string {
        const key = `pd-feature-${this.glyph}-${this.color.toString(16)}`;
        if (this.scene.textures.exists(key)) return key;
        const text = this.scene.make.text(
            {
                x: 0,
                y: 0,
                text: this.glyph,
                style: {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: Phaser.Display.Color.IntegerToColor(this.color).rgba,
                    stroke: '#000000',
                    strokeThickness: 2,
                },
            },
            false
        );
        const width = Math.max(1, Math.ceil(text.width));
        const height = Math.max(1, Math.ceil(text.height));
        const renderTexture = this.scene.make.renderTexture({ x: 0, y: 0, width, height }, false);
        renderTexture.draw(text, 0, 0);
        renderTexture.saveTexture(key);
        text.destroy();
        renderTexture.destroy();
        return key;
    }
}
