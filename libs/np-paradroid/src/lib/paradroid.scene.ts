import { NPScene } from '@shared/np-phaser';
import { DuelAiParams } from '@shared/np-state';
import * as Phaser from 'phaser';

import { TextButton } from '../../../np-phaser/src/lib/sprites/button/text-button';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../np-phaser/src/lib/types/np-phaser';
import { TParadroidFactoryOptions } from './core/paradroid.factory';
import { ParadroidGame, TParadroidMatchResult } from './core/paradroid.game';

/** What the app injects when starting a duel — the board options and the AI tuning, both optional. */
export interface TParadroidSceneConfig {
    factoryOptions?: TParadroidFactoryOptions;
    aiParams?: DuelAiParams;
}

export class ParadroidScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'paradroid-scene';
    readonly #config: TParadroidSceneConfig;
    #paradroidGame!: ParadroidGame;
    #resultText?: Phaser.GameObjects.Text;

    constructor(config: TParadroidSceneConfig = {}) {
        super({ key: ParadroidScene.key });
        this.#config = config;
    }

    setupComponents() {
        this.#paradroidGame = this.#createGame();
        this.addComponent(this.#paradroidGame);
        // TODO: ParadroidIntro still depends on the removed layer cameras ('ui-camera') — rework before re-enabling
        // this.addComponent(new ParadroidIntro(this));
    }

    /** Build a game from the injected config and wire its match-ended announcement. */
    #createGame(): ParadroidGame {
        const game = new ParadroidGame(this, this.#config.factoryOptions, this.#config.aiParams);
        game.events.on(ParadroidGame.EVENT_MATCH_ENDED, (result: TParadroidMatchResult) => this.#showResult(result));
        return game;
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    create() {
        const container = new Phaser.GameObjects.Container(this, 0, 0, []);
        super.create(container);
        this.addExisting(container);

        const startBtn = new TextButton(this, 440, 10, 'Start Game');
        startBtn.on('pointerup', () => {
            this.#resultText?.destroy();
            this.#paradroidGame.startMatch();
        });
        this.addExisting(startBtn);

        const recreateBtn = new TextButton(this, 600, 10, 'Re-Create');
        recreateBtn.on('pointerup', () => {
            this.#resultText?.destroy();
            this.removeComponent(this.#paradroidGame);
            this.removeExisting(this.#paradroidGame.container);
            const newcontainer = new Phaser.GameObjects.Container(this, 0, 0, []);
            this.#paradroidGame = this.#createGame();
            this.addComponent(this.#paradroidGame);
            this.#paradroidGame.init();
            this.#paradroidGame.create(newcontainer);
            this.addExisting(newcontainer);
            this.resize();
        });
        this.addExisting(recreateBtn);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        this.resize();
    }

    /** Announce the decided match above the board: "DROID WINS  3 - 5". */
    #showResult(result: TParadroidMatchResult): void {
        const label = result.winner === 'draw' ? 'DRAW' : result.winner === 'droid' ? 'DROID WINS' : 'PLAYER WINS';
        const bounds = this.#paradroidGame.container.getBounds();
        this.#resultText?.destroy();
        this.#resultText = this.add
            .text(bounds.centerX, bounds.top - 40, `${label}  ${result.playerScore} - ${result.droidScore}`, {
                fontSize: '48px',
                color: '#4dd3f6',
                stroke: '#042b2c',
                strokeThickness: 4,
            })
            .setOrigin(0.5);
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.#paradroidGame.update(time, delta);
    }

    /**
     * * When the screen is resized, match the camera viewport to the new size and
     * * re-fit the board so the whole thing stays visible on any device.
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
        this.#fitBoardToViewport(width, height);
    }

    /**
     * The board is laid out at a fixed pixel size (48px tiles, anchored near the
     * top-left) and would overflow narrow / mobile viewports. Zoom the main camera
     * so the board's bounds fit the viewport (with a little breathing room) and
     * centre the camera on it. Scaling down for now — proper responsive layout TODO.
     */
    #fitBoardToViewport(width: number, height: number): void {
        const board = this.#paradroidGame?.container;
        if (!board || width === 0 || height === 0) return;
        const bounds = board.getBounds();
        if (bounds.width === 0 || bounds.height === 0) return;
        const margin = 1.1; // ~10% padding around the board
        const zoom = Math.min(width / (bounds.width * margin), height / (bounds.height * margin));
        this.cameras.main.setZoom(zoom).centerOn(bounds.centerX, bounds.centerY);
    }
}
