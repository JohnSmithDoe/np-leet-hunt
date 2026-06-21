import { lerp, NPScene, NPTextButton, OnSceneCreate, OnSceneInit, OnScenePreload } from '@shared/np-phaser';
import { Balance, DuelAiLevel, DuelAiParams, DuelResult } from '@shared/np-state';
import * as Phaser from 'phaser';

import { CParadroidTileSets } from './@types/paradroid.consts';
import { paradroidFactoryOptions, TParadroidFactoryOptions } from './core/paradroid.factory';
import { ParadroidGame, TParadroidMatchResult } from './core/paradroid.game';
import { ParadroidIntro } from './sprites/paradroid.intro';

/** How long the camera takes to settle from the splash's neutral 1:1 view onto the board-fit view. */
const FOCUS_MS = 600;

/** What the app injects when starting a duel — the board options and the AI tuning, both optional. */
export interface TParadroidSceneConfig {
    factoryOptions?: TParadroidFactoryOptions;
    aiParams?: DuelAiParams;
    /** The dueled droid's robo-pet class (Leet-39); echoed into the result's `absorbedClass` on a win. */
    droidClass?: number;
    /** Called once when the player leaves the duel — reports the outcome back to the run (Leet-29). */
    onResult?: (result: DuelResult) => void;
}

