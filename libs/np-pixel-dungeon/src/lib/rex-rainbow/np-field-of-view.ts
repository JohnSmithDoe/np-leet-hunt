import { EDirection, mapToRexPluginDirection } from '@shared/np-library';
import FieldOfView from 'phaser3-rex-plugins/plugins/board/fieldofview/FieldOfView';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

const equalTile = (tile: TileXYType, other: TileXYType) => tile.x === other.x && tile.y === other.y;

export class NPFieldOfView extends FieldOfView<PixelDungeonMob> {
    #currentVision: TileXYType[];
    constructor(private mob: PixelDungeonMob) {
        super(mob, {
            // preTestCallback: a => this.engine.preTestCallback(a, this.options.visionRange),
            // costCallback: a => this.engine.costs(a),
            preTestCallback: undefined,
            costCallback: undefined,
            coneMode: 'angle',
            cone: mob.options.fovConeAngle,
            occupiedTest: false,
            blockerTest: true,
            perspective: false, // true crashs
        });
        this.setFaceByDirection(mob.options.startingDirection);
        this.updateVision();
    }

    setFaceByDirection(direction: EDirection): this {
        return super.setFace(mapToRexPluginDirection(direction));
    }
    updateVision() {
        this.#currentVision = this.findFOV();
        this.#currentVision.push({ ...this.mob.tile }); // my self
    }

    canSee(tile: TileXYType) {
        return !!this.#currentVision.find(other => equalTile(tile, other));
    }
    get vision() {
        return this.#currentVision;
    }
}
