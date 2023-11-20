import { NPVec2 } from '@shared/np-library';
import * as Phaser from 'phaser';

import { ETileType, TDungeonTile } from '../@types/pixel-dungeon.types';
import { NPTilesetMapping } from '../sprites/pixel-dungeon.map';
import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonRoom } from './pixel-dungeon.room';
import { PixelDungeonTile } from './pixel-dungeon.tile';
import { PixelDungeonTileset } from './pixel-dungeon-tileset';

export class PixelDungeonTilelayer {
    #map: Phaser.Tilemaps.Tilemap;
    #tilelayer: Phaser.Tilemaps.TilemapLayer;
    #tileset: PixelDungeonTileset;

    constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, tileset: PixelDungeonTileset) {
        this.#map = map;
        this.#tileset = tileset;
        this.#tilelayer = this.#map.createBlankLayer('Layer 1', tileset.tileset);
        this.#tilelayer.setScale(1);
        this.#tilelayer.setInteractive({ useHandcursor: true });
        this.#tilelayer.setCollisionByExclusion([6, 7, 8, 26, ...this.#tileset.getTileIndexes('DOOR')]);
        scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#tilelayer.off(Phaser.Input.Events.POINTER_UP);
        });
    }

    #putTileAt(tile: TDungeonTile | NPVec2, key: keyof NPTilesetMapping) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.x, tile.y);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.x, tile.y, 1, 1);
        }
    }

    #putPixeldungeonTileAt(tile: PixelDungeonTile, key: keyof NPTilesetMapping) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.tileX, tile.tileY);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.tileX, tile.tileY, 1, 1);
        }
    }

    mapDungeonToLayer(dungeon: PixelDungeon) {
        console.log(this.#tilelayer);

        let start: TDungeonTile;
        for (const room of dungeon.rooms) {
            this.#mapDungeonRoomToTilemap(room);
        }
        for (const junction of dungeon.junctions) {
            this.#putTileAt(junction.pos, junction.toTileIndex());
        }

        for (const tile of dungeon) {
            if (tile.type === ETileType.room) {
                start = tile;
            } else {
                if (!this.#tilelayer.hasTileAt(tile.x, tile.y))
                    this.#putTileAt(tile, this.#tileset.mapTileToTileIndex(tile.type));
            }
            this.#tilelayer.getTileAt(tile.x, tile.y).alpha = 0;
        }
        return start;
    }

    #mapDungeonRoomToTilemap(room: PixelDungeonRoom) {
        for (const tile of room) {
            // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
            this.#putPixeldungeonTileAt(tile, 'ROOM');
        }
        // this.#putPixeldungeonTileAt(room.topLeft(), 'TOP_LEFT_WALL');
        // this.#putPixeldungeonTileAt(room.topRight(), 'TOP_RIGHT_WALL');
    }

    get tilelayer() {
        return this.#tilelayer;
    }
}
