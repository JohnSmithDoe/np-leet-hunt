import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { ParadroidButton } from '../sprites/paradroid/paradroid.button';
import { ParadroidField } from '../sprites/paradroid/paradroid.field';
import { BinaryTimer } from '../sprites/timer/binarytimer';
import { ParadroidEngine } from './paradroid.engine';
import { defaultFactoryOptions, ParadroidFactory, TParadroidFactoryOptions } from './paradroid.factory';

export class ParadroidGame extends NPSceneContainer<NPSceneComponent> {
    readonly #options: TParadroidFactoryOptions;
    #factory: ParadroidFactory;

    #droidFields: NPSceneContainer<ParadroidField>;
    #droidEngine: ParadroidEngine;
    #droidButtons: NPSceneContainer<ParadroidButton>;
    // move to button -> then no map is needed
    #deactivateMap: Phaser.Time.TimerEvent[] = [];

    #middle: NPSceneContainer<ParadroidButton>;

    #fields: NPSceneContainer<ParadroidField>;
    #engine: ParadroidEngine;
    #buttons: NPSceneContainer<ParadroidButton>;
    #timer: BinaryTimer;
    container: Phaser.GameObjects.Container;

    constructor(scene: NPScene, options?: TParadroidFactoryOptions) {
        super(scene);
        this.#options = options ?? defaultFactoryOptions;
    }

    init() {
        this.#factory = new ParadroidFactory(this.#options);

        this.#fields = this.#generateFields();
        this.#engine = new ParadroidEngine(this.#fields.list);
        this.#fields.list.forEach(field => {
            if (field.col === 0) {
                field.setInteractive({ useHandCursor: true });
                field.on('pointerdown', () => this.#onFieldClick(field));
            }
        });
        this.add(this.#fields);

        this.#buttons = this.#generateButtons();
        this.add(this.#buttons);

        this.#timer = new BinaryTimer(this.scene, -125 + 32, -64, { startTime: 30e3, min: false });
        this.add(this.#timer);

        this.#middle = this.#generateMiddleRow();
        this.add(this.#middle);

        this.#droidFields = this.#generateFields();
        this.#droidEngine = new ParadroidEngine(this.#droidFields.list);
        this.add(this.#droidFields);

        this.#droidButtons = this.#generateButtons();
        this.add(this.#droidButtons);

        super.init();
    }

    create(container?: Phaser.GameObjects.Container) {
        let x = 0;
        const y = 100;
        const buttons = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#buttons.create(buttons);
        x += 64;
        const fields = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#fields.create(fields);
        x += this.#factory.columns * 64;
        const middle = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#middle.create(middle);
        x += 64;
        x += this.#factory.columns * 64;
        const droid = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#droidFields.create(droid);
        droid.setScale(-1, 1);
        const buttons2 = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#droidButtons.create(buttons2);

        this.#timer.create(middle);
        container?.add(buttons);
        container?.add(fields);
        container?.add(middle);
        container?.add(droid);
        container?.add(buttons2);
        this.container = container;
    }

    #generateFields() {
        const grid = this.#factory.generateGrid();
        const result = new NPSceneContainer<ParadroidField>(this.scene);
        for (const tileCol of grid) {
            for (const subTile of tileCol) {
                const field = new ParadroidField(this.scene, subTile, {
                    width: this.#options.tileWidth,
                    height: this.#options.tileHeight ?? this.#options.tileWidth,
                });
                result.add(field);
            }
        }
        return result;
    }

    #generateButtons() {
        const result = new NPSceneContainer<ParadroidButton>(this.scene);
        const firstRow = this.#engine.grid[0];
        for (const field of firstRow) {
            const paradroidButton = new ParadroidButton(this.scene, 0, field.y, 'Go');
            result.add(paradroidButton);
        }
        return result;
    }

    #generateMiddleRow() {
        const result = new NPSceneContainer<ParadroidButton>(this.scene);
        const firstRow = this.#engine.grid[0];
        for (const field of firstRow) {
            const paradroidButton = new ParadroidButton(this.scene, 0, field.y, 'Mid');
            result.add(paradroidButton);
        }
        return result;
    }

    #onFieldClick(field: ParadroidField) {
        this.#engine.activate(field.col, field.row);
        this.#droidEngine.activate(field.col, field.row);
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
}
