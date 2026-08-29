import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { ChessLayer, TDungeonOptions } from '../@types/pixel-dungeon.types';
import { PixelDungeonBoard } from '../core/pixel-dungeon-board';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMap } from '../map/pixel-dungeon.map';
import { PixelDungeonItem } from '../sprites/pixel-dungeon.item';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonFeature } from './features/pixel-dungeon.feature';
import { PixelDungeonJunction } from './parts/pixel-dungeon.junction';
import { PixelDungeon } from './pixel-dungeon';

export class PixelDungeonLevel {
    scene: NPScene;
    #map: PixelDungeonMap;
    #board: PixelDungeonBoard;

    #dungeon: PixelDungeon;

    constructor(engine: PixelDungeonEngine, options: TDungeonOptions) {
        this.scene = engine.scene;
        // create the level dungeon and map to its parts
        this.#dungeon = new PixelDungeon(options);

        // create a board and a tilemap for the dungeon
        this.#map = new PixelDungeonMap(
            engine,
            {
                width: this.#dungeon.width,
                height: this.#dungeon.height,
            },
            'shattered'
        );
        this.#board = new PixelDungeonBoard(engine, {
            width: this.#dungeon.width,
            height: this.#dungeon.height,
            tileWidth: this.#map.tileset.tileWidth,
            tileHeight: this.#map.tileset.tileHeight,
        });
    }

    preload(): void {
        this.#map.preload();
    }

    create(): void {
        this.#map.create();
        for (const tile of this.#dungeon.all) {
            tile.addToLevel(this.#map, this.#board);
        }
    }

    loseVision(fields: TileXYType[]) {
        this.#map.loseVision(fields);
    }

    gainVision(fields: TileXYType[]) {
        this.#map.gainVision(fields);
    }

    public doors(mobs: PixelDungeonMob[]) {
        for (const mob of mobs) {
            const tile = this.getObjectAt(mob.tile);
            if (tile instanceof PixelDungeonJunction) {
                tile.setOpen(true);
            }
        }
        // for (const junction of this.dungeon.junctions) {
        //     junction.setOpen(!!mobs.find(mob => equalTile(junction.tile, mob.tile)));
        // }
        // this.#objects.mapDungeonToLayer(this.#dungeon);
    }

    public getMobAt(tile: TileXYType) {
        return this.#board.tileXYZToChess(tile.x, tile.y, ChessLayer.mob);
    }

    /** The door / junction at a tile — the engine/features query through the level, never rex directly. */
    public getObjectAt(tile: TileXYType) {
        return this.#board.getObjectAt(tile);
    }

    /** Dropped loot / chest / key at a tile ({@link PixelDungeonItem}), or null if the tile is bare. */
    public getItemAt(tile: TileXYType): PixelDungeonItem | null {
        return this.#board.getItemAt(tile);
    }

    /**
     * Drop an item onto the floor at a tile (RPG cluster A). Registered on the `ChessLayer.items` band so
     * it sits independently of the mob/door/wall bands and `getItemAt` can find it. It is placed
     * **non-blocking**: we never call `rexChess.setBlocker(true)` (the walls do, the items must not), so a
     * pickup never obstructs movement or A\* pathfinding — the player and enemies walk straight over it.
     * `align: true` snaps the disc to the tile centre.
     */
    public addItem(item: PixelDungeonItem, tileX: number, tileY: number) {
        this.#board.addChess(item, tileX, tileY, ChessLayer.items, true);
        this.scene.add.existing(item);
    }

    /**
     * Remove a collected item from the world: drop its chess off the `items` band and destroy the sprite.
     * `removeChess(item, null, null, null, true)` removes by instance and destroys in one call.
     */
    public removeItem(item: PixelDungeonItem) {
        this.#board.removeChess(item, null, null, null, true);
    }

    /** Trap / stairs at a tile ({@link PixelDungeonFeature}), or null if the tile holds no feature. */
    public getFeatureAt(tile: TileXYType): PixelDungeonFeature | null {
        return this.#board.getFeatureAt(tile);
    }

    /**
     * Place a world-content feature onto the floor (RPG cluster C). Mirrors {@link addItem}: registers the
     * feature on the `ChessLayer.features` band (so `getFeatureAt` can find it independently of the
     * mob/item/door bands) and adds the sprite to the scene. Unlike items, the BLOCKER is the feature's own
     * choice ({@link PixelDungeonFeature.blocks}) — stairs are non-blocking/walkable (the player must reach
     * them and A\* must route there), but a future locked chest can block. `align: true` snaps it to centre.
     */
    public addFeature(feature: PixelDungeonFeature, tileX: number, tileY: number) {
        this.#board.addChess(feature, tileX, tileY, ChessLayer.features, true);
        feature.rexChess.setBlocker(feature.blocks);
        this.scene.add.existing(feature);
    }

    /** Remove a feature from the world: drop its chess off the `features` band and destroy the sprite. */
    public removeFeature(feature: PixelDungeonFeature) {
        this.#board.removeChess(feature, null, null, null, true);
    }

    addMob(mob: PixelDungeonMob, tileX: number, tileY: number) {
        this.#board.addChess(mob, tileX, tileY, ChessLayer.mob);
    }

    public moveMob(mob: PixelDungeonMob, tile: TileXYType) {
        this.#board.moveChess(mob, tile.x, tile.y, ChessLayer.mob);
    }

    /**
     * Remove a dead mob from the world (Leet combat spine). Two concerns, kept independent:
     *  1. Logical: drop its chess off the `ChessLayer.mob` band immediately, so its tile *unblocks for
     *     A\** right away — a corpse left on the board permanently blocks pathing (a stated risk).
     *  2. Cosmetic: play the `die` animation, then destroy the sprite once it finishes. The destroy is
     *     gated on the animation, NOT on the logical removal above — so even if the anim is missing or
     *     interrupted we still tear the object down (fallback: destroy now).
     */
    public removeMob(mob: PixelDungeonMob) {
        // Unblock the tile first (logical removal); `destroy: false` keeps the sprite alive to animate.
        this.#board.removeChess(mob, null, null, null, false);

        if (mob.anims?.exists('die')) {
            mob.play('die');
            mob.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => mob.destroy());
        } else {
            mob.destroy();
        }
    }

    public areNeighbors(tile: TileXYType, tile2: TileXYType) {
        return this.#board.areNeighbors(tile, tile2);
    }

    public tileToWorldXY(tile: TileXYType) {
        return this.#map.tilemap.tileToWorldXY(tile.x, tile.y);
    }

    public getRandomEmptyTileXYInRange(tile: TileXYType, radius: number) {
        return this.#board.getRandomEmptyTileXYInRange(tile, radius, ChessLayer.mob);
    }

    public getNeighborChess(tile: TileXYType) {
        return this.#board.getNeighborChess(tile, null) ?? [];
    }

    public getTileAtWorldXY(worldX: number, worldY: number) {
        return this.#map.tilemap.getTileAtWorldXY(worldX, worldY);
    }

    public angleBetween(mob: PixelDungeonMob, target: PixelDungeonMob) {
        return this.#board.angleBetween(mob, target);
    }
    get start(): TileXYType {
        const tile = this.#dungeon.rooms[0].bottomRight();
        return { x: tile.x, y: tile.y };
    }

    /**
     * Every walkable floor tile (room + hallway), as plain coords — the surface on which floor loot may
     * be scattered (RPG cluster A). Walls/junctions are excluded, so an item never lands unreachable.
     */
    public floorTiles(): TileXYType[] {
        return this.#dungeon.floorTiles.map(tile => ({ x: tile.x, y: tile.y }));
    }

    /**
     * Distinct walkable spawn tiles in the starting room: the player on `start`, then as many other
     * room-floor tiles as requested. Room floor is always walkable, so mobs never spawn in a wall.
     */
    public spawnTiles(count: number): TileXYType[] {
        const start = this.start;
        const tiles: TileXYType[] = [start];
        for (const tile of this.#dungeon.rooms[0].tiles) {
            if (tiles.length >= count) break;
            if (tile.x === start.x && tile.y === start.y) continue;
            tiles.push({ x: tile.x, y: tile.y });
        }
        return tiles;
    }
    get board() {
        return this.#board;
    }

    /** The pure generation model (rooms / parts), for the post-carve decorator (RPG cluster C). */
    get dungeon(): PixelDungeon {
        return this.#dungeon;
    }
}
