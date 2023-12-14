import { EDirection } from '@shared/np-library';

import { TDungeonTile } from '../../@types/pixel-dungeon.types';
import { PixelDungeonBoard } from '../../core/pixel-dungeon-board';
import { PixelDungeonMap } from '../../map/pixel-dungeon.map';
import { NPTilesetMappingNew } from '../../map/pixel-dungeon-tileset';
import { PixelDungeon } from '../pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonJunction extends PixelDungeonTile {
    regions: Set<number>;

    #map: PixelDungeonMap;
    #open = false;
    private vertical: boolean;

    constructor(tile: TDungeonTile, dungeon: PixelDungeon) {
        super(tile, dungeon);
        this.regions = dungeon.cardinalRegions(tile);
    }
    addToLevel(map: PixelDungeonMap, board: PixelDungeonBoard): void {
        board.addChess(this, this.x, this.y, 'objects', false);
        this.rexChess.setBlocker(false);
        this.#map = map;
        this.#render();
    }

    #render() {
        this.#map.floorlayer.putPixeldungeonTileAt(this, 'FLOOR');
        this.#map.objectlayer.putTileAt(this, this.#toTileIndex());
        this.#map.stitchlayer.putTileAt(this.pos.addDirection(EDirection.N), this.#toStitchingTileIndex());
    }

    #toTileIndex(): keyof NPTilesetMappingNew {
        this.vertical = this.wallTo(EDirection.E) && this.wallTo(EDirection.W);
        if (this.vertical) {
            return this.#open ? 'DOOR' : 'DOOR_CLOSED';
        } else {
            if (!this.wallTo(EDirection.SE)) {
                return this.#open ? 'DOOR_II' : 'DOOR_II_CLOSED';
            } else {
                return this.#open ? 'DOOR_II_WALLED' : 'DOOR_II_WALLED_CLOSED';
            }
        }
    }

    #toStitchingTileIndex(): keyof NPTilesetMappingNew {
        if (this.vertical) {
            return this.#open ? 'DOOR_STITCH' : 'DOOR_STITCH_CLOSED';
        } else {
            return this.#open ? 'DOOR_STITCH_II' : 'DOOR_STITCH_II_CLOSED';
        }
    }

    public setOpen(isOpen: boolean, render = true) {
        this.#open = isOpen;
        if (render) this.#render();
    }
}
