import * as Phaser from 'phaser';

import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../../../../np-phaser/src/lib/scenes/np-scene-component';
import { BinaryTimer } from '../../../../np-phaser/src/lib/sprites/timer/binarytimer';
import { EParadroidOwner } from '../@types/paradroid.consts';
import { TParadroidPlayer } from '../@types/paradroid.types';
import { ParadroidButton } from '../sprites/paradroid.button';
import { ParadroidField } from '../sprites/paradroid.field';
import { ParadroidMiddle } from '../sprites/paradroid.middle';
import { ParadroidEngine } from './paradroid.engine';
import { defaultFactoryOptions, ParadroidFactory, TParadroidFactoryOptions } from './paradroid.factory';

export class ParadroidGame extends NPSceneContainer<NPSceneComponent> {
    readonly #options: TParadroidFactoryOptions;
    #factory: ParadroidFactory;

    #droidFields: NPSceneContainer<ParadroidField>;
    #droidEngine: ParadroidEngine;
    #droidButtons: NPSceneContainer<ParadroidButton>;

    #middleCol: NPSceneContainer<ParadroidMiddle>;

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
        this.#fields = this.#generateFields(EParadroidOwner.Player);
        this.#engine = new ParadroidEngine(this.#fields.list);
        this.#engine.on(ParadroidEngine.EVENT_ACTIVATE_MIDDLE, (row: number, owner: TParadroidPlayer) =>
            this.#middle(row).activate(owner)
        );
        this.#engine.on(ParadroidEngine.EVENT_DEACTIVATE_MIDDLE, (row: number, owner: TParadroidPlayer) =>
            this.#middle(row).deactivate(owner)
        );
        this.add(this.#fields);

        this.#buttons = this.#generateButtons(this.#engine);

        this.add(this.#buttons);

        this.#timer = new BinaryTimer(this.scene, -125 + 32, (this.#factory.columns + 3) * 64, {
            startTime: 30e3,
            min: false,
        });
        this.add(this.#timer);

        this.#middleCol = this.#generateMiddleRow();
        this.add(this.#middleCol);

        this.#droidFields = this.#generateFields(EParadroidOwner.Droid);
        this.#droidEngine = new ParadroidEngine(this.#droidFields.list);

        this.#droidEngine.on(ParadroidEngine.EVENT_ACTIVATE_MIDDLE, (row: number, owner: TParadroidPlayer) =>
            this.#middle(row).activate(owner)
        );
        this.#droidEngine.on(ParadroidEngine.EVENT_DEACTIVATE_MIDDLE, (row: number, owner: TParadroidPlayer) =>
            this.#middle(row).deactivate(owner)
        );
        this.add(this.#droidFields);

        this.#droidButtons = this.#generateButtons(this.#droidEngine);
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
        this.#middleCol.create(middle);
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

    #generateFields(owner: EParadroidOwner) {
        const grid = this.#factory.generateGrid(owner);
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

    #generateButtons(engine: ParadroidEngine) {
        const result = new NPSceneContainer<ParadroidButton>(this.scene);
        const firstRow = engine.grid[0];
        for (const field of firstRow) {
            const paradroidButton = new ParadroidButton(this.scene, field);
            result.add(paradroidButton);
        }
        return result;
    }

    #generateMiddleRow() {
        const result = new NPSceneContainer<ParadroidMiddle>(this.scene);
        const firstRow = this.#engine.grid[0];
        const total = new ParadroidMiddle(this.scene, -1, 0, -64); // TODO button size
        result.add(total);

        for (const field of firstRow) {
            const middle = new ParadroidMiddle(this.scene, field.row, 0, field.y);
            middle.on(ParadroidMiddle.EVENT_CHANGED, () => this.#updateMiddleTotal());
            result.add(middle);
        }
        return result;
    }

    #middle(row: number) {
        return this.#middleCol.list.find(m => m.row === row);
    }

    #updateMiddleTotal() {
        const all = this.#middleCol.list.reduce(
            (stats, middle) => {
                if (middle.row < 0) return stats; // total
                switch (middle.owner) {
                    case 'middle-player':
                        stats.player++;
                        break;
                    case 'middle-droid':
                        stats.droid++;
                        break;
                    case 'middle-both':
                        stats.player++;
                        stats.droid++;
                        break;
                }
                return stats;
            },
            { none: 0, player: 0, droid: 0 }
        );
        if (all.droid === 0 && all.player === 0) {
            this.#middle(-1).owner = 'middle';
        } else if (all.droid === all.player) {
            this.#middle(-1).owner = 'middle-both';
        } else if (all.droid > all.player) {
            this.#middle(-1).owner = 'middle-droid';
        } else if (all.droid < all.player) {
            this.#middle(-1).owner = 'middle-player';
        }
        console.log(all);
    }
}
