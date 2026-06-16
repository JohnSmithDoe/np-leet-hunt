import { NPGameObject, NPGameObjectList, NPScene } from '@shared/np-phaser';
import { Balance, DuelAiParams } from '@shared/np-state';
import * as Phaser from 'phaser';

import { BinaryTimer } from '../../../../np-phaser/src/lib/sprites/timer/binarytimer';
import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { EParadroidOwner } from '../@types/paradroid.consts';
import { TParadroidPlayer, TParadroidSubTile } from '../@types/paradroid.types';
import { ParadroidButton } from '../sprites/paradroid.button';
import { ParadroidField } from '../sprites/paradroid.field';
import { ParadroidImage } from '../sprites/paradroid.image';
import { ParadroidMiddle } from '../sprites/paradroid.middle';
import { ParadroidAi, TParadroidAiObservation } from './paradroid.ai';
import { ParadroidEngine } from './paradroid.engine';
import { defaultFactoryOptions, ParadroidFactory, TParadroidFactoryOptions } from './paradroid.factory';

/** The match length and the per-press hold, kept in step with the timer and the button debounce. */
const MATCH_DURATION_MS = 30_000;
const DROID_HOLD_MS = 3_000;

/** The decided outcome of a duel — payload of {@link ParadroidGame.EVENT_MATCH_ENDED}. */
export interface TParadroidMatchResult {
    winner: 'player' | 'droid' | 'draw';
    playerScore: number;
    droidScore: number;
}

export class ParadroidGame extends NPGameObjectList<NPGameObject> {
    /** Fired on {@link ParadroidGame.events} once the timer is up and all flows have settled. */
    static readonly EVENT_MATCH_ENDED = 'paradroid-match-ended';
    /** The game's own event bus — NPGameObjectList is a Phaser List, not an EventEmitter. */
    readonly events = new Phaser.Events.EventEmitter();

    readonly #options: TParadroidFactoryOptions;
    readonly #aiParams: DuelAiParams;
    #factory!: ParadroidFactory;

    #droidFields!: NPGameObjectList<ParadroidField>;
    #droidEngine!: ParadroidEngine;
    #droidButtons!: NPGameObjectList<ParadroidButton>;
    #droidShots!: NPGameObjectList<ParadroidImage>;
    #droidGrid!: TParadroidSubTile[][];

    #middleCol!: NPGameObjectList<ParadroidMiddle>;

    #fields!: NPGameObjectList<ParadroidField>;
    #engine!: ParadroidEngine;
    #buttons!: NPGameObjectList<ParadroidButton>;
    #shots!: NPGameObjectList<ParadroidImage>;
    #timer!: BinaryTimer;
    container!: Phaser.GameObjects.Container;

    // Match state — the duel only ticks between startMatch() and the buzzer-plus-settle.
    #ai?: ParadroidAi;
    #running = false;
    #ended = false;
    #timeUp = false;
    #elapsedMs = 0;
    readonly #droidHoldUntil = new Map<number, number>(); // droid row -> hold expiry (match ms)

    constructor(scene: NPScene, options?: TParadroidFactoryOptions, aiParams?: DuelAiParams) {
        super(scene);
        this.#options = options ?? defaultFactoryOptions;
        this.#aiParams = aiParams ?? Balance.duelAiParams('normal');
    }

