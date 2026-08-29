import type { Sector } from '@shared/np-config';
import { clamp, NPMovableSprite, NPScene, OnSceneCreate, OnSceneInit, OnScenePreload } from '@shared/np-phaser';
import type { GameState } from '@shared/np-state';
import * as Phaser from 'phaser';

import { NPSpaceMap } from '../space/np-space-map';

// Zoomed well out by default so the closing front is legible; the wheel zooms in for node detail.
const INITIAL_ZOOM = 0.09;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 1;
const ZOOM_STEP = 0.02; // per wheel notch — fine-grained so zoom creeps, not jumps

// Opening fly-in (Leet-39): every time the map becomes visible, start on the whole-map overview and dive
// all the way in onto the rocket as the camera fades up from black, so the eye lands close on the ship.
// The tween outlasts the 1000ms fade a touch so the dive is still visibly moving once the screen is lit.
const ENTRY_FROM_ZOOM = INITIAL_ZOOM; // the wide overview the map otherwise rests at
const ENTRY_TO_ZOOM = MAX_ZOOM; // dive fully in on the ship (== the button-jump follow zoom)
const ENTRY_ZOOM_MS = 1500;

export class SpaceMapScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-map-scene';
    #rocket!: NPMovableSprite;
    #map!: NPSpaceMap;
    #state: GameState;
    #sector: Sector;
    #flyInTween?: Phaser.Tweens.Tween;

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
        if (this.scene.isSleeping()) {
            // Rebuilt off-stage (advancing after a guardian win): just frame the start; the scene's WAKE
            // fires the fly-in once it's woken and fading back in.
            this.cameras.main.centerOn(start.x, start.y).setZoom(INITIAL_ZOOM);
        } else {
            // Rebuilt on-stage behind a fade (a rim-sun bail): fly the camera in as the map fades back.
            this.#flyInToRocket();
        }
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

        // Open zoomed in on the ship; NPSpaceMap drives follow (only while travelling), ease-to-select, drag.
        this.#flyInToRocket();
        // Every later return from an excursion (a duel/dungeon) wakes — not re-creates — this persistent
        // scene, so animate the same entrance on WAKE. NPSpaceMap's own WAKE handler runs first (it snaps a
        // resumed jump to its destination), so the fly-in lands on the rocket's final position.
        this.events.on(Phaser.Scenes.Events.WAKE, this.#flyInToRocket, this);
        this.input.on('wheel', (_pointer: unknown, _over: unknown, _dx: number, dy: number) => {
            const cam = this.cameras.main;
            cam.setZoom(clamp(cam.zoom * (dy > 0 ? 1 - ZOOM_STEP : 1 + ZOOM_STEP), MIN_ZOOM, MAX_ZOOM));
        });
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    /**
     * Cinematic entrance: snap the camera to the wide {@link ENTRY_FROM_ZOOM} overview centred on the
     * rocket, then dive in to {@link ENTRY_TO_ZOOM} (full zoom), re-centring on the ship each frame so it
     * stays put while the view closes in. Runs alongside the camera fade so the eye lands on the ship.
     */
    #flyInToRocket(): void {
        const cam = this.cameras.main;
        const { x, y } = this.#rocket;
        // Cancel any in-flight camera move (a leftover follow zoom / select-pan) and the previous fly-in.
        cam.panEffect.reset();
        cam.zoomEffect.reset();
        cam.stopFollow();
        this.#flyInTween?.stop();
        cam.setZoom(ENTRY_FROM_ZOOM).centerOn(x, y);
        // Tween the camera's own `zoom` and re-centre on the ship each frame so it holds the middle as the
        // view closes in (the camera is a valid tween target — same pattern as reality.ts tweening x/y).
        this.#flyInTween = this.tweens.add({
            targets: cam,
            zoom: ENTRY_TO_ZOOM,
            duration: ENTRY_ZOOM_MS,
            ease: 'Sine.easeInOut',
            onUpdate: () => cam.centerOn(x, y),
        });
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
