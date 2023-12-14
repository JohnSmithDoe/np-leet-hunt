import ChessData from 'phaser3-rex-plugins/plugins/board/chess/ChessData';

import { EDirection, NPVec2 } from '../../../../../../np-phaser/src/lib/utilities/piecemeal';
import { TDungeonTile } from '../../../@types/pixel-dungeon.types';
import { PixelDungeon } from '../../pixel-dungeon';

export class PixelDungeonTile {
    rexChess: ChessData;
    #dungeon: PixelDungeon;
    #tile: TDungeonTile;

    constructor(tile: TDungeonTile, dungeon: PixelDungeon) {
        this.#tile = tile;
        this.#dungeon = dungeon;
    }

    wallTo(dir: EDirection) {
        return this.#dungeon.wallTo(this.#tile, dir);
    }
    junctionTo(dir: EDirection) {
        return this.#dungeon.junctionTo(this.#tile, dir);
    }
    emptyTo(dir: EDirection) {
        return this.#dungeon.emptyTo(this.#tile, dir);
    }

    floorTo(dir: EDirection) {
        return this.#dungeon.floorTo(this.#tile, dir);
    }

    get x() {
        return this.#tile.x;
    }

    get y() {
        return this.#tile.y;
    }

    get type() {
        return this.#tile.type;
    }

    get pos() {
        return new NPVec2(this.x, this.y);
    }
}
