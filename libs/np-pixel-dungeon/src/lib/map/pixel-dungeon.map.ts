import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { NPSceneWithBoard, TDungeonOptions } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonFloorLayer } from './pixel-dungeon-floorlayer';
import { PixelDungeonObjectlayer } from './pixel-dungeon-objectlayer';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';
import { PixelDungeonTileset } from './pixel-dungeon-tileset';
import { PixelDungeonWallLayer } from './pixel-dungeon-walllayer';

export type NPTilemapConfig = Phaser.Types.Tilemaps.TilemapConfig & {
    tileSetImage: string;
    tileSetMargin: number;
    tileSetSpacing: number;
    mapping: NPTilesetMapping;
};
// Tile index mapping to make the code more readable
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NPTileIndex = number;

interface NPWeightedTileIndex {
    index: NPTileIndex;
    weight: number;
}

type NPTilesetMap = NPTileIndex | NPWeightedTileIndex[];

export interface NPTilesetMappingNew {
    CORNER_TOP_LEFT: NPTilesetMap;
    CORNER_TOP_RIGHT: NPTilesetMap;
    CORNER_BOTTOM_RIGHT: NPTilesetMap;
    CORNER_BOTTOM_LEFT: NPTilesetMap;

    DOOR_VERTICAL: NPTilesetMap;
    DOOR_HORIZONTAL: NPTilesetMap;

    WALL_VERTICAL: NPTilesetMap;
    WALL_HORIZONTAL: NPTilesetMap;

    EMPTY: NPTilesetMap;

    FLOOR: NPTilesetMap;

    ROOM: NPTilesetMap;
}

export interface NPTilesetMapping {
    TOP_LEFT_WALL: NPTileIndex;
    TOP_RIGHT_WALL: NPTileIndex;
    BOTTOM_RIGHT_WALL: NPTileIndex;
    BOTTOM_LEFT_WALL: NPTileIndex;
    BOTTOM_DOOR: NPTileIndex;
    DOOR: NPTilesetMap;
    EMPTY: NPTileIndex;
    DOOR_VERT: NPTileIndex;
    DOOR_HORIZ: NPTileIndex;
    BOTTOM_T_WALL: NPTileIndex;
    TOP_T_WALL: NPTileIndex;
    LEFT_T_WALL: NPTileIndex;
    CROSS_WALL: NPTileIndex;
    STRAIGHT_WALL_HORIZ: NPTileIndex;
    STRAIGHT_WALL_VERT: NPTileIndex;
    RIGHT_T_WALL: NPTileIndex;
    BOTTOM_DEADEND_WALL: NPTileIndex;
    TOP_DEADEND_WALL: NPTileIndex;
    LEFT_DEADEND_WALL: NPTileIndex;
    RIGHT_DEADEND_WALL: NPTileIndex;
    TOP_WALL: NPWeightedTileIndex[];
    LEFT_DOOR: NPTileIndex;
    LEFT_WALL: NPWeightedTileIndex[];
    CORNER_BOTTOM_LEFT_OUTSIDE: NPTileIndex;
    CORNER_BOTTOM_RIGHT_OUTSIDE: NPTileIndex;
    RIGHT_WALL: NPWeightedTileIndex[];
    BOTTOM_WALL: NPWeightedTileIndex[];
    FLOOR: NPWeightedTileIndex[];
    ROOM: NPWeightedTileIndex[];
}

