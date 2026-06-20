import { clamp, NPScene, OnSceneCreate, OnScenePreload } from '@shared/np-phaser';
import { DungeonResult } from '@shared/np-state';
import * as Phaser from 'phaser';
import BoardPlugin from 'phaser4-rex-plugins/plugins/board-plugin';

import { NPSceneWithBoard } from './@types/pixel-dungeon.types';
import { PixelDungeonEngine } from './engine/pixel-dungeon.engine';

/** What the app injects when starting a dungeon run (Leet-29). */
export interface TPixelDungeonSceneConfig {
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
        this.engine = new PixelDungeonEngine(this);
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
        // Phase-0 bail: press M to leave the dungeon and report a (stub) result to the run (Leet-29). The
        // real objective-driven exit lands with the Phase-3 dungeon rebuild; the map's debug toolbar is
        // the touch escape until then.
        this.input.keyboard!.on('keydown-M', () => this.#config.onResult?.({ kind: 'dungeon', outcome: 'failed' }));
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
