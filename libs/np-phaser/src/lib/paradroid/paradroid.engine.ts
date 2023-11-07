import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPSceneContainer } from '../scenes/np-scene-component';
import { ParadroidButton } from '../sprites/paradroid/paradroid.button';
import { ParadroidField } from '../sprites/paradroid/paradroid.field';
import { ParadroidPath } from '../sprites/paradroid/paradroid.path';
import { EFlowFrom } from './paradroid.consts';
import { defaultFactoryOptions, TParadroidFactoryOptions } from './paradroid.factory';
import { TParadroidPlayer, TParadroidSubTile } from './paradroid.types';
import { getNextFlow } from './paradroid.utils';

export class ParadroidEngine {
    readonly #options: TParadroidFactoryOptions;
    #fieldGrid: ParadroidField[][]; // O(1) access to the #fields
    // move to button -> then no map is needed
    #deactivateMap: Phaser.Time.TimerEvent[] = [];

    constructor(public scene: NPScene, options?: TParadroidFactoryOptions) {
        this.#options = options ?? defaultFactoryOptions;
    }

    activate(col: number, row: number, flow: EFlowFrom = EFlowFrom.Left) {
        const field = this.#fieldGrid[col][row];
        field.activate(flow);
    }

    deactivate(col: number, row: number, flow: EFlowFrom = EFlowFrom.Left) {
        const field = this.#fieldGrid[col][row];
        field.deactivate(flow);
    }

    #onFieldClick(field: ParadroidField) {
        this.activate(field.col, field.row);
        const key = field.row;
        const config: Phaser.Types.Time.TimerEventConfig = {
            delay: 3000,
            callback: () => {
                delete this.#deactivateMap[key];
                field.deactivate();
            },
        };
        if (this.#deactivateMap[key]) {
            this.#deactivateMap[key].reset(config);
        } else {
            this.#deactivateMap[key] = this.scene.time.addEvent(config);
        }
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

    generateFields(grid: TParadroidSubTile[][]) {
        const result = new NPSceneContainer<ParadroidField>(this.scene);
        this.#fieldGrid = [];
        for (const tileCol of grid) {
            const fieldCol = [];
            for (const subTile of tileCol) {
                const field = new ParadroidField(this.scene, subTile, {
                    width: this.#options.shapeSize,
                    interactive: subTile.col === 0,
                });
                fieldCol.push(field);
                if (field.col === 0) {
                    field.on('pointerdown', () => this.#onFieldClick(field));
                }
                field.on('activate_next', this.#activateNext, this);
                field.on('deactivate_next', this.#deactivateNext, this);
                result.add(field);
            }
            this.#fieldGrid.push(fieldCol);
        }
        return result;
    }

    generateButtons(grid: ParadroidField[][]) {
        const result = new NPSceneContainer<ParadroidButton>(this.scene);
        const firstRow = grid[0];
        for (const field of firstRow) {
            const paradroidButton = new ParadroidButton(this.scene, 0, field.y, 'Go');
            result.add(paradroidButton);
        }
        return result;
    }

    get grid() {
        return this.#fieldGrid;
    }

    generateMiddleRow(grid: ParadroidField[][]) {
        const result = new NPSceneContainer<ParadroidButton>(this.scene);
        const firstRow = grid[0];
        for (const field of firstRow) {
            const paradroidButton = new ParadroidButton(this.scene, 0, field.y, 'Mid');
            result.add(paradroidButton);
        }
        return result;
    }
}
