import { NPScene } from '../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { ParadroidButton } from '../sprites/paradroid/paradroid.button';
import { ParadroidField } from '../sprites/paradroid/paradroid.field';
import { ParadroidEngine } from './paradroid.engine';
import { defaultFactoryOptions, ParadroidFactory, TParadroidFactoryOptions } from './paradroid.factory';

export class ParadroidGame extends NPSceneContainer<NPSceneComponent> {
    readonly #options: TParadroidFactoryOptions;
    #factory: ParadroidFactory;
    #fields: NPSceneContainer<ParadroidField>;
    #fieldGrid: ParadroidField[][]; // O(1) access to the #fields
    // move to button -> then no map is needed
    #deactivateMap: Phaser.Time.TimerEvent[] = [];
    #engine: ParadroidEngine;
    #buttons: NPSceneContainer<ParadroidButton>;
    #middle: NPSceneContainer<ParadroidButton>;

    constructor(scene: NPScene, options?: TParadroidFactoryOptions) {
        super(scene);
        this.#options = options ?? defaultFactoryOptions;
        this.#factory = new ParadroidFactory(this.#options);
        this.#engine = new ParadroidEngine(scene, this.#options);
    }

    init() {
        const grid = this.#factory.generateGrid();
        // const droidGrid = this.#factory.generateGrid();
        this.#fields = this.#engine.generateFields(grid);
        this.add(this.#fields);
        // const droidFields = this.#engine.generateFields(droidGrid);
        this.#buttons = this.#engine.generateButtons(this.#engine.grid);
        this.add(this.#buttons);
        this.#middle = this.#engine.generateMiddleRow(this.#engine.grid);
        this.add(this.#middle);
        super.init();
    }

    create() {
        const container = new Phaser.GameObjects.Container(this.scene, 0, 0, []);
        this.#buttons.create(container);
        const container2 = new Phaser.GameObjects.Container(this.scene, 64, 0, []);
        this.#fields.create(container2);
        const container3 = new Phaser.GameObjects.Container(this.scene, 1000, 0, []);
        this.#middle.create(container3);
        this.scene.addToLayer('ui', container);
        this.scene.addToLayer('ui', container2);
        this.scene.addToLayer('ui', container3);
    }
}
