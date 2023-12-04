import * as Phaser from 'phaser';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { NPScene } from '../../../np-phaser/src/lib/scenes/np-scene';
import { OnSceneCreate, OnScenePreload } from '../../../np-phaser/src/lib/types/np-phaser';
import { NPSceneWithBoard } from './@types/pixel-dungeon.types';
import { PixelDungeonEngine } from './engine/pixel-dungeon.engine';

export class PixelDungeonScene extends NPScene implements OnScenePreload, OnSceneCreate, NPSceneWithBoard {
    rexBoard: BoardPlugin; // Declare scene property 'rexBoard' as BoardPlugin type

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    cam: Phaser.Cameras.Scene2D.Camera;
    private cameraDrag: boolean;
    private engine: PixelDungeonEngine;

    public setupComponents(): void {
        this.engine = new PixelDungeonEngine(this);
        this.addComponent(this.engine);
    }

    preload() {
        this.load.scenePlugin('rexboardplugin', 'np-pixel-dungeon/rexboardplugin.min.js', 'rexBoard', 'rexBoard');
        super.preload();
    }

    create() {
        super.create();
        this.cam = this.cameras.main;
        const camera = this.cameras.main;
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
            } else {
                if (!this.engine.player.canAct()) return;
                const { worldX, worldY } = pointer;
                const targetTile = this.engine.map.tileMap.getTileAtWorldXY(worldX, worldY);
                if (!targetTile) return;
                this.engine.movePlayer(targetTile);
            }
        });

        this.input.on('pointermove', pointer => {
            if (pointer.isDown) {
                camera.scrollX = cameraDragStartX + (pointer.downX - pointer.x) / camera.zoom;
                camera.scrollY = cameraDragStartY + (pointer.downY - pointer.y) / camera.zoom;
                if (Math.abs(camera.scrollX - cameraDragStartX) > 3) this.cameraDrag = true;
            }
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            // Get the current world point under pointer.
            const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
            const newZoom = camera.zoom - camera.zoom * 0.001 * deltaY;
            camera.zoom = Phaser.Math.Clamp(newZoom, 0.25, 10);

            // Update camera matrix, so `getWorldPoint` returns zoom-adjusted coordinates.
            const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);
            // Scroll the camera to keep the pointer under the same world point.
            camera.scrollX -= newWorldPoint.x - worldPoint.x;
            camera.scrollY -= newWorldPoint.y - worldPoint.y; //TODO not working
            this.cam.scrollX = this.engine.player.x - this.cam.width * 0.5;
            this.cam.scrollY = this.engine.player.y - this.cam.height * 0.5;
        });

        // moveTo.moveToRandomNeighbor();

        //
        // // Hide all the rooms
        // if (!debug) {
        //     this.tilelayer.forEachTile(tile => {
        //         tile.alpha = 0;
        //     });
        // }
        //
        // // Place the player in the first room
        // const playerRoom = this.dungeon.rooms[0];
        //

        //
        // if (!debug) {
        //     this.setRoomAlpha(playerRoom, 1); // Make the starting room visible
        // }
        //
        // // Scroll to the player

        //
        // this.cam.setViewport(0, 0, this.scale.width, this.scale.height);

        this.cam.setZoom(4);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.engine.startUP();
        this.engine.startUpdate();
    }

    update() {
        if (this.cameraDrag) return;

        //this.updatePlayerMovement();
        // const playerTileX = this.map.worldToTileX(this.player.x);
        // const playerTileY = this.map.worldToTileY(this.player.y);
        // Another helper method from the dungeon - dungeon XY (in tiles) -> room
        // const room = this.dungeon.getRoomAt(playerTileX, playerTileY);
        // If the player has entered a new room, make it visible and dim the last room
        // if (room && this.activeRoom && this.activeRoom !== room) {
        //     if (!debug) {
        //         this.setRoomAlpha(room, 1);
        //         this.setRoomAlpha(this.activeRoom, 0.5);
        //     }
        // }
        //
        // this.activeRoom = room;
        //
        // // Smooth follow the player
        const smoothFactor = 0.9;
        // //
        this.cam.scrollX =
            smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (this.engine.player.x - this.cam.width * 0.5);
        this.cam.scrollY =
            smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (this.engine.player.y - this.cam.height * 0.5);
    }

    // Helpers functions
    // setRoomAlpha(room: NPRect, alpha: number) {
    //     this.map.forEachTile(
    //     tile => {
    //         tile.alpha = alpha;
    //     },
    //     this,
    //     room.x,
    //     room.y,
    //     room.width,
    //     room.height
    // );
    // }

    // isTileOpenAt(worldX: number, worldY: number) {
    // nonNull = true, don't return null for empty tiles. This means null will be returned only for
    // tiles outside the bounds of the map.
    // const tile = this.map.getTileAtWorldXY(worldX, worldY, true);
    //
    // return tile && !tile.collides;
    // }

    updatePlayerMovement() {
        // if (!this.moveTo.isRunning) {
        //     if (this.cursors.down.isDown) {
        //         if (this.moveTo.canMoveTo(this.moveTo.destinationTileX, this.moveTo.destinationTileY + 1)) {
        //             this.moveTo.moveTo(this.moveTo.destinationTileX, this.moveTo.destinationTileY + 1);
        //         }
        //     } else if (this.cursors.up.isDown) {
        //         if (this.moveTo.canMoveTo(this.moveTo.destinationTileX, this.moveTo.destinationTileY - 1)) {
        //             this.moveTo.moveTo(this.moveTo.destinationTileX, this.moveTo.destinationTileY - 1);
        //         }
        //     }
        //     if (this.cursors.left.isDown) {
        //         if (this.moveTo.canMoveTo(this.moveTo.destinationTileX - 1, this.moveTo.destinationTileY)) {
        //             this.moveTo.moveTo(this.moveTo.destinationTileX - 1, this.moveTo.destinationTileY);
        //         }
        //     } else if (this.cursors.right.isDown) {
        //         if (this.moveTo.canMoveTo(this.moveTo.destinationTileX + 1, this.moveTo.destinationTileY)) {
        //             this.moveTo.moveTo(this.moveTo.destinationTileX + 1, this.moveTo.destinationTileY);
        //         }
        //     }
        // }
    }
}
