import { NPRect } from '@shared/np-library';
import * as Phaser from 'phaser';
import Quad from 'phaser3-rex-plugins/plugins/board/grid/quad/Quad';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { OnSceneCreate, OnScenePreload } from '../../../np-phaser/src/lib/types/np-phaser';
import { ETileType } from './@types/pixel-dungeon.types';
import { PixelDungeon } from './core/pixel-dungeon';
import QuadGridDirTypes = Quad.QuadGridDirTypes;
// Tile index mapping to make the code more readable
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TILES = {
    TOP_LEFT_WALL: 3,
    TOP_RIGHT_WALL: 4,
    BOTTOM_RIGHT_WALL: 23,
    BOTTOM_LEFT_WALL: 22,
    DOOR: 118,
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
        { index: 6, weight: 120 },
        { index: 7, weight: 1 },
        { index: 8, weight: 1 },
        { index: 26, weight: 1 },
    ],
    ROOM: [{ index: 26, weight: 20 }],
};

export class PixelDungeonScene extends Phaser.Scene implements OnScenePreload, OnSceneCreate {
    rexBoard: BoardPlugin; // Declare scene property 'rexBoard' as BoardPlugin type

    map: Phaser.Tilemaps.Tilemap;
    player;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    cam: Phaser.Cameras.Scene2D.Camera;
    tilelayer: Phaser.Tilemaps.TilemapLayer;
    lastMoveTime = 0;

    setupComponents(): void {
        console.log('nope');
    }

    preload() {
        // Credits! Michele "Buch" Bucelli (tilset artist) & Abram Connelly (tileset sponser)
        // https://opengameart.org/content/top-down-dungeon-tileset
        this.load.image('tiles', 'np-pixel-dungeon/buch-dungeon-tileset-extruded.png');
    }

