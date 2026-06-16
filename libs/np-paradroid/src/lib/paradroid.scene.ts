import { NPScene } from '@shared/np-phaser';
import { Balance, DuelAiLevel, DuelAiParams } from '@shared/np-state';
import * as Phaser from 'phaser';

import { TextButton } from '../../../np-phaser/src/lib/sprites/button/text-button';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../np-phaser/src/lib/types/np-phaser';
import { CParadroidTileSets } from './@types/paradroid.consts';
import { paradroidFactoryOptions, TParadroidFactoryOptions } from './core/paradroid.factory';
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
    readonly #controls: TextButton[] = []; // header controls — folded into the camera fit so they stay on-screen

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

    /** Build a game (defaulting to the injected config) and wire its match-ended announcement. */
    #createGame(factoryOptions = this.#config.factoryOptions, aiParams = this.#config.aiParams): ParadroidGame {
        const game = new ParadroidGame(this, factoryOptions, aiParams);
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

        // Header controls, laid out in a row above the board (y=20) and tracked so the camera fit keeps
        // them on-screen at any window size. Each "Start X" rebuilds a fresh board at that difficulty
        // (board fx + tile palette) and plays it with the matching AI level.
        this.#addControl(40, 'Start Normal', () => this.#startDifficulty('normal'));
        this.#addControl(250, 'Start Brutal', () => this.#startDifficulty('brutal'));
        this.#addControl(460, 'Re-Create', () => this.#recreate());

        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        this.resize();
    }

    /** Add a header control button at the given x and track it for the camera fit. */
    #addControl(x: number, label: string, onClick: () => void): void {
        const button = new TextButton(this, x, 20, label, { fontSize: '28px', color: '#0f0' });
        button.on('pointerup', onClick);
        this.#controls.push(button);
        this.addExisting(button);
    }

    /** Rebuild a fresh board + AI at the given difficulty, then start the match. */
    #startDifficulty(level: DuelAiLevel): void {
        const factoryOptions = paradroidFactoryOptions(Balance.duelBoardParams(level), CParadroidTileSets[level]);
        this.#rebuild(factoryOptions, Balance.duelAiParams(level));
        this.#paradroidGame.startMatch();
    }

    /** Re-roll the board at the injected difficulty, idle and ready to start. */
    #recreate(): void {
        this.#rebuild();
    }

    /** Tear down the current game and build a fresh one (defaults to the injected config). */
    #rebuild(factoryOptions = this.#config.factoryOptions, aiParams = this.#config.aiParams): void {
        this.#resultText?.destroy();
        this.removeComponent(this.#paradroidGame);
        this.removeExisting(this.#paradroidGame.container);
        const newContainer = new Phaser.GameObjects.Container(this, 0, 0, []);
        this.#paradroidGame = this.#createGame(factoryOptions, aiParams);
        this.addComponent(this.#paradroidGame);
        this.#paradroidGame.init();
        this.#paradroidGame.create(newContainer);
        this.addExisting(newContainer);
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
        // Fit the board *plus* the header controls, so the buttons are never zoomed off-screen.
        let bounds = board.getBounds();
        for (const control of this.#controls) {
            bounds = Phaser.Geom.Rectangle.Union(bounds, control.getBounds());
        }
        if (bounds.width === 0 || bounds.height === 0) return;
        const margin = 1.1; // ~10% padding around the content
        const zoom = Math.min(width / (bounds.width * margin), height / (bounds.height * margin));
        this.cameras.main.setZoom(zoom).centerOn(bounds.centerX, bounds.centerY);
    }
}
