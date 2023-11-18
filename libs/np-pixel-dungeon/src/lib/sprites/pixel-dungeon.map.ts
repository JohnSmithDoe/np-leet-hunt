import { EDirection, NPVec2 } from '@shared/np-library';
import * as Phaser from 'phaser';
import FieldOfView from 'phaser3-rex-plugins/plugins/board/fieldofview/FieldOfView';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { ETileType, SceneWithBoard, TDungeonOptions, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from '../core/pixel-dungeon';
import { PixelDungeonRoom } from '../core/pixel-dungeon.room';
import { PixelDungeonTile } from '../core/pixel-dungeon.tile';
import { Player } from './player';
import MoveTo = BoardPlugin.MoveTo;

const mapRexDirection = (dir: number): EDirection => {
    switch (dir) {
        case 0:
            return EDirection.E;
        case 1:
            return EDirection.S;
        case 2:
            return EDirection.W;
        case 3:
            return EDirection.N;
        case 4:
            return EDirection.SE;
        case 5:
            return EDirection.SW;
        case 6:
            return EDirection.NW;
        case 7:
            return EDirection.NE;
        default:
            return EDirection.NONE;
    }
};

type NPTilemapConfig = Phaser.Types.Tilemaps.TilemapConfig & {
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
    DOOR: NPTileIndex;
    EMPTY: NPTileIndex;
    TOP_WALL: NPWeightedTileIndex[];
    LEFT_DOOR: NPTileIndex;
    LEFT_WALL: NPWeightedTileIndex[];
    RIGHT_WALL: NPWeightedTileIndex[];
    BOTTOM_WALL: NPWeightedTileIndex[];
    FLOOR: NPWeightedTileIndex[];
    ROOM: NPWeightedTileIndex[];
}

type TNPTilesetKey = 'example';
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
            TOP_LEFT_WALL: 3,
            TOP_RIGHT_WALL: 4,
            BOTTOM_RIGHT_WALL: 23,
            BOTTOM_LEFT_WALL: 22,
            EMPTY: 20,
            DOOR: 118,
            LEFT_DOOR: 118,
            BOTTOM_DOOR: 118,
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
};

export class PixelDungeonMap {
    // implements NPSceneComponent {
    #dungeon: PixelDungeon;
    #config: NPTilemapConfig & TDungeonOptions;
    #map: Phaser.Tilemaps.Tilemap;
    #tilelayer: Phaser.Tilemaps.TilemapLayer;
    moveTo: MoveTo;
    #pathfinder: PathFinder;
    #pathToMove: PathFinder.NodeType[];
    private pathGraphics: Phaser.GameObjects.Graphics;
    #player: Player;
    private fieldOfView: FieldOfView<Phaser.GameObjects.GameObject>;
    private view: TileXYType[];

    get width(): number {
        return this.#tilelayer.width * this.#tilelayer.scaleX;
    }

    get height(): number {
        return this.#tilelayer.height * this.#tilelayer.scaleY;
    }

    constructor(public scene: Phaser.Scene & SceneWithBoard, options: TDungeonOptions, type: TNPTilesetKey) {
        this.#dungeon = new PixelDungeon(options);
        this.#config = Object.assign({}, TILESETS[type], options);
    }

