import { ItemDef, PALETTE } from '@shared/np-config';
import { NPSprite } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import ChessData from 'phaser4-rex-plugins/plugins/board/chess/ChessData';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';

/**
 * A pickup lying on the dungeon floor (RPG cluster A). Scene-scoped and transient: spawned on
 * `engine.create`, auto-collected when the player steps onto its tile, and torn down when the scene
 * dies. Its `id` is the only thing that survives the run — carried out in `DungeonResult.loot` — so a
 * `PixelDungeonItem` NEVER leaks into np-state (which speaks only item-id strings).
 *
 * It carries its full {@link ItemDef} so the pickup floater can show the label and the auto-pickup can
 * read the kind/value without a second catalog lookup.
 *
 * Visual: a small coloured disc, drawn from a generated circle texture (see {@link ensureTexture}). This
 * is a deliberate **placeholder** — robust because it needs no spritesheet, no Tiled role, and no
 * autotiler involvement, so new catalog items render instantly.
 * TODO (items phase 2): swap the disc for proper per-item art via a `tilesetRole` on `ItemDef` + a
 * `COIN`/`POTION`/… role in `PixelDungeon.tsj` + `REQUIRED_ROLES`, the way the wall/floor tiles work.
 */
export class PixelDungeonItem extends NPSprite {
    // Injected by the rex board plugin via `board.addChess`, the same way mobs/tiles carry their chess.
    rexChess!: ChessData;

    constructor(
        scene: NPSceneWithBoard,
        public readonly def: ItemDef
    ) {
        super(scene, 0, 0, PixelDungeonItem.ensureTexture(scene, def));
        // Centre the disc on the tile and keep it small (a token on the floor, well under the 20px mobs).
        this.setOrigin(0.5);
        this.setDisplaySize(8, 8);
    }

    /**
     * Lazily generate (once per colour) a tiny filled-circle texture and return its key. Phaser textures
     * are global to the texture manager, so keying by colour de-duplicates: every coin shares one disc
     * texture. A `Graphics` object draws the circle, bakes it to a texture, then is destroyed — only the
     * texture lives on. The colour is the item's role colour from the shared {@link PALETTE} (coins gold,
     * heals green, everything else a neutral muted tone), so the placeholder still reads at a glance.
     */
    private static ensureTexture(scene: Phaser.Scene, def: ItemDef): string {
        const color = PixelDungeonItem.colorFor(def);
        const key = `pd-item-${color.toString(16)}`;
        if (scene.textures.exists(key)) return key;
        const radius = 8;
        const g = scene.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(color, 1);
        g.fillCircle(radius, radius, radius);
        g.lineStyle(1, 0x000000, 0.5);
        g.strokeCircle(radius, radius, radius);
        g.generateTexture(key, radius * 2, radius * 2);
        g.destroy();
        return key;
    }

    /** The placeholder disc colour for an item kind, drawn from the shared palette. */
    private static colorFor(def: ItemDef): number {
        const hex =
            def.kind === 'coin' ? PALETTE.amber : def.effect?.heal !== undefined ? PALETTE.heal : PALETTE.hudMuted;
        return Phaser.Display.Color.HexStringToColor(hex).color;
    }
}
