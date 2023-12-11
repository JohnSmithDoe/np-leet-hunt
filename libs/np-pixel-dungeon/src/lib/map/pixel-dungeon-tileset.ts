import { ETileType } from '../@types/pixel-dungeon.types';
import { NPTilemapConfig, NPTilesetMapping, NPTilesetMappingNew } from './pixel-dungeon.map';

export class PixelDungeonTileset {
    #map: Phaser.Tilemaps.Tilemap;
    #tileset: Phaser.Tilemaps.Tileset;
    #config: NPTilemapConfig;

    constructor(map: Phaser.Tilemaps.Tilemap, config: NPTilemapConfig) {
        this.#map = map;
        this.#config = config;
        this.#tileset = this.#map.addTilesetImage(
            this.#config.key,
            this.#config.key,
            this.#config.tileWidth,
            this.#config.tileHeight,
            this.#config.tileSetMargin,
            this.#config.tileSetSpacing
        );
    }

    mapTileToTileIndex(type: ETileType): keyof NPTilesetMapping {
        switch (type) {
            case ETileType.none:
                return 'EMPTY';
            case ETileType.floor:
                return 'FLOOR';
            case ETileType.junction:
                return 'DOOR';
            case ETileType.wall:
                return 'TOP_WALL';
        }
    }

    get tileset() {
        return this.#tileset;
    }

    mapping(key: keyof NPTilesetMappingNew) {
        return this.#config.mapping[key];
    }

    getTileIndexes(key: keyof NPTilesetMapping) {
        const mappingElement = this.#config.mapping[key];
        return typeof mappingElement === 'number' ? [mappingElement] : mappingElement.map(({ index }) => index);
    }

    getFirstTileIndex(key: keyof NPTilesetMapping) {
        return this.getTileIndexes(key)[0];
    }
}
