import { EDirection, NPVec2 } from '@shared/np-library';
import ChessData from 'phaser4-rex-plugins/plugins/board/chess/ChessData';

import { TDungeonTile } from '../../@types/pixel-dungeon.types';
import { PixelDungeonBoard } from '../../core/pixel-dungeon-board';
import { PixelDungeonMap } from '../../map/pixel-dungeon.map';
import { PixelDungeon } from '../pixel-dungeon';

export abstract class PixelDungeonTile {
    rexChess!: ChessData; // injected by the rex board plugin via board.addChess
    #dungeon: PixelDungeon;
    #tile: TDungeonTile;

    constructor(tile: TDungeonTile, dungeon: PixelDungeon) {
        this.#tile = tile;
        this.#dungeon = dungeon;
    }

    abstract addToLevel(map: PixelDungeonMap, board: PixelDungeonBoard): void;

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
