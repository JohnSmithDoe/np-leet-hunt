import { EDirection } from '@shared/np-library';

import { NPTilesetMappingNew } from '../../../map/pixel-dungeon-tileset';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonJunction extends PixelDungeonTile {
    regions: number[];

    #open = false;
    private vertical: boolean;

    toTileIndex(): keyof NPTilesetMappingNew {
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

    public needsStitching() {
        return true;
    }

    public toStitchingTileIndex(): keyof NPTilesetMappingNew {
        if (this.vertical) {
            return this.#open ? 'DOOR_STITCH' : 'DOOR_STITCH_CLOSED';
        } else {
            return this.#open ? 'DOOR_STITCH_II' : 'DOOR_STITCH_II_CLOSED';
        }
    }

    public setOpen(isOpen: boolean) {
        this.#open = isOpen;
    }
}
