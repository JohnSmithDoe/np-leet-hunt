import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonFloorLayer } from './layer/pixel-dungeon-floorlayer';
import { PixelDungeonObjectlayer } from './layer/pixel-dungeon-objectlayer';
import { PixelDungeonTilelayer } from './layer/pixel-dungeon-tilelayer';
import { PixelDungeonWallLayer } from './layer/pixel-dungeon-walllayer';
import { PixelDungeonTileset, TNPTilesetKey } from './pixel-dungeon-tileset';

export interface TPixelDungeonMapOptions {
    width: number;
    height: number;
}
export class PixelDungeonMap implements NPSceneComponent {
    scene: NPSceneWithBoard;

    #map: Phaser.Tilemaps.Tilemap;
    #tileset: PixelDungeonTileset;
    #options: TPixelDungeonMapOptions;

    #floor: PixelDungeonFloorLayer;
    #walls: PixelDungeonTilelayer;
    #objects: PixelDungeonTilelayer;
    #stitches: PixelDungeonTilelayer;

    constructor(engine: PixelDungeonEngine, options: TPixelDungeonMapOptions, type: TNPTilesetKey) {
        this.scene = engine.scene;
        this.#options = options;
        this.#tileset = new PixelDungeonTileset(type);
    }

    preload(): void {
        // shamelessly stole from shattered-pixel-dungeon
        this.scene.load.image(this.tileset.key, this.tileset.imageUrl);
    }

    create() {
        // Creating a blank tilemap with dimensions matching the dungeon
        this.#map = this.scene.make.tilemap({
            tileWidth: this.tileset.tileWidth,
            tileHeight: this.tileset.tileHeight,
            width: this.#options.width,
            height: this.#options.height,
        });
        this.#tileset.addToMap(this.#map);
        // having multiple tile layers
        this.#floor = new PixelDungeonFloorLayer('floors', this.scene, this.#map, this.#tileset);
        this.#walls = new PixelDungeonWallLayer('walls', this.scene, this.#map, this.#tileset);
        this.#objects = new PixelDungeonObjectlayer('objects', this.scene, this.#map, this.#tileset);
        this.#stitches = new PixelDungeonObjectlayer('stitches', this.scene, this.#map, this.#tileset);
        this.#stitches.tilelayer.setDepth(10);
        // this.#walls.tilelayer.setVisible(false);
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

    get floorlayer() {
        return this.#floor;
    }

    get walllayer() {
        return this.#walls;
    }

    get objectlayer() {
        return this.#objects;
    }

    get stitchlayer() {
        return this.#stitches;
    }
}
