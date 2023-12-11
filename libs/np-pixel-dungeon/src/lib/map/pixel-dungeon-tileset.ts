// Tile index mapping to make the code more readable
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NPTileIndex = number;

interface NPWeightedTileIndex {
    index: NPTileIndex;
    weight: number;
}

type NPTilesetMap = NPTileIndex | NPWeightedTileIndex[];

export interface NPTilesetMappingNew {
    WALL_TOP_OUTER: NPTilesetMap;
    WALL_TOP: NPTilesetMap;
    WALL_VERT: NPTilesetMap;
    WALL_VERT_T: NPTilesetMap;
    WALL_TOP_STITCH: NPTilesetMap;
    WALL_TOP_LEFT_STITCH: NPTilesetMap;
    WALL_TOP_RIGHT_STITCH: NPTilesetMap;
    WALL_TOP_DEADEND_STITCH: NPTilesetMap;
    WALL_TOP_RIGHT: NPTilesetMap;
    WALL_TOP_LEFT: NPTilesetMap;
    WALL_BOTTOM: NPTilesetMap;
    WALL_LEFT: NPTilesetMap;
    WALL_LEFT_TOP: NPTilesetMap;
    WALL_LEFT_BOTTOM: NPTilesetMap;
    WALL_RIGHT: NPTilesetMap;
    WALL_RIGHT_TOP: NPTilesetMap;
    WALL_RIGHT_BOTTOM: NPTilesetMap;

    // WALL_TOP_LEFT: NPTilesetMap;
    // TOP_RIGHT: NPTilesetMap;
    // BOTTOM_RIGHT: NPTilesetMap;
    // BOTTOM_LEFT: NPTilesetMap;
    //
    // DOOR_VERTICAL: NPTilesetMap;
    // DOOR_HORIZONTAL: NPTilesetMap;
    //
    DOOR: NPTilesetMap;
    EMPTY: NPTilesetMap;
    FLOOR: NPTilesetMap;
    ROOM: NPTilesetMap;
}

