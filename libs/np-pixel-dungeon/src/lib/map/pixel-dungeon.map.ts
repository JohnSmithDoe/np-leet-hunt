import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { NPSceneWithBoard, TDungeonOptions } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonJunction } from '../dungeon/pixel-dungeon.junction';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonFloorLayer } from './pixel-dungeon-floorlayer';
import { PixelDungeonObjectlayer } from './pixel-dungeon-objectlayer';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';
import { PixelDungeonTileset, TNPTilesetKey } from './pixel-dungeon-tileset';
import { PixelDungeonWallLayer } from './pixel-dungeon-walllayer';

export class PixelDungeonMap implements NPSceneComponent {
    scene: NPSceneWithBoard;

    #dungeon: PixelDungeon;
    #map: Phaser.Tilemaps.Tilemap;
    #floor: PixelDungeonFloorLayer;
    #walls: PixelDungeonTilelayer;
    #engine: PixelDungeonEngine;
    start: TileXYType;
    #tileset: PixelDungeonTileset;
    #objects: PixelDungeonObjectlayer;

    constructor(engine: PixelDungeonEngine, options: TDungeonOptions, type: TNPTilesetKey) {
        this.#dungeon = new PixelDungeon(options);
        this.#engine = engine;
        this.#tileset = new PixelDungeonTileset(type);
        this.scene = this.#engine.scene;
    }

    init(): void {
        this.#dungeon.init();
    }

    preload(): void {
        // Credits! Michele "Buch" Bucelli (tilset artist) & Abram Connelly (tileset sponser)
        // https://opengameart.org/content/top-down-dungeon-tileset
        // shamelessly stole from shattered-pixel-dungeon
        this.scene.load.image(this.tileset.key, this.tileset.imageUrl);
    }

    create() {
        // Creating a blank tilemap with dimensions matching the dungeon
        this.#map = this.scene.make.tilemap({
            tileWidth: this.tileset.tileWidth,
            tileHeight: this.tileset.tileHeight,
            width: this.#dungeon.width,
            height: this.#dungeon.height,
        });
        this.#tileset.addToMap(this.#map);
        this.#floor = new PixelDungeonFloorLayer('floors', this.scene, this.#map, this.#tileset);
        this.start = this.#floor.mapDungeonToLayer(this.#dungeon);
        this.#walls = new PixelDungeonWallLayer('walls', this.scene, this.#map, this.#tileset);
        this.#walls.mapDungeonToLayer(this.#dungeon);
        // this.#walls.tilelayer.setVisible(false);
        this.#objects = new PixelDungeonObjectlayer('objects', this.scene, this.#map, this.#tileset);
        this.#objects.mapDungeonToLayer(this.#dungeon);
        this.#floor.tilelayer.setInteractive({ useHandcursor: true });
        this.tilemap.setLayer('floors');
        this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#floor.tilelayer.off(Phaser.Input.Events.POINTER_UP);
        });
    }

    loseVision(tileXYTypes?: TileXYType[]) {
        tileXYTypes?.forEach(tile => ((this.#map.getTileAt(tile.x, tile.y) ?? { alpha: 0 }).alpha = 0.5));
    }

    gainVision(view?: TileXYType[]) {
        view?.forEach(tile => ((this.#map.getTileAt(tile.x, tile.y) ?? { alpha: 0 }).alpha = 1));
    }

    get tilemap() {
        return this.#map;
    }

    get tileset() {
        return this.#tileset;
    }

    get dungeon() {
        return this.#dungeon;
    }

    public doors(mobs: PixelDungeonMob[]) {
        for (const mob of mobs) {
            const tile = this.#engine.board.getTile(mob.tile);
            if (tile instanceof PixelDungeonJunction) {
                tile.setOpen(true);
            }
        }
        // for (const junction of this.dungeon.junctions) {
        //     junction.setOpen(!!mobs.find(mob => equalTile(junction.tile, mob.tile)));
        // }
        this.#objects.mapDungeonToLayer(this.#dungeon);
    }
}
