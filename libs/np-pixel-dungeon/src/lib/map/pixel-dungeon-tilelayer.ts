import { EDirection, NPVec2 } from '@shared/np-library';
import * as Phaser from 'phaser';

import { TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonRoom } from '../dungeon/pixel-dungeon.room';
import { PixelDungeonTile } from '../dungeon/pixel-dungeon.tile';
import { NPTilesetMapping } from './pixel-dungeon.map';
import { PixelDungeonTileset } from './pixel-dungeon-tileset';

export class PixelDungeonTilelayer {
    #map: Phaser.Tilemaps.Tilemap;
    #tilelayer: Phaser.Tilemaps.TilemapLayer;
    #tileset: PixelDungeonTileset;

    constructor(name: string, scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, tileset: PixelDungeonTileset) {
        this.#map = map;
        this.#tileset = tileset;
        this.#tilelayer = this.#map.createBlankLayer(name, tileset.tileset);
        this.#tilelayer.setScale(1);
        this.#tilelayer.setCollisionByExclusion([
            ...this.#tileset.getTileIndexes('FLOOR'),
            ...this.#tileset.getTileIndexes('DOOR'),
        ]);
    }

    get tileset() {
        return this.#tileset;
    }

    putTileAt(tile: TDungeonTile | NPVec2, key: keyof NPTilesetMapping) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.x, tile.y);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.x, tile.y, 1, 1);
        }
    }

    protected putPixeldungeonTileAt(tile: PixelDungeonTile, key: keyof NPTilesetMapping) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.tileX, tile.tileY);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.tileX, tile.tileY, 1, 1);
        }
    }

    mapDungeonToLayer(dungeon: PixelDungeon) {
        for (const junction of dungeon.junctions) {
            if (!junction.vertical) {
                this.putTileAt(junction.pos, junction.toTileIndex());
                const right = junction.pos.addDirection(EDirection.E);
                const left = junction.pos.addDirection(EDirection.W);
                const top = junction.pos.addDirection(EDirection.N);
                this.putTileAt(top, 'CROSS_WALL');
                this.#tilelayer.putTileAt(194, right.x, right.y - 1);
                this.#tilelayer.putTileAt(193, left.x, left.y - 1);
            } else {
                const top = junction.pos.addDirection(EDirection.N);
                const bottom = junction.pos;
                this.#tilelayer.putTileAt(88, top.x, top.y);
                this.#tilelayer.putTileAt(215, bottom.x, bottom.y);
            }
        }
        //
        // for (const tile of dungeon) {
        //     if (tile.type === ETileType.room) {
        //         start = tile;
        //     } else {
        //         if (!this.#tilelayer.hasTileAt(tile.x, tile.y))
        //             this.#putTileAt(tile, this.#tileset.mapTileToTileIndex(tile.type));
        //     }
        //     this.#tilelayer.getTileAt(tile.x, tile.y).alpha = 1;
        // }
    }

    #mapDungeonRoomToTilemap(room: PixelDungeonRoom) {
        for (const tile of room) {
            // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
            this.putPixeldungeonTileAt(tile, 'ROOM');
        }
        // this.#putPixeldungeonTileAt(room.topLeft(), 'TOP_LEFT_WALL');
        // this.#putPixeldungeonTileAt(room.topRight(), 'TOP_RIGHT_WALL');
    }

    get tilelayer() {
        return this.#tilelayer;
    }
}
