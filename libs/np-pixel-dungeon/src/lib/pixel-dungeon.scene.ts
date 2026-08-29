import { DungeonAiParams, DungeonCombatParams, DungeonPlan } from '@shared/np-config';
import { clamp, NPScene, OnSceneCreate, OnScenePreload } from '@shared/np-phaser';
import { DungeonObjective, DungeonResult } from '@shared/np-state';
import * as Phaser from 'phaser';
import BoardPlugin from 'phaser4-rex-plugins/plugins/board-plugin';

import { NPSceneWithBoard } from './@types/pixel-dungeon.types';
import { PixelDungeonEngine } from './engine/pixel-dungeon.engine';

/** What the app injects when starting a dungeon run (Leet-29 / F1). */
export interface TPixelDungeonSceneConfig {
    /**
     * The robo-pet's class (Leet-39 seam): the dungeon-companion perks it drives — scouting, assists, and
     * dragging the kid out when downed — are Phase 3 (the dungeon loop); the scene just carries it for now.
     */
    petClass?: number;
    /** The run's goal for this excursion; forwarded to the engine for the objective-driven exit (later tasks). */
    objective?: DungeonObjective;
    /** Generation seed; `undefined` leaves the engine on its fixed-layout default. */
    seed?: string;
    /** The sector/floor depth this run sits at; forwarded for depth-scaled content (later tasks). */
    depth?: number;
    /**
     * The floor's enemy roster (item #10 / F3): archetype ids — keys of np-config's `BESTIARY` — to spawn.
     * The app fills it from `Balance.dungeonRoster(depth)`; forwarded to the engine, which builds each via
     * `MobFactory`. Omitted (debug entry), the engine falls back to its three-skeleton default roster.
     */
    roster?: string[];
    /**
     * The floor's loot plan (RPG cluster A): item ids — keys of np-config's `ITEMS` — to scatter on the
     * floor. The app fills it from `Balance.dungeonLoot(depth)`; forwarded to the engine. Omitted (debug
     * entry), the floor is bare.
     */
    loot?: string[];
    /**
     * The player's starting equipment (item #13): item ids — keys of np-config's `ITEMS` — the kid carries
     * in. The app fills it from `Balance.startingEquipment(petClass)` (or the launch's `equippedItemIds`);
     * forwarded to the engine, which equips each so its `mods` fold into the player's combat stats. Omitted
     * (debug entry), the player starts bare on base stats.
     */
    startingEquipment?: string[];
    /**
     * Combat tuning the run injects (`Balance.dungeonCombatParams()`); forwarded to the engine so the
     * pure `resolveDamage` reads it. Omitted (debug entry), the engine falls back to its `minDamage:1` default.
     */
    combatParams?: DungeonCombatParams;
    /**
     * The floor's mob-AI tuning (item #12): sight/wake radii, give-up turns, wander chance, flee fraction.
     * The app fills it from `Balance.dungeonAiParams(depth)` and forwards it to the engine, which each
     * `MobBrain` reads. Omitted (debug entry), the engine falls back to its sector-1 AI default.
     */
    aiParams?: DungeonAiParams;
    /**
     * The floor's world-content plan (RPG cluster C): trap/lock budgets the decorator draws on (#14); the
     * app fills it from `Balance.dungeonPlan(depth)` and forwards it to the engine. Omitted (debug entry),
     * the engine falls back to its no-trap/no-lock default — the exit stairs are still placed regardless.
     */
    plan?: DungeonPlan;
    /** Called once when the player leaves the dungeon — reports the outcome back to the run. */
    onResult?: (result: DungeonResult) => void;
}

export class PixelDungeonScene extends NPScene implements OnScenePreload, OnSceneCreate, NPSceneWithBoard {
    static readonly key = 'pixel-dungeon-scene';
    rexBoard!: BoardPlugin; // Declare scene property 'rexBoard' as BoardPlugin type

    cam!: Phaser.Cameras.Scene2D.Camera;
    private cameraDrag = false;
    // the camera tracks the player after a move command, until the user drags to pan away
    #followPlayer = true;
    private engine!: PixelDungeonEngine;
    readonly #config: TPixelDungeonSceneConfig;
    constructor(config: TPixelDungeonSceneConfig = {}) {
        super({ key: PixelDungeonScene.key });
        this.#config = config;
    }

