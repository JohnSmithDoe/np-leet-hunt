import { EFlowFrom } from '../../paradroid/paradroid.consts';
import { defaultFactoryOptions, ParadroidFactory, TParadroidFactoryOptions } from '../../paradroid/paradroid.factory';
import { TParadroidSubTile } from '../../paradroid/paradroid.types';
import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../../scenes/np-scene-component';
import { ParadroidField } from './paradroid.field';

export class ParadroidEngine implements NPSceneComponent {
    readonly #options: TParadroidFactoryOptions;
    #grid: TParadroidSubTile[][];
    #fieldGrid: ParadroidField[][];
    #factory: ParadroidFactory;
    #fields: NPSceneContainer<ParadroidField>;

    constructor(public scene: NPScene, options?: TParadroidFactoryOptions) {
        this.#options = options ?? defaultFactoryOptions;
        this.#fields = new NPSceneContainer<ParadroidField>(scene);
        this.#factory = new ParadroidFactory(this.#options);
    }

    init(): void {
        this.#grid = this.#factory.generateGrid();
        this.#fieldGrid = [];
        for (const tileCol of this.#grid) {
            const fieldCol = [];
            for (const subTile of tileCol) {
                const field = new ParadroidField(this.scene, this, subTile, { width: this.#options.shapeSize });
                fieldCol.push(field);
                field.on('pointerdown', () => this.activate(field.col, field.row));
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
        this.#fieldGrid[col][row].activate(flow);
    }
}
