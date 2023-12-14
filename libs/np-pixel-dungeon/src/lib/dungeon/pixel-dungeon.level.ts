import { NPSceneComponent } from '@shared/np-phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';
import { TDungeonOptions } from '../@types/pixel-dungeon.types';
import { PixelDungeonBoard } from '../core/pixel-dungeon-board';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMap } from '../map/pixel-dungeon.map';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonJunction } from './parts/pixel-dungeon.junction';
import { PixelDungeon } from './pixel-dungeon';

export class PixelDungeonLevel implements NPSceneComponent {
    scene: NPScene;
    #map: PixelDungeonMap;
    #board: PixelDungeonBoard;

    #dungeon: PixelDungeon;

    constructor(engine: PixelDungeonEngine, options: TDungeonOptions) {
        this.scene = engine.scene;
        // create the level dungeon and map to its parts
        this.#dungeon = new PixelDungeon(options);

        // create a board and a tilemap for the dungeon
        this.#map = new PixelDungeonMap(
            engine,
            {
                width: this.#dungeon.width,
                height: this.#dungeon.height,
            },
            'shattered'
        );
        this.#board = new PixelDungeonBoard(engine, {
            width: this.#dungeon.width,
            height: this.#dungeon.height,
            tileWidth: this.#map.tileset.tileWidth,
            tileHeight: this.#map.tileset.tileHeight,
        });
    }

    preload(): void {
        this.#map.preload();
    }

    create(): void {
        this.#map.create();
        for (const tile of this.#dungeon.all) {
            tile.addToLevel(this.#map, this.#board);
        }
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
    get start() {
        const tile = this.#dungeon.rooms[0].bottomRight();
        return { x: tile.x, y: tile.y };
    }
    get board() {
        return this.#board;
    }
}
