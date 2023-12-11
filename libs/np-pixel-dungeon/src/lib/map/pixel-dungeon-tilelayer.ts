import { NPVec2 } from '@shared/np-library';
import * as Phaser from 'phaser';

import { TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonTile } from '../dungeon/pixel-dungeon.tile';
import { NPTilesetMappingNew, PixelDungeonTileset } from './pixel-dungeon-tileset';

export abstract class PixelDungeonTilelayer {
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

    putTileAt(tile: TDungeonTile | NPVec2, key: keyof NPTilesetMappingNew) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.x, tile.y);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.x, tile.y, 1, 1);
        }
    }

    protected putPixeldungeonTileAt(tile: PixelDungeonTile, key: keyof NPTilesetMappingNew) {
        const mappingElement = this.#tileset.mapping(key);
        if (typeof mappingElement === 'number') {
            this.#tilelayer.putTileAt(mappingElement, tile.tileX, tile.tileY);
        } else {
            this.#tilelayer.weightedRandomize(mappingElement, tile.tileX, tile.tileY, 1, 1);
        }
        this.#tilelayer.getTileAt(tile.tileX, tile.tileY);
    }

    abstract mapDungeonToLayer(dungeon: PixelDungeon): void;

    get tilelayer() {
        return this.#tilelayer;
    }
}