    public setupComponents(): void {
        // Inject the launch config into the engine so generation + the result hand-off come from the run,
        // not hard-coded literals (F1). Empty config (debug entry) keeps the engine on its old defaults.
        this.engine = new PixelDungeonEngine(this, {
            objective: this.#config.objective,
            seed: this.#config.seed,
            depth: this.#config.depth,
            roster: this.#config.roster,
            loot: this.#config.loot,
            startingEquipment: this.#config.startingEquipment,
            combatParams: this.#config.combatParams,
            aiParams: this.#config.aiParams,
            plan: this.#config.plan,
            onResult: this.#config.onResult,
        });
    }

    override preload() {
        this.engine.preload();
        this.load.scenePlugin({
            key: 'rexboardplugin',
            sceneKey: 'rexBoard',
            systemKey: 'rexBoard',
            url: BoardPlugin,
        });
        super.preload();
    }

    override create() {
        this.engine.create();
        super.create();
        this.cam = this.cameras.main;
        const camera = this.cam;

        // Camera controls: drag to pan (which hands control to the user and drops follow), wheel to
        // zoom toward the cursor, and click a walkable tile to move (which re-enables follow so the
        // camera tracks the walk).
        let cameraDragStartX = 0;
        let cameraDragStartY = 0;
        this.cameraDrag = false;
        this.input.on('pointerdown', () => {
            cameraDragStartX = camera.scrollX;
            cameraDragStartY = camera.scrollY;
        });

        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (this.cameraDrag) {
                this.cameraDrag = false;
                return;
            }
            if (!this.engine.player.activity.isIdle()) return;
            const targetTile = this.engine.level.getTileAtWorldXY(pointer.worldX, pointer.worldY);
            if (!targetTile) return;
            this.#followPlayer = true; // a move command re-centres the camera on the player
            this.engine.movePlayer(targetTile);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            camera.scrollX = cameraDragStartX + (pointer.downX - pointer.x) / camera.zoom;
            camera.scrollY = cameraDragStartY + (pointer.downY - pointer.y) / camera.zoom;
            // a move on either axis past the threshold counts as a pan (not a click-to-move)
            if (Math.abs(camera.scrollX - cameraDragStartX) > 3 || Math.abs(camera.scrollY - cameraDragStartY) > 3) {
                this.cameraDrag = true;
                this.#followPlayer = false; // dragging hands camera control to the user
            }
        });

        this.input.on(
            'wheel',
            (
                pointer: Phaser.Input.Pointer,
                _gameObjects: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number
            ) => {
                // Zoom toward the cursor: remember the world point under it, apply the zoom, then
                // scroll back so the same world point stays under the cursor. (While following, the
                // per-frame re-centre in update() keeps the zoom centred on the player instead.)
                const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
                const newZoom = camera.zoom - camera.zoom * 0.001 * deltaY;
                camera.zoom = clamp(newZoom, 0.25, 10);
                const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);
                camera.scrollX -= newWorldPoint.x - worldPoint.x;
                camera.scrollY -= newWorldPoint.y - worldPoint.y;
            }
        );

        camera.setZoom(5);
        // Demoted debug *fallback* bail (F1): press M to leave the dungeon. It goes through the FSM —
        // `engine.endGame` records the outcome and routes to EndGameState, which reports `onResult` (the
        // engine, not the scene, owns the hand-off). NOTE: a `failed` dungeon is now LETHAL (combat spine /
        // item #9) — this debug bail therefore ENDS THE WHOLE RUN ('wiped'), a debug death, not a quiet
        // return to the map. The real objective-driven exit lands with later tasks.
        this.input.keyboard!.on('keydown-M', () => this.engine.endGame({ kind: 'dungeon', outcome: 'failed' }));
        this.engine.startUP();
        this.engine.startUpdate();
    }

    override update() {
        if (!this.#followPlayer) return;
        // Smooth-follow the player while a move is in progress, until the user drags to pan away.
        const smoothFactor = 0.9;
        this.cam.scrollX =
            smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (this.engine.player.x - this.cam.width * 0.5);
        this.cam.scrollY =
            smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (this.engine.player.y - this.cam.height * 0.5);
    }
}
