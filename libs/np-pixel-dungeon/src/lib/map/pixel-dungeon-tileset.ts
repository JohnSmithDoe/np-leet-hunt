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
    WALL_TOP_JUNCTION: NPTilesetMap;
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
    DOOR_CLOSED: NPTilesetMap;
    DOOR_II: NPTilesetMap;
    DOOR_II_CLOSED: NPTilesetMap;
    DOOR_II_WALLED: NPTilesetMap;
    DOOR_II_WALLED_CLOSED: NPTilesetMap;
    DOOR_STITCH: NPTilesetMap;
    DOOR_STITCH_CLOSED: NPTilesetMap;
    DOOR_STITCH_II: NPTilesetMap;
    DOOR_STITCH_II_CLOSED: NPTilesetMap;
    EMPTY: NPTilesetMap;
    FLOOR: NPTilesetMap;
    ROOM: NPTilesetMap;
}

export type TNPTilesetKey = 'shattered';
type NPTilesetConfig = Phaser.Types.Tilemaps.TilemapConfig & {
    tileSetImage: string;
    tileSetMargin: number;
    tileSetSpacing: number;
    mapping: NPTilesetMappingNew;
};
const TILESETS: Record<TNPTilesetKey, NPTilesetConfig> = {
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
            WALL_TOP_JUNCTION: [
                { index: 88, weight: 4 },
                { index: 89, weight: 4 },
                { index: 90, weight: 4 },
            ],
            WALL_TOP_RIGHT: 194,
            WALL_TOP_LEFT: 193,
            WALL_TOP_OUTER: 80, //144, //192, //84,
            WALL_TOP_STITCH: 192,
            WALL_TOP_LEFT_STITCH: 194,
            WALL_TOP_RIGHT_STITCH: 193,
            WALL_TOP_DEADEND_STITCH: 195,
            WALL_BOTTOM: [{ index: 192, weight: 4 }],
            EMPTY: 144,
            DOOR_STITCH: 225,
            DOOR_STITCH_CLOSED: 224,
            DOOR_STITCH_II: 5,
            DOOR_STITCH_II_CLOSED: 227,
            DOOR: 113,
            DOOR_CLOSED: 112,
            DOOR_II: 211,
            DOOR_II_CLOSED: 215,
            DOOR_II_WALLED: 208,
            DOOR_II_WALLED_CLOSED: 212,
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