    preload(): void {
        // Credits! Michele "Buch" Bucelli (tilset artist) & Abram Connelly (tileset sponser)
        // https://opengameart.org/content/top-down-dungeon-tileset
        this.scene.load.image(this.#config.key, this.#config.tileSetImage);
    }

    create(player: Player) {
        // Creating a blank tilemap with dimensions matching the dungeon
        this.#player = player;
        this.#map = this.scene.make.tilemap({
            tileWidth: this.#config.tileWidth,
            tileHeight: this.#config.tileHeight,
            width: this.#config.width,
            height: this.#config.height,
        });
        //
        const tileset = this.#map.addTilesetImage(
            this.#config.key,
            this.#config.key,
            this.#config.tileWidth,
            this.#config.tileHeight,
            this.#config.tileSetMargin,
            this.#config.tileSetSpacing
        );
        //
        this.#tilelayer = this.#map.createBlankLayer('Layer 1', tileset);
        this.#tilelayer.setScale(1);
        this.#tilelayer.setInteractive({ useHandcursor: true });

        this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#tilelayer.off(Phaser.Input.Events.POINTER_UP);
        });

        // }
        //
        // // Fill with black tiles
        // this.#tilelayer.fill(this.#getFirstTileIndex('EMPTY'));
        this.#tilelayer.setCollisionByExclusion([6, 7, 8, 26, ...this.#getTileIndexes('DOOR')]);
        //
        const start = this.#mapDungeonToTilemap();
        start.x--;
        this.pathGraphics = this.scene.add.graphics({ lineStyle: { width: 3 } });

        const board = this.scene.rexBoard.createBoardFromTilemap(this.#map);
        board.addChess(player, start.x, start.y, 1);
        const grid = board.grid as unknown as { setDirectionMode: (mode: '4dir' | '8dir') => void };
        grid.setDirectionMode('8dir');
        const openTileIdx = [6, 7, 8, 26, this.#getFirstTileIndex('DOOR')];
        const costs = (
            curTile: PathFinder.NodeType | TileXYType
        ): number | PathFinder.BLOCKER | PathFinder.INFINITY => {
            const tile = this.#map.getTileAt(curTile.x, curTile.y);
            return openTileIdx.includes(tile.index) ? 1 : null;
        };

        // const chess = this.player; //this.rexBoard.add.shape(board, startX, startY, 1, 0xff0000, 0.5).setOrigin(0);
        const pos = this.#map.tileToWorldXY(start.x, start.y);
        player.setPosition(pos.x, pos.y);

        this.moveTo = this.scene.rexBoard.add.moveTo(player, {
            blockerTest: true,
            occupiedTest: true,
            speed: 200,
            moveableTest: (from, to) => {
                const tile = this.#map.getTileAt(to.x, to.y);
                return openTileIdx.includes(tile.index);
            },
        });

        //this.add.existing(this.anim);
        this.#pathfinder = this.scene.rexBoard.add.pathFinder(player, {
            pathMode: 'A*-line', // only works with adjusted plugin tileXYToWroldX
            blockerTest: true,
            occupiedTest: true,
            costCallback: curTile => costs(curTile),
        });
        this.fieldOfView = this.scene.rexBoard.add.fieldOfView(player, {
            preTestCallback: (a, visiblePoints) => {
                const first = a[0];
                const target = a[a.length - 1];
                const distance = Phaser.Math.Distance.Snake(first.x, first.y, target.x, target.y);
                return !visiblePoints || distance <= visiblePoints;
            },
            coneMode: 'angle',
            // cone: 270,
            // debug: {
            //     graphics: this.pathGraphics,
            //     visibleLineColor: 0x0f0f0f0,
            // },
            costCallback: curTile => costs(curTile),
        });
        this.moveTo.on('complete', () => {
            const next = this.#pathToMove.shift();
            if (next) this.moveTo.moveTo(next);
            player.faceMoveTo(mapRexDirection(this.moveTo.destinationDirection));
            this.#updateFoV();
            // if (!next) this.pathGraphics.clear();
            if (!next) player.faceToDirection(mapRexDirection(this.moveTo.destinationDirection));
        });
        this.#updateFoV();
    }

    #updateFoV() {
        this.view?.forEach(tile => (this.#map.getTileAt(tile.x, tile.y).alpha = 0.5));
        this.fieldOfView.setFace(this.moveTo.destinationDirection);
        this.view = this.fieldOfView.findFOV(15);
        const tileAt = this.moveTo.destinationTileX
            ? this.#map.getTileAt(this.moveTo.destinationTileX, this.moveTo.destinationTileY)
            : this.#map.getTileAtWorldXY(this.#player.x, this.#player.y);
        if (tileAt) this.view.push(tileAt);
        this.view.forEach(tile => (this.#map.getTileAt(tile.x, tile.y).alpha = 1));
    }

    moveToPointer({ worldX, worldY }: Phaser.Input.Pointer) {
        const drawPath = (tileXYArray: PathFinder.NodeType[]) => {
            const p = tileXYArray
                .map(tile => this.#map.tileToWorldXY(tile.x, tile.y))
                .map(pv => pv.add({ x: 8, y: 8 }));
            this.pathGraphics.strokePoints(p);
        };

        const targetTile = this.#map.getTileAtWorldXY(worldX, worldY);
        // generate the path
        this.#pathToMove = this.#pathfinder.findPath({ x: targetTile.x, y: targetTile.y });
        this.pathGraphics.clear();
        drawPath(this.#pathToMove);
        this.moveTo.moveTo(this.#pathToMove.shift());
        this.#player.faceMoveTo(mapRexDirection(this.moveTo.destinationDirection));
        this.#updateFoV();
    }

    #getTileIndexes(key: keyof NPTilesetMapping) {
        const mappingElement = this.#config.mapping[key];
        return typeof mappingElement === 'number' ? [mappingElement] : mappingElement.map(({ index }) => index);
    }

    #getFirstTileIndex(key: keyof NPTilesetMapping) {
        return this.#getTileIndexes(key)[0];
    }

    #putTileAt(tile: TDungeonTile | NPVec2, key: keyof NPTilesetMapping) {
        const mappingElement = this.#config.mapping[key];
        if (typeof mappingElement === 'number') {
            this.#map.putTileAt(mappingElement, tile.x, tile.y);
        } else {
            this.#map.weightedRandomize(mappingElement, tile.x, tile.y, 1, 1);
        }
    }

    #putPixeldungeonTileAt(tile: PixelDungeonTile, key: keyof NPTilesetMapping) {
        const mappingElement = this.#config.mapping[key];
        if (typeof mappingElement === 'number') {
            this.#map.putTileAt(mappingElement, tile.tileX, tile.tileY);
        } else {
            this.#map.weightedRandomize(mappingElement, tile.tileX, tile.tileY, 1, 1);
        }
    }

    init(): void {
        this.#dungeon.init();
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

    #mapDungeonToTilemap() {
        let start: TDungeonTile;
        for (const room of this.#dungeon.rooms) {
            this.#mapDungeonRoomToTilemap(room);
        }
        for (const junction of this.#dungeon.junctions) {
            this.#putTileAt(junction.pos, junction.toTileIndex());
        }

        for (const tile of this.#dungeon) {
            if (tile.type === ETileType.room) {
                start = tile;
            } else {
                if (!this.#tilelayer.hasTileAt(tile.x, tile.y))
                    this.#putTileAt(tile, this.mapTileToTileIndex(tile.type));
            }
            this.#tilelayer.getTileAt(tile.x, tile.y).alpha = 0;
        }
        return start;
    }

    dfg() {
        // // Use the array of rooms generated to place tiles in the map
        // this.dungeon.rooms.forEach(function (room) {
        //     const x = room.x;
        //     const y = room.y;
        //     const w = room.width;
        //     const h = room.height;
        //     const cx = Math.floor(x + w / 2);
        //     const cy = Math.floor(y + h / 2);
        //     const left = x;
        //     const right = x + (w - 1);
        //     const top = y;
        //     const bottom = y + (h - 1);
        //
        //
        //     // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
        //     this.map.weightedRandomize(TILES.TOP_WALL, left + 1, top, w - 2, 1);
        //     this.map.weightedRandomize(TILES.BOTTOM_WALL, left + 1, bottom, w - 2, 1);
        //     this.map.weightedRandomize(TILES.LEFT_WALL, left, top + 1, 1, h - 2);
        //     this.map.weightedRandomize(TILES.RIGHT_WALL, right, top + 1, 1, h - 2);
        //
        //     // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the rooms location
        //     const doors = room.getDoorLocations();
        //
        //     for (const item of doors) {
        //         this.map.putTileAt(6, x + item.x, y + item.y);
        //     }
        //
        //     // Place some random stuff in rooms occasionally
        //     const rand = Math.random();
        //     if (rand <= 0.25) {
        //         this.tilelayer.putTileAt(166, cx, cy); // Chest
        //     } else if (rand <= 0.3) {
        //         this.tilelayer.putTileAt(81, cx, cy); // Stairs
        //     } else if (rand <= 0.4) {
        //         this.tilelayer.putTileAt(167, cx, cy); // Trap door
        //     } else if (rand <= 0.6) {
        //         if (room.height >= 9) {
        //             // We have room for 4 towers
        //             this.tilelayer.putTilesAt([[186], [205]], cx - 1, cy + 1);
        //
        //             this.tilelayer.putTilesAt([[186], [205]], cx + 1, cy + 1);
        //
        //             this.tilelayer.putTilesAt([[186], [205]], cx - 1, cy - 2);
        //
        //             this.tilelayer.putTilesAt([[186], [205]], cx + 1, cy - 2);
        //         } else {
        //             this.tilelayer.putTilesAt([[186], [205]], cx - 1, cy - 1);
        //
        //             this.tilelayer.putTilesAt([[186], [205]], cx + 1, cy - 1);
        //         }
        //     }
        // }, this);
        //
        // // Not exactly correct for the tileset since there are more possible floor tiles, but this will
        // // do for the example.
    }

    #mapDungeonRoomToTilemap(room: PixelDungeonRoom) {
        for (const tile of room) {
            // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
            this.#putPixeldungeonTileAt(tile, 'ROOM');
        }
        // this.#putPixeldungeonTileAt(room.topLeft(), 'TOP_LEFT_WALL');
        // this.#putPixeldungeonTileAt(room.topRight(), 'TOP_RIGHT_WALL');
    }
}