type TNPTilesetKey = 'example' | 'shattered';
const TILESETS: Record<TNPTilesetKey, NPTilemapConfig> = {
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
            TOP_LEFT_WALL: 101,
            TOP_RIGHT_WALL: 102,
            BOTTOM_RIGHT_WALL: 121,
            CORNER_BOTTOM_LEFT_OUTSIDE: 152,
            CORNER_BOTTOM_RIGHT_OUTSIDE: 152,
            BOTTOM_LEFT_WALL: 120,
            EMPTY: 20,
            DOOR_VERT: 105,
            DOOR_HORIZ: 84,
            DOOR: [
                { index: 118, weight: 4 },
                { index: 105, weight: 1 },
                { index: 84, weight: 1 },
            ],
            LEFT_DOOR: 118,
            BOTTOM_DOOR: 118,
            TOP_T_WALL: 103,
            LEFT_DEADEND_WALL: 82,
            RIGHT_DEADEND_WALL: 85,
            TOP_DEADEND_WALL: 86,
            BOTTOM_DEADEND_WALL: 143,
            BOTTOM_T_WALL: 123,
            RIGHT_T_WALL: 104,
            LEFT_T_WALL: 122,
            CROSS_WALL: 142,
            STRAIGHT_WALL_VERT: 124,
            STRAIGHT_WALL_HORIZ: 83,
            TOP_WALL: [
                { index: 39, weight: 4 },
                { index: 57, weight: 1 },
                { index: 58, weight: 1 },
                { index: 59, weight: 1 },
            ],
            LEFT_WALL: [
                { index: 21, weight: 4 },
                { index: 76, weight: 1 },
                { index: 95, weight: 1 },
                { index: 114, weight: 1 },
            ],
            RIGHT_WALL: [
                { index: 19, weight: 4 },
                { index: 77, weight: 1 },
                { index: 96, weight: 1 },
                { index: 115, weight: 1 },
            ],
            BOTTOM_WALL: [
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
            TOP_LEFT_WALL: 147,
            TOP_RIGHT_WALL: 148,
            BOTTOM_RIGHT_WALL: 152,
            CORNER_BOTTOM_LEFT_OUTSIDE: 194,
            CORNER_BOTTOM_RIGHT_OUTSIDE: 193,
            BOTTOM_LEFT_WALL: 145,
            EMPTY: 144,
            DOOR_VERT: 227,
            DOOR_HORIZ: 112,
            DOOR: [
                { index: 112, weight: 4 },
                { index: 227, weight: 1 },
            ],
            LEFT_DOOR: 227,
            BOTTOM_DOOR: 112,
            TOP_T_WALL: 80,
            LEFT_DEADEND_WALL: 146,
            RIGHT_DEADEND_WALL: 156,
            TOP_DEADEND_WALL: 195,
            BOTTOM_DEADEND_WALL: 192,
            BOTTOM_T_WALL: 153,
            RIGHT_T_WALL: 156,
            LEFT_T_WALL: 146,
            CROSS_WALL: 224,
            STRAIGHT_WALL_VERT: 151,
            STRAIGHT_WALL_HORIZ: 80,
            TOP_WALL: [{ index: 80, weight: 4 }],
            LEFT_WALL: [{ index: 148, weight: 4 }],
            RIGHT_WALL: [{ index: 147, weight: 4 }],
            BOTTOM_WALL: [{ index: 192, weight: 4 }],
            FLOOR: [
                { index: 0, weight: 20 },
                { index: 1, weight: 5 },
                { index: 2, weight: 5 },
                { index: 3, weight: 5 },
                { index: 6, weight: 5 },
                { index: 7, weight: 5 },
                { index: 8, weight: 5 },
                { index: 9, weight: 5 },
            ],
            ROOM: [
                { index: 0, weight: 20 },
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

export class PixelDungeonMap implements NPSceneComponent {
    scene: NPSceneWithBoard;

    #dungeon: PixelDungeon;
    #config: NPTilemapConfig & TDungeonOptions;
    #map: Phaser.Tilemaps.Tilemap;
    #floor: PixelDungeonFloorLayer;
    #walls: PixelDungeonTilelayer;
    #tilelayer: PixelDungeonTilelayer;
    #engine: PixelDungeonEngine;
    start: TileXYType;

    constructor(engine: PixelDungeonEngine, options: TDungeonOptions, type: TNPTilesetKey) {
        this.#dungeon = new PixelDungeon(options);
        this.#config = Object.assign({}, TILESETS[type], options);
        this.#engine = engine;
        this.scene = this.#engine.scene;
    }

    init(): void {
        this.#dungeon.init();
    }

    preload(): void {
        // Credits! Michele "Buch" Bucelli (tilset artist) & Abram Connelly (tileset sponser)
        // https://opengameart.org/content/top-down-dungeon-tileset
        // shamelessly stole from shattered-pixel-dungeon
        this.scene.load.image(this.#config.key, this.#config.tileSetImage);
    }

    create() {
        // Creating a blank tilemap with dimensions matching the dungeon
        this.#map = this.scene.make.tilemap({
            tileWidth: this.#config.tileWidth,
            tileHeight: this.#config.tileHeight,
            width: this.#config.width,
            height: this.#config.height,
        });

        const tileset = new PixelDungeonTileset(this.#map, this.#config);
        this.#floor = new PixelDungeonFloorLayer('floors', this.scene, this.#map, tileset);
        this.start = this.#floor.mapDungeonToLayer(this.#dungeon);
        this.#walls = new PixelDungeonWallLayer('walls', this.scene, this.#map, tileset);
        this.#walls.mapDungeonToLayer(this.#dungeon);
        this.#tilelayer = new PixelDungeonTilelayer('tiles', this.scene, this.#map, tileset);
        this.#tilelayer.mapDungeonToLayer(this.#dungeon);
        const objectLayer = new PixelDungeonObjectlayer('objects', this.scene, this.#map, tileset);
        objectLayer.mapDungeonToLayer(this.#dungeon);
        this.#tilelayer.mapDungeonToLayer(this.#dungeon);
        this.#tilelayer.tilelayer.setInteractive({ useHandcursor: true });
        this.tileMap.setLayer('floors');
        this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#tilelayer.tilelayer.off(Phaser.Input.Events.POINTER_UP);
        });
    }

    get tileLayer() {
        return this.#tilelayer;
    }

    loseVision(tileXYTypes?: TileXYType[]) {
        tileXYTypes?.forEach(tile => ((this.#map.getTileAt(tile.x, tile.y) ?? { alpha: 0 }).alpha = 0.5));
    }

    gainVision(view?: TileXYType[]) {
        view?.forEach(tile => ((this.#map.getTileAt(tile.x, tile.y) ?? { alpha: 0 }).alpha = 1));
    }

    get width(): number {
        return this.#tilelayer.tilelayer.width * this.#tilelayer.tilelayer.scaleX;
    }

    get height(): number {
        return this.#tilelayer.tilelayer.height * this.#tilelayer.tilelayer.scaleY;
    }

    get tileMap() {
        return this.#map;
    }
}
