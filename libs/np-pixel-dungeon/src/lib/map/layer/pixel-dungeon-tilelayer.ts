import * as Phaser from 'phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeonTile } from '../../dungeon/parts/pixel-dungeon.tile';
import { NPTilesetMappingNew, PixelDungeonTileset } from '../pixel-dungeon-tileset';

export class PixelDungeonTilelayer {
    #map: Phaser.Tilemaps.Tilemap;
    #tilelayer: Phaser.Tilemaps.TilemapLayer;
    #tileset: PixelDungeonTileset;

    constructor(name: string, scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, tileset: PixelDungeonTileset) {
        this.#map = map;
        this.#tileset = tileset;
        this.#tilelayer = this.#map.createBlankLayer(name, tileset.tileset);
        this.#tilelayer.setScale(1);
    }

    get tileset() {
        return this.#tileset;
    }

    putTileAt(tile: TileXYType, key: keyof NPTilesetMappingNew) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.x, tile.y);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.x, tile.y, 1, 1);
        }
        // this.#tilelayer.getTileAt(tile.x, tile.y).alpha = 0.5;
    }

    putPixeldungeonTileAt(tile: PixelDungeonTile, key: keyof NPTilesetMappingNew) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.x, tile.y);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.x, tile.y, 1, 1);
        }
        // this.#tilelayer.getTileAt(tile.tileX, tile.tileY).alpha = 0.5;
    }

    get tilelayer() {
        return this.#tilelayer;
    }
}
