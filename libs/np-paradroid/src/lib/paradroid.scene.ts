import { DuelAiParams } from '@shared/np-config';
import { fadeIn, NPScene, NPTextButton, OnSceneCreate, OnSceneInit, OnScenePreload } from '@shared/np-phaser';
import { DuelResult } from '@shared/np-state';
import * as Phaser from 'phaser';

import { TParadroidFactoryOptions } from './core/paradroid.factory';
import { ParadroidGame, TParadroidMatchResult } from './core/paradroid.game';
import { ParadroidCountdown } from './sprites/paradroid.countdown';
import { ParadroidIntro } from './sprites/paradroid.intro';
import { ParadroidOutro } from './sprites/paradroid.outro';
import { ParadroidScoreboard } from './sprites/paradroid.scoreboard';

/**
 * The grid-selection window, in seconds (Leet-40). A fixed budget to re-roll the board before it locks —
 * choosing the layout is the gameplay. Lives here with the other duel-timing constant (`MATCH_DURATION_MS`),
 * not in np-state `Balance`, which holds difficulty *tuning* (rates, AI), not staging.
 */
const SELECTION_SECONDS = 20;

/**
 * The duel's staging state machine (Leet-40):
 *   select → (lock-in / time-out) → intro → fight → (buzzer) → outro → done.
 * The board is fixed to the size the player picked during selection — the intro keeps the camera on that
 * selection fit and lays the VS splash out over the camera's world view (it never zooms the board). Only the
 * outro hides the board and switches to a neutral 1:1 view (see {@link ParadroidIntro} / {@link ParadroidOutro}).
 */
