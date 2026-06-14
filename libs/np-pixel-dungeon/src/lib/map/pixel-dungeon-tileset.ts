// Tile index mapping to make the code more readable.
//
// The semantic role -> tile-index mapping is NOT hand-maintained here anymore: it is parsed
// at runtime from the Tiled tileset export `PixelDungeon.tsj`, which is the single source of
// truth. Queue it during preload via `PixelDungeonTileset.preloadDefinition()` and parse it
// during create via `PixelDungeonTileset.applyDefinition()` (both static).

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

// Mirrors the keys of NPTilesetMappingNew; used to validate that PixelDungeon.tsj defines
// every role the game needs and to drive the bare-index-vs-weighted-set decision below.
const REQUIRED_ROLES: (keyof NPTilesetMappingNew)[] = [
    'WALL_TOP_OUTER',
    'WALL_TOP',
    'WALL_TOP_JUNCTION',
    'WALL_VERT',
    'WALL_VERT_T',
    'WALL_TOP_STITCH',
    'WALL_TOP_LEFT_STITCH',
    'WALL_TOP_RIGHT_STITCH',
    'WALL_TOP_DEADEND_STITCH',
    'WALL_TOP_RIGHT',
    'WALL_TOP_LEFT',
    'WALL_BOTTOM',
    'WALL_LEFT',
    'WALL_LEFT_TOP',
    'WALL_LEFT_BOTTOM',
    'WALL_RIGHT',
    'WALL_RIGHT_TOP',
    'WALL_RIGHT_BOTTOM',
    'DOOR',
    'DOOR_CLOSED',
    'DOOR_II',
    'DOOR_II_CLOSED',
    'DOOR_II_WALLED',
    'DOOR_II_WALLED_CLOSED',
    'DOOR_STITCH',
    'DOOR_STITCH_CLOSED',
    'DOOR_STITCH_II',
    'DOOR_STITCH_II_CLOSED',
    'EMPTY',
    'FLOOR',
    'ROOM',
];

// The subset of the Tiled tileset (.tsj) format we read.
interface TiledTilesetProperty {
    name: string;
    type: string;
    value: string;
}

interface TiledTilesetTile {
    id: number;
    type?: string;
    probability?: number;
    properties?: TiledTilesetProperty[];
}

export interface TiledTileset {
    tilewidth: number;
    tileheight: number;
    tiles: TiledTilesetTile[];
}

// A tile can serve more than one semantic role; the extra roles live in a comma-separated
// `roles` custom property (which also repeats the `type`). Without it, `type` is the role.
function tileRoles(tile: TiledTilesetTile): string[] {
    const roles = tile.properties?.find(property => property.name === 'roles');
    if (roles) {
        return roles.value
            .split(',')
            .map(role => role.trim())
            .filter(Boolean);
    }
    return tile.type ? [tile.type] : [];
}

// Invert the tile-keyed .tsj (id -> role(s) + probability) into the role-keyed mapping the
// game uses (role -> tile index, or a weighted set when a role spans several tiles).
export function parseTilesetMapping(tsj: TiledTileset): NPTilesetMappingNew {
    const collected: Partial<Record<keyof NPTilesetMappingNew, NPWeightedTileIndex[]>> = {};
    for (const tile of tsj.tiles) {
        const weight = tile.probability ?? 1;
        for (const role of tileRoles(tile)) {
            (collected[role as keyof NPTilesetMappingNew] ??= []).push({ index: tile.id, weight });
        }
    }

    const missing = REQUIRED_ROLES.filter(role => !collected[role]);
    if (missing.length) {
        throw new Error(`PixelDungeon.tsj is missing tile roles: ${missing.join(', ')}`);
    }

    const mapping = {} as NPTilesetMappingNew;
    for (const role of REQUIRED_ROLES) {
        const tiles = collected[role]!;
        // single tile -> bare index (placed via putTileAt); several -> weighted set (weightedRandomize)
        mapping[role] = tiles.length === 1 ? tiles[0].index : tiles;
    }
    return mapping;
}

export type TNPTilesetKey = 'shattered';
type NPTilesetConfig = Phaser.Types.Tilemaps.TilemapConfig & {
    key: string;
    tileWidth: number;
    tileHeight: number;
    tileSetImage: string;
    tileSetMargin: number;
    tileSetSpacing: number;
    // Populated at runtime from PixelDungeon.tsj (see PixelDungeonTileset.applyDefinition).
    mapping?: NPTilesetMappingNew;
};

// Per-image config only. The semantic `mapping` is filled in from PixelDungeon.tsj at runtime.
const TILESETS: Record<TNPTilesetKey, NPTilesetConfig> = {
    shattered: {
        tileWidth: 16,
        tileHeight: 16,
        key: 'shattered',
        tileSetImage: 'np-pixel-dungeon/tiles_sewers-extruded.png',
        tileSetMargin: 1,
        tileSetSpacing: 2,
    },
};

let definitionApplied = false;

export class PixelDungeonTileset {
    static readonly DEFINITION_KEY = 'pixel-dungeon-tileset-def';
    static readonly DEFINITION_URL = 'np-pixel-dungeon/PixelDungeon.tsj';

    /** Queue the Tiled tileset definition for loading. Call from a scene `preload()`. */
    static preloadDefinition(scene: Phaser.Scene): void {
        if (!scene.cache.json.has(PixelDungeonTileset.DEFINITION_KEY)) {
            scene.load.json(PixelDungeonTileset.DEFINITION_KEY, PixelDungeonTileset.DEFINITION_URL);
        }
    }

    /** Parse the loaded definition into the shared tileset mapping. Idempotent; call from `create()`. */
    static applyDefinition(scene: Phaser.Scene): void {
        if (definitionApplied) return;
        const tsj = scene.cache.json.get(PixelDungeonTileset.DEFINITION_KEY) as TiledTileset | undefined;
        if (!tsj) {
            throw new Error(
                `PixelDungeon tileset definition '${PixelDungeonTileset.DEFINITION_KEY}' not loaded — call preloadDefinition() in preload first`
            );
        }
        const mapping = parseTilesetMapping(tsj);
        for (const config of Object.values(TILESETS)) {
            config.mapping = mapping;
        }
        definitionApplied = true;
    }

    #map!: Phaser.Tilemaps.Tilemap;
    #tileset!: Phaser.Tilemaps.Tileset;
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
        )!;
    }

    get tileset() {
        return this.#tileset;
    }

    get #mapping(): NPTilesetMappingNew {
        if (!this.#config.mapping) {
            throw new Error(
                'PixelDungeon tileset definition not applied — call PixelDungeonTileset.applyDefinition() after preload'
            );
        }
        return this.#config.mapping;
    }

    mapping(key: keyof NPTilesetMappingNew) {
        return this.#mapping[key];
    }

    getTileIndexes(key: keyof NPTilesetMappingNew) {
        const mappingElement = this.#mapping[key];
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
