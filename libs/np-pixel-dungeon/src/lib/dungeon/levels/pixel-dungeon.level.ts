import { NPSceneComponent } from '@shared/np-phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { NPScene } from '../../../../../np-phaser/src/lib/scenes/np-scene';
import { EDirection } from '../../../../../np-phaser/src/lib/utilities/piecemeal';
import { ETileType, TDungeonOptions } from '../../@types/pixel-dungeon.types';
import { PixelDungeonBoard } from '../../core/pixel-dungeon-board';
import { PixelDungeonEngine } from '../../engine/pixel-dungeon.engine';
import { PixelDungeonMap } from '../../map/pixel-dungeon.map';
import { PixelDungeonMob } from '../../sprites/pixel-dungeon.mob';
import { PixelDungeon } from '../pixel-dungeon';
import { PixelDungeonHallway } from './board/pixel-dungeon.hallway';
import { PixelDungeonJunction } from './board/pixel-dungeon.junction';
import { PixelDungeonRoom } from './board/pixel-dungeon.room';
import { PixelDungeonTile } from './board/pixel-dungeon.tile';
import { PixelDungeonWall } from './board/pixel-dungeon.wall';

export class PixelDungeonLevel implements NPSceneComponent {
    scene: NPScene;
    #map: PixelDungeonMap;
    #board: PixelDungeonBoard;

    #walls: PixelDungeonWall[] = [];
    #junctions: PixelDungeonJunction[] = [];
    #halls: PixelDungeonHallway[] = [];
    #rooms: PixelDungeonRoom[] = [];

    get start() {
        const tile = this.#rooms[0].bottomRight();
        return { x: tile.x, y: tile.y };
    }

    constructor(engine: PixelDungeonEngine, options: TDungeonOptions) {
        this.scene = engine.scene;
        // create the level dungeon and map to its parts
        const dungeon = new PixelDungeon(options);
        this.#mapDungeon(dungeon);
        // create a board and a tilemap for the dungeon
        this.#map = new PixelDungeonMap(engine, options, 'shattered');
        this.#board = new PixelDungeonBoard(engine, {
            width: options.width + 2,
            height: options.height + 2,
            tileWidth: this.#map.tileset.tileWidth,
            tileHeight: this.#map.tileset.tileHeight,
        });
    }

    public preload(): void {
        this.#map.preload();
    }

    public create(): void {
        this.#map.create();
        this.#mapBoard();
    }

    #mapBoard() {
        for (const wall of this.#walls) {
            this.#board.addChess(wall, wall.x, wall.y, 'wall', false);
            wall.rexChess.setBlocker(true);
        }
        for (const junction of this.#junctions) {
            this.#board.addChess(junction, junction.x, junction.y, 'objects', false);
            junction.rexChess.setBlocker(false);
        }

        for (const room of this.#rooms) {
            for (const tile of room) {
                // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
                this.#map.floorlayer.putPixeldungeonTileAt(tile, 'ROOM');
            }
        }
        for (const hallway of this.#halls) {
            for (const tile of hallway) {
                this.#map.floorlayer.putPixeldungeonTileAt(tile, 'FLOOR');
                // this.putTileAt(tile.pos.addDirection(EDirection.S), 'FLOOR');
            }
        }
        for (const junction of this.#junctions) {
            this.#map.floorlayer.putPixeldungeonTileAt(junction, 'FLOOR');
            this.#map.stitchlayer.putTileAt(junction, junction.toTileIndex());
            if (junction.needsStitching()) {
                this.#map.stitchlayer.putTileAt(
                    junction.pos.addDirection(EDirection.N),
                    junction.toStitchingTileIndex()
                );
            }
        }
    }

    #mapDungeon(dungeon: PixelDungeon) {
        const regionRoomTiles: Record<number, PixelDungeonRoom> = {};
        const regionHallTiles: Record<number, PixelDungeonHallway> = {};

        for (const tile of dungeon) {
            switch (tile.type) {
                case ETileType.none:
                    break;
                case ETileType.room:
                    (regionRoomTiles[tile.region] ??= new PixelDungeonRoom(tile.region)).addTile(
                        new PixelDungeonTile(tile, dungeon)
                    );
                    break;
                case ETileType.floor:
                    (regionHallTiles[tile.region] ??= new PixelDungeonHallway(tile.region)).addTile(
                        new PixelDungeonTile(tile, dungeon)
                    );
                    break;
                case ETileType.wall:
                    this.#walls.push(new PixelDungeonWall(tile, dungeon));
                    break;
                case ETileType.junction:
                    this.#junctions.push(new PixelDungeonJunction(tile, dungeon));
                    break;
            }
        }

        this.#rooms.push(...Object.values(regionRoomTiles));
        this.#halls.push(...Object.values(regionHallTiles));
    }

    loseVision(fields: TileXYType[]) {
        this.#map.loseVision(fields);
    }

    gainVision(fields: TileXYType[]) {
        this.#map.gainVision(fields);
    }

    public doors(mobs: PixelDungeonMob[]) {
        for (const mob of mobs) {
            const tile = this.#board.getTile(mob.tile);
            if (tile instanceof PixelDungeonJunction) {
                tile.setOpen(true);
            }
        }
        // for (const junction of this.dungeon.junctions) {
        //     junction.setOpen(!!mobs.find(mob => equalTile(junction.tile, mob.tile)));
        // }
        // this.#objects.mapDungeonToLayer(this.#dungeon);
    }

    public getMobAt(tile: TileXYType) {
        return this.#board.tileXYZToChess(tile.x, tile.y, 1);
    }

    addMob(mob: PixelDungeonMob, tileX: number, tileY: number) {
        this.#board.addChess(mob, tileX, tileY, 1);
    }

    public moveMob(mob: PixelDungeonMob, tile: TileXYType) {
        this.#board.moveChess(mob, tile.x, tile.y, 1);
    }

    public areNeighbors(tile: TileXYType, tile2: TileXYType) {
        return this.#board.areNeighbors(tile, tile2);
    }

    public tileToWorldXY(tile: TileXYType) {
        return this.#map.tilemap.tileToWorldXY(tile.x, tile.y);
    }

    public getRandomEmptyTileXYInRange(tile: TileXYType, radius: number) {
        return this.#board.getRandomEmptyTileXYInRange(tile, radius, 1);
    }

    public getNeighborChess(tile: TileXYType) {
        return this.#board.getNeighborChess(tile, null) ?? [];
    }

    public getTileAtWorldXY(worldX: number, worldY: number) {
        return this.#map.tilemap.getTileAtWorldXY(worldX, worldY);
    }

    public angleBetween(mob: PixelDungeonMob, target: PixelDungeonMob) {
        return this.#board.angleBetween(mob, target);
    }

    get board() {
        return this.#board;
    }
}
