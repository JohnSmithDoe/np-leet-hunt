import * as Phaser from 'phaser';

import { ParadroidField } from '../sprites/paradroid/paradroid.field';
import { ParadroidPath } from '../sprites/paradroid/paradroid.path';
import { EFlowFrom } from './paradroid.consts';
import { TParadroidPlayer } from './paradroid.types';
import { getNextFlow } from './paradroid.utils';

export class ParadroidEngine {
    readonly #fieldGrid: ParadroidField[][]; // O(1) access to the #fields
    // move to button -> then no map is needed
    #deactivateMap: Phaser.Time.TimerEvent[] = [];
    get grid() {
        return this.#fieldGrid;
    }

    constructor(fields: ParadroidField[]) {
        this.#fieldGrid = [];
        for (const field of fields) {
            field.on('activate_next', this.#activateNext, this);
            field.on('deactivate_next', this.#deactivateNext, this);
            if (!this.#fieldGrid[field.col]) {
                this.#fieldGrid[field.col] = [];
            }
            this.#fieldGrid[field.col][field.row] = field;
        }
    }

    activate(col: number, row: number, flow: EFlowFrom = EFlowFrom.Left) {
        const field = this.#fieldGrid[col][row];
        field.activate(flow);
    }

    deactivate(col: number, row: number, flow: EFlowFrom = EFlowFrom.Left) {
        const field = this.#fieldGrid[col][row];
        field.deactivate(flow);
    }

    #activateNext(field: ParadroidField, path: ParadroidPath) {
        console.log('actuve next');
        if (path.next.length === 0) {
            console.log('end reached');
            this.#activateMiddle(field.row, path.owner);
        } else {
            path.next.forEach(p => this.activate(p.subTile.col, p.subTile.row, getNextFlow(path.to)));
        }
    }

    #deactivateNext(field: ParadroidField, path: ParadroidPath) {
        console.log('deactuve next');
        path.next.forEach(p => this.deactivate(p.subTile.col, p.subTile.row, getNextFlow(path.to)));
    }

    #activateMiddle(row: number, owner: TParadroidPlayer) {
        console.log(row, owner);
    }
}