export type TNPTilesetKey = 'example' | 'shattered';
type NPTilesetConfig = Phaser.Types.Tilemaps.TilemapConfig & {
    tileSetImage: string;
    tileSetMargin: number;
    tileSetSpacing: number;
    mapping: NPTilesetMappingNew;
};
const TILESETS: Record<TNPTilesetKey, NPTilesetConfig> = {
    // Credits! Michele "Buch" Bucelli (tilset artist) & Abram Connelly (tileset sponser)
    // https://opengameart.org/content/top-down-dungeon-tileset
    example: {
        tileWidth: 16,
        tileHeight: 16,
        key: 'buch',
        tileSetImage: 'np-pixel-dungeon/buch-dungeon-tileset-extruded.png',
        tileSetMargin: 1,
        tileSetSpacing: 2,
        mapping: {
            WALL_LEFT_TOP: 101,
            WALL_LEFT_BOTTOM: 120,
            WALL_TOP_OUTER: 120,
            WALL_VERT: 120,
            WALL_TOP_STITCH: 120,
            WALL_VERT_T: 120,
            WALL_TOP_LEFT_STITCH: 120,
            WALL_TOP_RIGHT_STITCH: 120,
            WALL_TOP_DEADEND_STITCH: 120,
            WALL_RIGHT_TOP: 102,
            WALL_RIGHT_BOTTOM: 121,
            WALL_TOP_RIGHT: 152,
            WALL_TOP_LEFT: 152,
            // CORNER_BOTTOM_RIGHT_OUTSIDE: 152,
            EMPTY: 20,
            // DOOR_VERT: 105,
            // DOOR_HORIZ: 84,
            DOOR: [
                { index: 118, weight: 4 },
                { index: 105, weight: 1 },
                { index: 84, weight: 1 },
            ],
            // LEFT_DOOR: 118,
            // BOTTOM_DOOR: 118,
            // TOP_T_WALL: 103,
            // LEFT_DEADEND_WALL: 82,
            // RIGHT_DEADEND_WALL: 85,
            // TOP_DEADEND_WALL: 86,
            // BOTTOM_DEADEND_WALL: 143,
            // BOTTOM_T_WALL: 123,
            // RIGHT_T_WALL: 104,
            // LEFT_T_WALL: 122,
            // CROSS_WALL: 142,
            // STRAIGHT_WALL_VERT: 124,
            // STRAIGHT_WALL_HORIZ: 83,
            WALL_TOP: [
                { index: 39, weight: 4 },
                { index: 57, weight: 1 },
                { index: 58, weight: 1 },
                { index: 59, weight: 1 },
            ],
            WALL_LEFT: [
                { index: 21, weight: 4 },
                { index: 76, weight: 1 },
                { index: 95, weight: 1 },
                { index: 114, weight: 1 },
            ],
            WALL_RIGHT: [
                { index: 19, weight: 4 },
                { index: 77, weight: 1 },
                { index: 96, weight: 1 },
                { index: 115, weight: 1 },
            ],
            WALL_BOTTOM: [
                { index: 1, weight: 4 },
                { index: 78, weight: 1 },
                { index: 79, weight: 1 },
                { index: 80, weight: 1 },
            ],
            FLOOR: [
                { index: 6, weight: 20 },
                { index: 7, weight: 1 },
                { index: 8, weight: 1 },
                { index: 26, weight: 1 },
            ],
            ROOM: [
                { index: 6, weight: 20 },
                { index: 7, weight: 1 },
                { index: 8, weight: 1 },
                { index: 26, weight: 1 },
            ],
        },
    },
    shattered: {
        tileWidth: 16,
        tileHeight: 16,
        key: 'shattered',
        tileSetImage: 'np-pixel-dungeon/tiles_sewers-extruded.png',
        tileSetMargin: 1,
        tileSetSpacing: 2,
        mapping: {
            WALL_VERT: 158,
            WALL_VERT_T: 153,
            WALL_LEFT: [{ index: 147, weight: 4 }],
            WALL_LEFT_TOP: 147,
            WALL_LEFT_BOTTOM: 157,
            //WALL_LEFT_BOTTOM: 145, single
            WALL_RIGHT: [{ index: 148, weight: 4 }],
            WALL_RIGHT_TOP: 148,
            WALL_RIGHT_BOTTOM: 155,
            // WALL_RIGHT_BOTTOM: 152, single
            WALL_TOP: [{ index: 80, weight: 4 }],
            WALL_TOP_RIGHT: 194,
            WALL_TOP_LEFT: 193,
            WALL_TOP_OUTER: 80, //144, //192, //84,
            WALL_TOP_STITCH: 192,
            WALL_TOP_LEFT_STITCH: 194,
            WALL_TOP_RIGHT_STITCH: 193,
            WALL_TOP_DEADEND_STITCH: 195,
            WALL_BOTTOM: [{ index: 192, weight: 4 }],
            EMPTY: 144,
            // DOOR_VERT: 227,
            // DOOR_HORIZ: 112,
            DOOR: [
                { index: 112, weight: 4 },
                { index: 227, weight: 1 },
            ],
            // LEFT_DOOR: 227,
            // BOTTOM_DOOR: 112,
            // TOP_T_WALL: 80,
            // LEFT_DEADEND_WALL: 146,
            // RIGHT_DEADEND_WALL: 156,
            // TOP_DEADEND_WALL: 195,
            // BOTTOM_DEADEND_WALL: 192,
            // BOTTOM_T_WALL: 153,
            // RIGHT_T_WALL: 156,
            // LEFT_T_WALL: 146,
            // CROSS_WALL: 224,
            // STRAIGHT_WALL_VERT: 151,
            // STRAIGHT_WALL_HORIZ: 80,
            FLOOR: [{ index: 4, weight: 80 }],
            ROOM: [
                { index: 0, weight: 80 },
                { index: 1, weight: 1 },
                { index: 2, weight: 1 },
                { index: 3, weight: 1 },
                { index: 6, weight: 5 },
                { index: 7, weight: 5 },
                { index: 8, weight: 5 },
                { index: 9, weight: 5 },
            ],
        },
    },
};

export class PixelDungeonTileset {
    #map: Phaser.Tilemaps.Tilemap;
    #tileset: Phaser.Tilemaps.Tileset;
    #config: NPTilesetConfig;

    constructor(type: TNPTilesetKey) {
        this.#config = TILESETS[type];
    }

    addToMap(map: Phaser.Tilemaps.Tilemap) {
        this.#map = map;
        this.#tileset = this.#map.addTilesetImage(
            this.#config.key,
            this.#config.key,
            this.#config.tileWidth,
            this.#config.tileHeight,
            this.#config.tileSetMargin,
            this.#config.tileSetSpacing
        );
    }

    get tileset() {
        return this.#tileset;
    }

    mapping(key: keyof NPTilesetMappingNew) {
        return this.#config.mapping[key];
    }

    getTileIndexes(key: keyof NPTilesetMappingNew) {
        const mappingElement = this.#config.mapping[key];
        return typeof mappingElement === 'number' ? [mappingElement] : mappingElement.map(({ index }) => index);
    }

    getFirstTileIndex(key: keyof NPTilesetMappingNew) {
        return this.getTileIndexes(key)[0];
    }

    get imageUrl() {
        return this.#config.tileSetImage;
    }

    get key() {
        return this.#config.key;
    }

    get tileHeight() {
        return this.#config.tileHeight;
    }

    get tileWidth() {
        return this.#config.tileWidth;
    }
}
