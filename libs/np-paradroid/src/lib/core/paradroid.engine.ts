import { EFlowFrom } from '../@types/paradroid.consts';
import { getNextFlow } from '../@types/paradroid.utils';
import { ParadroidField } from '../sprites/paradroid.field';
import { ParadroidPath } from '../sprites/paradroid.path';

export class ParadroidEngine extends Phaser.Events.EventEmitter {
    static readonly EVENT_ACTIVATE_MIDDLE = 'activate_middle';
    static readonly EVENT_DEACTIVATE_MIDDLE = 'deactivate_middle';

    readonly #fieldGrid: ParadroidField[][]; // O(1) access to the #fields

    get grid() {
        return this.#fieldGrid;
    }

    constructor(fields: ParadroidField[]) {
        super();
        this.#fieldGrid = [];
        for (const field of fields) {
            field.on(ParadroidField.EVENT_ACTIVATE_NEXT, this.#activateNext, this);
            field.on(ParadroidField.EVENT_DEACTIVATE_NEXT, this.#deactivateNext, this);
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
        if (path.next.length === 0) {
            this.emit(ParadroidEngine.EVENT_ACTIVATE_MIDDLE, field.row, path.owner);
        } else {
            path.next.forEach(p => this.activate(p.subTile.col, p.subTile.row, getNextFlow(path.to)));
        }
    }

    #deactivateNext(field: ParadroidField, path: ParadroidPath) {
        if (path.next.length === 0) {
            this.emit(ParadroidEngine.EVENT_DEACTIVATE_MIDDLE, field.row, path.owner);
        } else {
            path.next.forEach(p => this.deactivate(p.subTile.col, p.subTile.row, getNextFlow(path.to)));
        }
    }
}
