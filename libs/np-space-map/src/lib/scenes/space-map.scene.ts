import { NPScene } from '@shared/np-phaser';
import type { GameState, Sector } from '@shared/np-state';
import * as Phaser from 'phaser';

import { NPMovableSprite } from '../../../../np-phaser/src/lib/sprites/np-movable-sprite';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { NPSpaceMap } from '../space/np-space-map';

// Zoomed well out by default so the closing front is legible; the wheel zooms in for node detail.
const INITIAL_ZOOM = 0.09;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 1;
const ZOOM_STEP = 0.02; // per wheel notch — fine-grained so zoom creeps, not jumps

export class SpaceMapScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-map-scene';
    #rocket!: NPMovableSprite;
    #map!: NPSpaceMap;
    #state: GameState;
    #sector: Sector;

    constructor(state: GameState, sector: Sector) {
        super({ key: SpaceMapScene.key });
        this.#state = state;
        this.#sector = sector;
    }

    setupComponents() {
        this.#map = this.addComponent(new NPSpaceMap(this, this.#state, this.#sector));
    }

    /**
     * Regenerate the map for a new sector in place (no scene restart): rebuild the map's game objects,
     * then re-place the rocket and re-centre the camera on the new start. The scene stays running.
     */
    loadSector(sector: Sector): void {
        this.#sector = sector;
        this.#map.loadSector(sector);
        const start = this.#map.startingPlanet;
        this.#rocket.setPosition(start.x, start.y);
        this.cameras.main.centerOn(start.x, start.y).setZoom(INITIAL_ZOOM);
    }

    override preload() {
        super.preload();
        this.load.image('rocket', 'assets/rocket.png');
    }

    override create() {
        super.create();
        const start = this.#map.startingPlanet;
        this.#rocket = new NPMovableSprite(this, start.x, start.y, 'rocket').setScale(0.5);
        this.#rocket.create();
        this.#rocket.setDepth(30);
        this.addExisting(this.#rocket);
        this.#map.setRocket(this.#rocket);

        // Centre on the start once; NPSpaceMap drives follow (only while travelling), ease-to-select, and drag.
        this.cameras.main.centerOn(start.x, start.y).setZoom(INITIAL_ZOOM);
        this.input.on('wheel', (_pointer: unknown, _over: unknown, _dx: number, dy: number) => {
            const cam = this.cameras.main;
            cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 1 - ZOOM_STEP : 1 + ZOOM_STEP), MIN_ZOOM, MAX_ZOOM));
        });
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    override update(time: number, delta: number) {
        this.#map.update(time, delta); // drives planet spin + route shimmer
        super.update(time, delta);
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
    }
}
