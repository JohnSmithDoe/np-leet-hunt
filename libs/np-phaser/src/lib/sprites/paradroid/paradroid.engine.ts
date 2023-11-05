import { EFlowFrom } from '../../paradroid/paradroid.consts';
import { defaultFactoryOptions, ParadroidFactory, TParadroidFactoryOptions } from '../../paradroid/paradroid.factory';
import { getNextFlow } from '../../paradroid/paradroid.utils';
import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../../scenes/np-scene-component';
import { ParadroidField } from './paradroid.field';
import { ParadroidPath } from './paradroid.path';

export class ParadroidEngine implements NPSceneComponent {
    readonly #options: TParadroidFactoryOptions;
    #fieldGrid: ParadroidField[][];
    #factory: ParadroidFactory;
    #fields: NPSceneContainer<ParadroidField>;
    #deactivateMap: Phaser.Time.TimerEvent[] = [];

    constructor(public scene: NPScene, options?: TParadroidFactoryOptions) {
        this.#options = options ?? defaultFactoryOptions;
        this.#fields = new NPSceneContainer<ParadroidField>(scene);
        this.#factory = new ParadroidFactory(this.#options);
    }

    init(): void {
        const grid = this.#factory.generateGrid();
        this.#fieldGrid = [];
        for (const tileCol of grid) {
            const fieldCol = [];
            for (const subTile of tileCol) {
                const field = new ParadroidField(this.scene, subTile, { width: this.#options.shapeSize });
                fieldCol.push(field);
                if (field.col === 0) {
                    field.on('pointerdown', () => this.#onFieldClick(field));
                }
                field.on('activate_next', this.#activateNext, this);
                field.on('deactivate_next', this.#deactivateNext, this);
                this.#fields.add(field);
            }
            this.#fieldGrid.push(fieldCol);
        }
        this.#fields.init();
    }

    create(): void {
        this.#fields.create();
    }

    preload(): void {
        this.#fields.preload();
    }

    update(time: number, delta: number): void {
        this.#fields.update(time, delta);
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
                console.log('trigger deactive');

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
        path.next.forEach(p => this.activate(p.subTile.col, p.subTile.row, getNextFlow(path.to)));
    }
    #deactivateNext(field: ParadroidField, path: ParadroidPath) {
        console.log('deactuve next');
        path.next.forEach(p => this.deactivate(p.subTile.col, p.subTile.row, getNextFlow(path.to)));
    }
}