    create() {
        const options = { width: 251, height: 25, seed: 'My-Seed' };
        const pixelDungeon = new PixelDungeon(options);
        pixelDungeon.init();

        // Creating a blank tilemap with dimensions matching the dungeon
        this.map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: options.width,
            height: options.height,
        });
        //
        const tileset = this.map.addTilesetImage('tiles', 'tiles', 16, 16, 1, 2);
        //
        this.tilelayer = this.map.createBlankLayer('Layer 1', tileset);

        this.tilelayer.setScale(1);
        this.tilelayer.setInteractive({ useHandcursor: true });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.tilelayer.off(Phaser.Input.Events.POINTER_UP);
        });

        // }
        //
        // // Fill with black tiles
        this.tilelayer.fill(20);
        this.tilelayer.setCollisionByExclusion([6, 7, 8, 26, TILES.DOOR]);
        //
        let startX;
        let startY;
        for (const tile of pixelDungeon) {
            switch (tile.type) {
                case ETileType.none:
                    this.map.putTileAt(20, tile.x, tile.y);
                    break;
                case ETileType.floor:
                    startX = tile.x;
                    startY = tile.y;
                    this.map.weightedRandomize(TILES.FLOOR, tile.x, tile.y, 1, 1);
                    break;
                case ETileType.junction:
                    this.map.putTileAt(TILES.DOOR, tile.x, tile.y);
                    break;
                case ETileType.wall:
                    this.map.weightedRandomize(TILES.TOP_WALL, tile.x, tile.y, 1, 1);
                    break;
                case ETileType.room:
                    startX = tile.x;
                    startY = tile.y;
                    this.map.weightedRandomize(TILES.ROOM, tile.x, tile.y, 1, 1);
                    break;
            }
        }

        const board = this.rexBoard.createBoardFromTilemap(this.map);
        const grid = board.grid as unknown as { setDirectionMode: (mode: QuadGridDirTypes) => void };
        grid.setDirectionMode('8dir');
        const costs = (curTile: PathFinder.NodeType): number | PathFinder.BLOCKER | PathFinder.INFINITY => {
            const tile = this.map.getTileAt(curTile.x, curTile.y);
            return [6, 7, 8, 26, TILES.DOOR].includes(tile.index) ? 1 : null;
        };

        const pathGraphics = this.add.graphics({ lineStyle: { width: 8 } });
        const chess = this.rexBoard.add.shape(board, startX, startY, 1, 0xff0000, 0.5).setOrigin(0);
        const p2 = this.rexBoard.add.pathFinder(chess, {
            pathMode: 'straight',
            blockerTest: true,
            occupiedTest: true,
            costCallback: curTile => costs(curTile),
        });
        let pathToMove: PathFinder.NodeType[] | undefined;
        const drawPath = (tileXYArray: PathFinder.NodeType[]) => {
            const p = tileXYArray.map(tile => this.map.tileToWorldXY(tile.x, tile.y)).map(pv => pv.add({ x: 8, y: 8 }));
            pathGraphics.strokePoints(p);
        };
        const moveTo = this.rexBoard.add.moveTo(chess);

        this.tilelayer.on(Phaser.Input.Events.POINTER_UP, ({ worldX, worldY }: Phaser.Input.Pointer) => {
            const targetTile = this.map.getTileAtWorldXY(worldX, worldY);
            // generate the path
            pathToMove = p2.findPath({ x: targetTile.x, y: targetTile.y });
            drawPath(pathToMove);
            moveTo.moveTo(pathToMove.shift());
        });

        moveTo.on('complete', () => {
            const next = pathToMove.shift();
            if (next) moveTo.moveTo(next);
            if (!next) pathGraphics.clear();
        });
        // moveTo.moveToRandomNeighbor();
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
        //     // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
        //     // See "Weighted Randomize" example for more information on how to use weightedRandomize.
        //     this.map.weightedRandomize(TILES.FLOOR, x, y, w, h);
        //
        //     // Place the room corners tiles
        //     this.map.putTileAt(TILES.TOP_LEFT_WALL, left, top);
        //     this.map.putTileAt(TILES.TOP_RIGHT_WALL, right, top);
        //     this.map.putTileAt(TILES.BOTTOM_RIGHT_WALL, right, bottom);
        //     this.map.putTileAt(TILES.BOTTOM_LEFT_WALL, left, bottom);
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

        //
        // // Hide all the rooms
        // if (!debug) {
        //     this.tilelayer.forEachTile(tile => {
        //         tile.alpha = 0;
        //     });
        // }
        //
        // // Place the player in the first room
        // const playerRoom = this.dungeon.rooms[0];
        //
        this.player = chess;
        //
        // if (!debug) {
        //     this.setRoomAlpha(playerRoom, 1); // Make the starting room visible
        // }
        //
        // // Scroll to the player
        this.cam = this.cameras.main;
        this.cam.setZoom(3);
        //
        this.cam.setBounds(
            0,
            0,
            this.tilelayer.width * this.tilelayer.scaleX,
            this.tilelayer.height * this.tilelayer.scaleY
        );
        this.cam.scrollX = this.player.x - this.cam.width * 0.5;
        this.cam.scrollY = this.player.y - this.cam.height * 0.5;
        //
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time: number) {
        this.updatePlayerMovement(time);
        // const playerTileX = this.map.worldToTileX(this.player.x);
        // const playerTileY = this.map.worldToTileY(this.player.y);
        // Another helper method from the dungeon - dungeon XY (in tiles) -> room
        // const room = this.dungeon.getRoomAt(playerTileX, playerTileY);

        // If the player has entered a new room, make it visible and dim the last room
        // if (room && this.activeRoom && this.activeRoom !== room) {
        //     if (!debug) {
        //         this.setRoomAlpha(room, 1);
        //         this.setRoomAlpha(this.activeRoom, 0.5);
        //     }
        // }
        //
        // this.activeRoom = room;
        //
        // Smooth follow the player
        const smoothFactor = 0.9;

        this.cam.scrollX =
            smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (this.player.x - this.cam.width * 0.5);
        this.cam.scrollY =
            smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (this.player.y - this.cam.height * 0.5);
    }

    // Helpers functions
    setRoomAlpha(room: NPRect, alpha: number) {
        this.map.forEachTile(
            tile => {
                tile.alpha = alpha;
            },
            this,
            room.x,
            room.y,
            room.width,
            room.height
        );
    }

    isTileOpenAt(worldX: number, worldY: number) {
        // nonNull = true, don't return null for empty tiles. This means null will be returned only for
        // tiles outside the bounds of the map.
        const tile = this.map.getTileAtWorldXY(worldX, worldY, true);

        return tile && !tile.collides;
    }

    updatePlayerMovement(time: number) {
        // const tw = this.map.tileWidth * this.tilelayer.scaleX;
        // const th = this.map.tileHeight * this.tilelayer.scaleY;
        const repeatMoveDelay = 100;

        if (time > this.lastMoveTime + repeatMoveDelay) {
            if (this.cursors.down.isDown) {
                // if (this.isTileOpenAt(this.player.x, this.player.y + th)) {
                // this.player.y += th;
                // this.lastMoveTime = time;
                // }
            } else if (this.cursors.up.isDown) {
                // if (this.isTileOpenAt(this.player.x, this.player.y - th)) {
                // this.player.y -= th;
                // this.lastMoveTime = time;
                // }
            }

            if (this.cursors.left.isDown) {
                // if (this.isTileOpenAt(this.player.x - tw, this.player.y)) {
                // this.player.x -= tw;
                // this.lastMoveTime = time;
                // }
            } else if (this.cursors.right.isDown) {
                // if (this.isTileOpenAt(this.player.x + tw, this.player.y)) {
                // this.player.x += tw;
                // this.lastMoveTime = time;
                // }
            }
        }
    }
}