type DuelPhase = 'select' | 'intro' | 'fight' | 'outro' | 'done';

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
    #outro!: ParadroidOutro;
    #countdown!: ParadroidCountdown;
    #scoreboard!: ParadroidScoreboard;
    #phase: DuelPhase = 'select';
    #lastOutcome: DuelResult['outcome'] = 'lose'; // forfeit by default; a decided match sets win/lose

    // Header controls. Re-Roll / Lock-In drive grid selection; Map reports the result and leaves. Tracked
    // for the camera fit so they stay on-screen at any window size.
    #rerollBtn!: NPTextButton;
    #lockBtn!: NPTextButton;
    #mapBtn!: NPTextButton;
    readonly #controls: NPTextButton[] = [];

    constructor(config: TParadroidSceneConfig = {}) {
        super({ key: ParadroidScene.key });
        this.#config = config;
    }

    setupComponents() {
        this.#paradroidGame = this.#createGame();
        this.addComponent(this.#paradroidGame);
        // Registered only so the VS-splash / portrait textures preload at scene boot; both play on demand.
        this.#intro = new ParadroidIntro(this);
        this.addComponent(this.#intro);
        this.#outro = new ParadroidOutro(this);
        this.addComponent(this.#outro);
    }

    /** Build a game (defaulting to the injected config) and wire its match-ended + live-score events. */
    #createGame(): ParadroidGame {
        const game = new ParadroidGame(this, this.#config.factoryOptions, this.#config.aiParams);
        game.events.on(ParadroidGame.EVENT_MATCH_ENDED, (result: TParadroidMatchResult) => this.#onMatchEnded(result));
        game.events.on(ParadroidGame.EVENT_SCORE_CHANGED, (s: { player: number; droid: number }) =>
            this.#scoreboard?.setScore(s.player, s.droid)
        );
        return game;
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    override create() {
        const container = new Phaser.GameObjects.Container(this, 0, 0, []);
        super.create(container);
        this.addExisting(container);

        // Header controls, laid out in a row above the board (y=20). The board-fit unions the *visible* ones.
        this.#rerollBtn = this.#addControl(40, '↻ Re-Roll', () => this.#reroll());
        this.#lockBtn = this.#addControl(280, '⚔ Lock In', () => this.#lockIn());
        this.#mapBtn = this.#addControl(520, '↩ Map', () => this.#leave());

        this.#countdown = new ParadroidCountdown(this);
        this.#scoreboard = new ParadroidScoreboard(this);

        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        this.resize();
        this.#beginSelection();
    }

    /** Add a header control button at the given x and track it for the camera fit. */
    #addControl(x: number, label: string, onClick: () => void): NPTextButton {
        const button = new NPTextButton(this, x, 20, label, { fontSize: '28px', color: '#0f0' });
        button.on('pointerup', onClick);
        this.#controls.push(button);
        this.addExisting(button);
        return button;
    }

    /**
     * Open the grid-selection window: show the freshly-generated board, let the player re-roll it freely,
     * and start the countdown that locks it in (Leet-40). On expiry the grid locks and the intro plays.
     */
    #beginSelection(): void {
        this.#phase = 'select';
        this.time.paused = false; // ensure the scene clock ticks the countdown (a prior match may have frozen it)
        this.#paradroidGame.container.setVisible(true);
        this.#setControls(true, true, true);
        this.resize(); // fit the board (+ controls) into the viewport
        const bounds = this.#paradroidGame.container.getBounds();
        this.#scoreboard.place(bounds);
        this.#scoreboard.show(true, false); // orient the player to their half; the score is the fight's job
        this.#countdown.play(SELECTION_SECONDS, bounds, () => this.#lockIn());
    }

    /** Re-roll a fresh board at the injected difficulty. The countdown keeps running — the window is fixed. */
    #reroll(): void {
        if (this.#phase !== 'select') return;
        this.#rebuild();
        // The new board was added on top of the display list — re-lay the overlays back above it.
        this.#scoreboard.place(this.#paradroidGame.container.getBounds());
        this.#scoreboard.show(true, false);
        this.#countdown.bringToTop();
    }

    /** Lock the chosen grid in (button or countdown expiry): play the VS splash, then start the match. */
    #lockIn(): void {
        if (this.#phase !== 'select') return;
        this.#countdown.stop();
        this.#playIntro(() => this.#paradroidGame.startMatch());
    }

    /**
     * Play the Street-Fighter VS splash, then run `onDone` (the actual fight).
     *
     * The board keeps the exact size the player picked during selection: the camera is **never** zoomed or
     * scrolled here — it stays on the selection fit. The splash lays out over the camera's current world view
     * (`#viewRect`), so it still fills the screen at that fit while the board stays put. We only hide the board
     * during the VS portion and crossfade it back in (`#revealBoard`) at its fixed size — see ParadroidIntro.
     */
    #playIntro(onDone: () => void): void {
        this.#phase = 'intro';
        this.time.paused = false;
        this.#setBoardVisible(false);
        this.#intro.play(this.#viewRect(), {
            revealBoard: durationMs => this.#revealBoard(durationMs),
            onComplete: () => {
                // The board is already on-screen at its picked size; just hand off to the fight (clock + AI
                // begin now — after the FIGHT splash has cleared). No camera move, so the board never resizes.
                this.#phase = 'fight';
                onDone();
            },
        });
    }

    /** Reveal the board with a fade-in (crossfading against the VS splash) and bring the fight HUD back. */
    #revealBoard(durationMs: number): void {
        const board = this.#paradroidGame.container;
        board.setVisible(true);
        this.#setControls(false, false, true); // only Map during the fight (no re-roll / lock-in mid-match)
        this.#scoreboard.setScore(0, 0); // the match starts level; it swings from here
        this.#scoreboard.show(true, true); // labels + the live tally for the fight
        this.#scoreboard.bringToTop();
        fadeIn(board, { duration: durationMs }); // crossfades the board up against the VS splash fading out
    }

    /** The world rectangle the main camera currently maps to the full screen — what the splash lays out over. */
    #viewRect(): Phaser.Geom.Rectangle {
        const cam = this.cameras.main;
        const { width, height } = this.scale.gameSize;
        const topLeft = cam.getWorldPoint(0, 0);
        const bottomRight = cam.getWorldPoint(width, height);
        return new Phaser.Geom.Rectangle(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    }

    /** Hide (or show) the board and all its header controls together (clears the stage for splash/outro). */
    #setBoardVisible(visible: boolean): void {
        this.#paradroidGame.container.setVisible(visible);
        this.#setControls(visible, visible, visible);
        this.#scoreboard?.show(visible, false); // the fight re-shows the score itself via #revealBoard
    }

    /** Toggle the three header controls independently. */
    #setControls(reroll: boolean, lock: boolean, map: boolean): void {
        this.#rerollBtn.setVisible(reroll);
        this.#lockBtn.setVisible(lock);
        this.#mapBtn.setVisible(map);
    }

    /** Leave the duel and report the latest outcome to the run (Leet-29). Ignored mid-animation. */
    #leave(): void {
        if (this.#phase === 'intro' || this.#phase === 'outro') return;
        // A takeover win offers the beaten droid's class for absorption (Leet-39); a loss/forfeit offers nothing.
        const absorbedClass = this.#lastOutcome === 'win' ? this.#config.droidClass : undefined;
        this.#config.onResult?.({ kind: 'duel', outcome: this.#lastOutcome, absorbedClass });
    }

    /** Tear down the current game and build a fresh one at the injected config (the re-roll). */
    #rebuild(): void {
        this.removeComponent(this.#paradroidGame);
        this.removeExisting(this.#paradroidGame.container);
        const newContainer = new Phaser.GameObjects.Container(this, 0, 0, []);
        this.#paradroidGame = this.#createGame();
        this.addComponent(this.#paradroidGame);
        this.#paradroidGame.init();
        this.#paradroidGame.create(newContainer);
        this.addExisting(newContainer);
        this.resize();
    }

    /**
     * The match was decided (Leet-40): record the outcome the next "↩ Map" reports, then play the ending
     * animation (loser drops, winner is promoted) before revealing the return control.
     */
    #onMatchEnded(result: TParadroidMatchResult): void {
        // A decided match settles the outcome (a draw counts as not-won → lose).
        this.#lastOutcome = result.winner === 'player' ? 'win' : 'lose';
        this.#playOutro(result);
    }

    /** Clear the board, hold the camera neutral, and play the ending animation; reveal "Map" when it's done. */
    #playOutro(result: TParadroidMatchResult): void {
        this.#phase = 'outro';
        this.time.paused = false; // the buzzer froze the clock; unfreeze so the outro's timed beats fire
        this.#setBoardVisible(false);
        this.cameras.main.setZoom(1).setScroll(0, 0);
        this.#outro.play(result, { onComplete: () => this.#finishOutro() });
    }

    /** Outro finished: drop the player on a clear, centred "return to map" control over the victory tableau. */
    #finishOutro(): void {
        this.#phase = 'done';
        const { width, height } = this.scale.gameSize;
        this.#setControls(false, false, true);
        this.#mapBtn
            .setOrigin(0.5)
            .setPosition(width / 2, height - 90)
            .setText('↩ Return to map');
        this.children.bringToTop(this.#mapBtn); // sit above the outro backdrop/portraits
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
        // The board is fit-to-viewport only while it owns the screen (select / fight). During the intro and
        // outro the camera is held at a neutral 1:1 view (the splashes lay out in screen coords) — don't refit.
        if (this.#phase === 'select' || this.#phase === 'fight') this.#fitBoardToViewport(width, height);
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

    /** The zoom + centre that fits the board (plus its visible controls) into the given viewport, if known. */
    #computeBoardFit(width: number, height: number): { zoom: number; centerX: number; centerY: number } | undefined {
        const board = this.#paradroidGame?.container;
        if (!board || width === 0 || height === 0) return undefined;
        // Fit the board *plus* the visible header controls, so the buttons are never zoomed off-screen.
        let bounds = board.getBounds();
        for (const control of this.#controls) {
            if (control.visible) bounds = Phaser.Geom.Rectangle.Union(bounds, control.getBounds());
        }
        if (bounds.width === 0 || bounds.height === 0) return undefined;
        const margin = 1.1; // ~10% padding around the content
        const zoom = Math.min(width / (bounds.width * margin), height / (bounds.height * margin));
        return { zoom, centerX: bounds.centerX, centerY: bounds.centerY };
    }
}