    init() {
        this.#factory = new ParadroidFactory(this.#options);
        this.#fields = this.#generateFields(EParadroidOwner.Player);
        this.#engine = new ParadroidEngine(this.#fields.list);
        this.#wireMiddleEvents(this.#engine);
        this.add(this.#fields);

        this.#buttons = this.#generateButtons(this.#engine);
        this.add(this.#buttons);
        this.#shots = this.#generateShots();
        this.add(this.#shots);

        this.#timer = new BinaryTimer(
            this.scene,
            -125 + this.#options.tileWidth / 2,
            this.#factory.rows * this.#options.tileHeight + this.#options.tileHeight / 4,
            {
                startTime: MATCH_DURATION_MS,
                min: false,
            }
        );
        this.#timer.on(BinaryTimer.EVENT_TIMER_ENDED, () => {
            this.#timeUp = true;
            // Freeze the 3s hold timers (and all other scene timers) so the rows lit at the buzzer stay
            // lit while in-flight flows finish — the scene update loop still runs, so fills/drains settle.
            this.scene.time.paused = true;
        });
        this.add(this.#timer);

        this.#middleCol = this.#generateMiddleRow();
        this.add(this.#middleCol);

        this.#droidFields = this.#generateFields(EParadroidOwner.Droid);
        this.#droidEngine = new ParadroidEngine(this.#droidFields.list);
        this.#wireMiddleEvents(this.#droidEngine);
        this.add(this.#droidFields);

        this.#droidButtons = this.#generateButtons(this.#droidEngine);
        this.add(this.#droidButtons);
        this.#droidShots = this.#generateShots();
        this.add(this.#droidShots);

        super.init();
    }

    /** Route an engine's middle-row activation events to the shared middle column. */
    #wireMiddleEvents(engine: ParadroidEngine) {
        engine.on(ParadroidEngine.EVENT_ACTIVATE_MIDDLE, (row: number, owner: TParadroidPlayer) =>
            this.#middle(row)!.activate(owner)
        );
        engine.on(ParadroidEngine.EVENT_DEACTIVATE_MIDDLE, (row: number, owner: TParadroidPlayer) =>
            this.#middle(row)!.deactivate(owner)
        );
    }

    /**
     * Begin the duel: arm the seeded droid AI and start the countdown. Until this runs the board is idle.
     * Pass `aiParams` to override the injected difficulty for this match (e.g. a "start hard" button).
     */
    startMatch(aiParams: DuelAiParams = this.#aiParams) {
        // Seed the AI from the board seed when present (fully reproducible duel), else a fresh seed.
        const seed = this.#options.seed ? `${this.#options.seed}:ai` : `${Date.now()}`;
        this.#ai = new ParadroidAi(this.#droidGrid, aiParams, new NPRng(seed));
        this.#elapsedMs = 0;
        this.#timeUp = false;
        this.#ended = false;
        this.#running = true;
        this.#droidHoldUntil.clear();
        this.scene.time.paused = false; // resume timers in case a previous match left the clock frozen
        this.#timer.start();
    }

    update(...args: unknown[]) {
        super.update(...args); // drive children: timer countdown + path animations
        if (!this.#running || this.#ended) return;
        this.#elapsedMs += (args[1] as number) ?? 0;
        if (this.#timeUp) {
            // Buzzer hit: only score once every flow has finished filling/draining.
            if (this.#allSettled()) this.#finish();
            return;
        }
        this.#runDroidAi();
    }

    /** Ask the AI for a move this tick and, if it fires, click the droid button and record the hold. */
    #runDroidAi() {
        for (const [row, expiry] of [...this.#droidHoldUntil]) {
            if (this.#elapsedMs >= expiry) this.#droidHoldUntil.delete(row);
        }
        const shotsLeft = this.#droidShots.list.length;
        const obs: TParadroidAiObservation = {
            elapsedMs: this.#elapsedMs,
            durationMs: MATCH_DURATION_MS,
            shotsLeft,
            pressedRows: [...this.#droidHoldUntil.keys()],
            availableRows: shotsLeft > 0 ? this.#droidButtons.list.map(b => b.row) : [],
        };
        const row = this.#ai!.decide(obs);
        if (row === null) return;
        this.#droidButtons.list.find(b => b.row === row)?.press();
        this.#droidHoldUntil.set(row, this.#elapsedMs + DROID_HOLD_MS);
    }

    /** True once no path on either board is still animating (fill/drain), so the score is final. */
    #allSettled() {
        return [...this.#fields.list, ...this.#droidFields.list].every(field => field.settled);
    }

    /** Decide the winner from the lit middle column, freeze input, and announce the result. */
    #finish() {
        this.#ended = true;
        this.#running = false;
        [...this.#buttons.list, ...this.#droidButtons.list].forEach(button => (button.disabled = true));
        const { player, droid } = this.#tallyMiddle();
        const winner = droid > player ? 'droid' : player > droid ? 'player' : 'draw';
        const result: TParadroidMatchResult = { winner, playerScore: player, droidScore: droid };
        this.events.emit(ParadroidGame.EVENT_MATCH_ENDED, result);
    }

    /** Count the middle rows lit for each side (a shared `both` row counts for both). */
    #tallyMiddle() {
        let player = 0;
        let droid = 0;
        for (const middle of this.#middleCol.list) {
            if (middle.row < 0) continue; // skip the aggregate total tile
            if (middle.owner === 'middle-player' || middle.owner === 'middle-both') player++;
            if (middle.owner === 'middle-droid' || middle.owner === 'middle-both') droid++;
        }
        return { player, droid };
    }

    create(container?: Phaser.GameObjects.Container) {
        let x = 0;
        let y = 100;
        const buttons = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#buttons.create(buttons);
        x += this.#options.tileWidth;
        const fields = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#fields.create(fields);
        x += this.#factory.columns * this.#options.tileWidth;
        const middle = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#middleCol.create(middle);
        x += this.#options.tileWidth;
        x += this.#factory.columns * this.#options.tileWidth;
        const droid = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#droidFields.create(droid);
        droid.setScale(-1, 1);
        const buttons2 = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#droidButtons.create(buttons2);
        x = this.#options.tileWidth;
        y = 100 - this.#options.tileHeight / 2;
        const shots = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#shots.create(shots);
        this.#sizeShots(this.#shots);
        x = this.#options.tileWidth * (this.#options.columns * 2 + 2); // +2 player buttons and middle row
        const droidshots = new Phaser.GameObjects.Container(this.scene, x, y, []);
        this.#droidShots.create(droidshots);

        droidshots.setScale(-1, 1);
        this.#sizeShots(this.#droidShots);

        this.#timer.create(middle);
        container?.add(buttons);
        container?.add(fields);
        container?.add(middle);
        container?.add(droid);
        container?.add(buttons2);
        container?.add(shots);
        container?.add(droidshots);
        // invariant: ParadroidScene always passes a container to create()
        this.container = container!;
    }

    #generateFields(owner: EParadroidOwner) {
        const grid = this.#factory.generateGrid(owner);
        if (owner === EParadroidOwner.Droid) this.#droidGrid = grid; // the AI reasons over this raw grid
        const result = new NPGameObjectList<ParadroidField>(this.scene);
        for (const tileCol of grid) {
            for (const subTile of tileCol) {
                const field = new ParadroidField(this.scene, subTile, {
                    width: this.#options.tileWidth,
                    height: this.#options.tileHeight,
                });
                result.add(field);
            }
        }
        return result;
    }

    #generateButtons(engine: ParadroidEngine) {
        const result = new NPGameObjectList<ParadroidButton>(this.scene);
        const firstRow = engine.grid[0];
        for (const field of firstRow) {
            const paradroidButton = new ParadroidButton(this.scene, field, {
                width: this.#options.tileWidth,
                height: this.#options.tileHeight,
            });
            paradroidButton.on(ParadroidButton.EVENT_CLICK, () => this.#onClick(engine === this.#engine));
            result.add(paradroidButton);
        }
        return result;
    }

    #generateMiddleRow() {
        const result = new NPGameObjectList<ParadroidMiddle>(this.scene);
        const firstRow = this.#engine.grid[0];
        const total = new ParadroidMiddle(this.scene, -1, 0, -this.#options.tileWidth, {
            width: this.#options.tileWidth,
            height: this.#options.tileHeight,
        });
        result.add(total);

        for (const field of firstRow) {
            const middle = new ParadroidMiddle(this.scene, field.row, 0, field.y, {
                width: this.#options.tileWidth,
                height: this.#options.tileHeight,
            });
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
            { player: 0, droid: 0 }
        );
        // invariant: the total middle with row -1 is always added in #generateMiddleRow
        if (all.droid === 0 && all.player === 0) {
            this.#middle(-1)!.owner = 'middle';
        } else if (all.droid === all.player) {
            this.#middle(-1)!.owner = 'middle-both';
        } else if (all.droid > all.player) {
            this.#middle(-1)!.owner = 'middle-droid';
        } else if (all.droid < all.player) {
            this.#middle(-1)!.owner = 'middle-player';
        }
    }

    #generateShots() {
        const result = new NPGameObjectList<ParadroidImage>(this.scene);
        for (let i = 0; i < 12; i++) {
            result.add(new ParadroidImage(this.scene, (i * this.#options.tileWidth) / 2, 0, 'shot'));
        }
        return result;
    }

    /** Scale a list of shot sprites to a quarter of a tile. */
    #sizeShots(shots: NPGameObjectList<ParadroidImage>) {
        shots.list.forEach(s => s.setDisplaySize(this.#options.tileWidth / 4, this.#options.tileHeight / 4));
    }

    #onClick(isPlayer: boolean) {
        const { list } = isPlayer ? this.#shots : this.#droidShots;
        // invariant: buttons are disabled once the list is empty, so no further clicks can arrive
        list.pop()!.destroy();
        if (!list.length) {
            const buttons = isPlayer ? this.#buttons : this.#droidButtons;
            buttons.list.forEach(b => (b.disabled = true));
        }
    }
}