export class ParadroidScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'paradroid-scene';
    readonly #config: TParadroidSceneConfig;
    #paradroidGame!: ParadroidGame;
    #intro!: ParadroidIntro;
    #busy = false; // true while the VS intro is playing — Start/Re-Create are ignored until it clears
    #lastOutcome: DuelResult['outcome'] = 'lose'; // forfeit by default; a decided match sets win/lose
    #resultText?: Phaser.GameObjects.Text;
    readonly #controls: NPTextButton[] = []; // header controls — folded into the camera fit so they stay on-screen

    constructor(config: TParadroidSceneConfig = {}) {
        super({ key: ParadroidScene.key });
        this.#config = config;
    }

    setupComponents() {
        this.#paradroidGame = this.#createGame();
        this.addComponent(this.#paradroidGame);
        // Registered only so the VS-splash textures preload at scene boot; it's played on demand from Start.
        this.#intro = new ParadroidIntro(this);
        this.addComponent(this.#intro);
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
    override create() {
        const container = new Phaser.GameObjects.Container(this, 0, 0, []);
        super.create(container);
        this.addExisting(container);

        // Header controls, laid out in a row above the board (y=20) and tracked so the camera fit keeps
        // them on-screen at any window size. Each "Start X" rebuilds a fresh board at that difficulty
        // (board fx + tile palette) and plays it with the matching AI level.
        this.#addControl(40, 'Start Normal', () => this.#startDifficulty('normal'));
        this.#addControl(250, 'Start Brutal', () => this.#startDifficulty('brutal'));
        this.#addControl(460, 'Re-Create', () => this.#recreate());
        this.#addControl(640, '↩ Map', () => this.#leave());

        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        this.resize();
    }

    /** Add a header control button at the given x and track it for the camera fit. */
    #addControl(x: number, label: string, onClick: () => void): void {
        const button = new NPTextButton(this, x, 20, label, { fontSize: '28px', color: '#0f0' });
        button.on('pointerup', onClick);
        this.#controls.push(button);
        this.addExisting(button);
    }

    /** Rebuild a fresh board + AI at the given difficulty, play the VS splash, then start the match. */
    #startDifficulty(level: DuelAiLevel): void {
        if (this.#busy) return;
        const factoryOptions = paradroidFactoryOptions(Balance.duelBoardParams(level), CParadroidTileSets[level]);
        this.#rebuild(factoryOptions, Balance.duelAiParams(level));
        this.#playIntro(() => this.#paradroidGame.startMatch());
    }

    /**
     * Play the Street-Fighter VS splash, then run `onDone` (the actual fight).
     *
     * The duel uses a single camera that's normally zoomed to fit the board, so to give the splash a
     * clean full-screen stage we hide the board and hold the camera at a neutral 1:1 view for the whole
     * splash (it lays out in plain screen coordinates). The splash crossfades the board in part-way
     * through (`#revealBoard`) and, once it's fully gone, we settle the camera onto the board
     * (`#focusBoard`) and start the match — see ParadroidIntro for the choreography.
     */
    #playIntro(onDone: () => void): void {
        this.#busy = true;
        // A previous match's buzzer leaves the scene clock frozen; unfreeze it so the splash's timed
        // hand-off fires (startMatch re-asserts this, but the splash runs first).
        this.time.paused = false;
        this.#setBoardVisible(false);
        this.cameras.main.setZoom(1).setScroll(0, 0);
        this.#intro.play({
            revealBoard: durationMs => this.#revealBoard(durationMs),
            onComplete: () => {
                // The board is on-screen at the neutral view; settle the camera onto it and start the
                // fight (clock + AI begin now — after the FIGHT splash has cleared).
                this.#focusBoard(FOCUS_MS, () => (this.#busy = false));
                onDone();
            },
        });
    }

    /** Reveal the board with a fade-in (crossfading against the VS splash) and bring the controls back. */
    #revealBoard(durationMs: number): void {
        const board = this.#paradroidGame.container;
        board.setAlpha(0).setVisible(true);
        this.#controls.forEach(control => control.setVisible(true));
        this.tweens.add({ targets: board, alpha: 1, ease: 'Sine.easeOut', duration: durationMs });
    }

    /** Smoothly tween the camera from the neutral 1:1 view onto the board-fit view (no jarring snap). */
    #focusBoard(duration: number, onDone: () => void): void {
        const { width, height } = this.scale.gameSize;
        const fit = this.#computeBoardFit(width, height);
        const cam = this.cameras.main;
        if (!fit) {
            onDone();
            return;
        }
        const startZoom = cam.zoom;
        const startCx = cam.scrollX + width / 2 / cam.zoom; // world point at the current viewport centre
        const startCy = cam.scrollY + height / 2 / cam.zoom;
        this.tweens.addCounter({
            from: 0,
            to: 1,
            ease: 'Sine.easeInOut',
            duration,
            onUpdate: tween => {
                const t = tween.getValue() ?? 1;
                cam.setZoom(lerp(startZoom, fit.zoom, t)).centerOn(
                    lerp(startCx, fit.centerX, t),
                    lerp(startCy, fit.centerY, t)
                );
            },
            onComplete: () => {
                this.#fitBoardToViewport(width, height); // land exactly on the fit
                onDone();
            },
        });
    }

    /** Hide (or show) the board and its header controls together (used to clear the stage for the splash). */
    #setBoardVisible(visible: boolean): void {
        this.#paradroidGame.container.setVisible(visible);
        this.#controls.forEach(control => control.setVisible(visible));
    }

    /** Re-roll the board at the injected difficulty, idle and ready to start. */
    #recreate(): void {
        if (this.#busy) return;
        this.#rebuild();
    }

    /** Leave the duel and report the latest outcome to the run (Leet-29). Ignored while the intro plays. */
    #leave(): void {
        if (this.#busy) return;
        // A takeover win offers the beaten droid's class for absorption (Leet-39); a loss/forfeit offers nothing.
        const absorbedClass = this.#lastOutcome === 'win' ? this.#config.droidClass : undefined;
        this.#config.onResult?.({ kind: 'duel', outcome: this.#lastOutcome, absorbedClass });
    }

    /** Tear down the current game and build a fresh one (defaults to the injected config). */
    #rebuild(factoryOptions = this.#config.factoryOptions, aiParams = this.#config.aiParams): void {
        this.#resultText?.destroy();
        this.#resultText = undefined;
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
        // A decided match settles the outcome the next "↩ Map" reports (draw counts as not-won → lose).
        this.#lastOutcome = result.winner === 'player' ? 'win' : 'lose';
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

    override update(time: number, delta: number) {
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
        // While the VS splash owns the screen the camera is held at a neutral 1:1 view; don't refit the
        // (hidden) board underneath it — #playIntro refits once the splash clears.
        if (this.#busy) return;
        this.#fitBoardToViewport(width, height);
    }

    /**
     * The board is laid out at a fixed pixel size (48px tiles, anchored near the
     * top-left) and would overflow narrow / mobile viewports. Zoom the main camera
     * so the board's bounds fit the viewport (with a little breathing room) and
     * centre the camera on it. Scaling down for now — proper responsive layout TODO.
     */
    #fitBoardToViewport(width: number, height: number): void {
        const fit = this.#computeBoardFit(width, height);
        if (fit) this.cameras.main.setZoom(fit.zoom).centerOn(fit.centerX, fit.centerY);
    }

    /** The zoom + centre that fits the board (plus its header controls) into the given viewport, if known. */
    #computeBoardFit(width: number, height: number): { zoom: number; centerX: number; centerY: number } | undefined {
        const board = this.#paradroidGame?.container;
        if (!board || width === 0 || height === 0) return undefined;
        // Fit the board *plus* the header controls, so the buttons are never zoomed off-screen.
        let bounds = board.getBounds();
        for (const control of this.#controls) {
            bounds = Phaser.Geom.Rectangle.Union(bounds, control.getBounds());
        }
        if (bounds.width === 0 || bounds.height === 0) return undefined;
        const margin = 1.1; // ~10% padding around the content
        const zoom = Math.min(width / (bounds.width * margin), height / (bounds.height * margin));
        return { zoom, centerX: bounds.centerX, centerY: bounds.centerY };
    }
}
