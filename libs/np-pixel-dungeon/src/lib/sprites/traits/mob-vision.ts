import { EDirection, mapRexPluginDirection, mapToRexPluginDirection } from '@shared/np-library';
import FieldOfView from 'phaser4-rex-plugins/plugins/board/fieldofview/FieldOfView';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { PixelDungeonMob } from '../pixel-dungeon.mob';

export const equalTile = (tile: TileXYType, other: TileXYType) => tile.x === other.x && tile.y === other.y;

export class MobVision extends FieldOfView<PixelDungeonMob> {
    #currentView: TileXYType[] = [];
    constructor(private mob: PixelDungeonMob) {
        // preTestCallback / costCallback are typed as required by the plugin but are
        // optional at runtime; omit them (use the plugin defaults) and cast the config.
        // preTestCallback: a => this.mob.engine.preTestCallback(a, this.options.visionRange),
        // costCallback: a => this.engine.costs(a),
        super(mob, {
            coneMode: 'angle',
            cone: mob.options.fovConeAngle,
            occupiedTest: false,
            blockerTest: true,
            perspective: false, // true crashs
        } as FieldOfView.IConfig);
        this.faceDirection = mob.options.startingDirection!;
        this.updateVision();
    }

    updateVision() {
        this.#currentView = this.findFOV();
        this.#currentView.push({ ...this.mob.tile }); // my self
    }

    canSee(tile: TileXYType) {
        return !!this.#currentView.find(other => equalTile(tile, other));
    }
    get currentView() {
        return this.#currentView;
    }
    get faceDirection() {
        return mapRexPluginDirection(this.face);
    }
    set faceDirection(direction: EDirection) {
        super.setFace(mapToRexPluginDirection(direction)!);
    }
}
