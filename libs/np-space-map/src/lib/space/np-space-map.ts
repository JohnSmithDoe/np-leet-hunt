import { NPGameObjectList } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { DashedLine } from '../../../../np-phaser/src/lib/sprites/dashed-line/dashed-line';
import { NPMovableSprite } from '../../../../np-phaser/src/lib/sprites/np-movable-sprite';
import { getClosest } from '../../../../np-phaser/src/lib/utilities/np-phaser-utils';
import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { Planet } from '../planet/planet';
import { generatePlanetInfo } from '../planet/planet-info';
import { NormalityFront } from '../reality/normality-front';
import { Reality } from '../reality/reality';
import { SPACE_EVENTS } from '../space.events';
import { Starmap, StarmapFactory } from './starmap.factory';

interface Connection {
    from: Planet;
    to: Planet;
    line: DashedLine;
}

// Map generation.
const MAP_SIZE = 15000;
const MIN_PLANET_DISTANCE = 1750;

// Normality-front tuning. The front sweeps in as a diagonal line from the left (the Hush greying the
// map one layer at a time); it always takes ~DESIRED_JUMPS to cross, whatever the map size, and stops
// short of the far edge so a sliver of distorted space (the safe core) never normalises.
const FRONT_MARGIN = 600;
const DESIRED_JUMPS = 10;
const SAFE_FRACTION = 0.15; // far-side fraction of the sweep that stays distorted
// Sweep axis: points toward still-distorted space (down-and-right), so the grey closes in from the
// upper-left as a tilted line. The front line itself is perpendicular to this.
const FRONT_AXIS = { x: Math.cos(Phaser.Math.DegToRad(25)), y: Math.sin(Phaser.Math.DegToRad(25)) };

// Route alphas: the resting look, the previewed jump, and the dimmed-down look while travelling.
const LINE_ALPHA = 0.7;
const LINE_PREVIEW_ALPHA = 1;
const LINE_TRAVEL_ALPHA = 0.18;
const PREVIEW_TINT = 0x88ccff;

// Camera: drag to pan, wheel to zoom. The only automatic move is a gentle ease to a selected planet.
const SELECT_PAN_MS = 450; // ease-to-selected-planet duration
const DRAG_THRESHOLD = 6; // screen px of movement before a press counts as a drag, not a tap

export class NPSpaceMap extends NPGameObjectList {
    #map!: Starmap;
    #start!: Planet;
    #current!: Planet;
    #planets: Planet[] = []; // inner travel-graph planets + outer bonus suns (distinguished by Planet.outer)
    #connections: Connection[] = [];
    #adjacency = new Map<Planet, Planet[]>();

    #front!: NormalityFront;
    #reality!: Reality;
    #rocket?: NPMovableSprite;
    #here!: Phaser.GameObjects.Arc;

    #selected?: Planet;
    #traveling = false;
    #frozen = false;
    #jumps = 0;

    #dragging = false;
    #dragMoved = 0;
    #lastDrag?: { x: number; y: number };

    init = () => {
        this.#map = StarmapFactory.create({
            planets: 12,
            width: MAP_SIZE,
            height: MAP_SIZE,
            minDistance: MIN_PLANET_DISTANCE,
            outerSpaceDim: 5000,
        });
        this.#initPlanets();
        this.#initConnections();

        const origin = { x: 0, y: 0 };
        const bounds = NormalityFront.enclosingBounds(origin, FRONT_AXIS, this.#planets, FRONT_MARGIN);
        const span = bounds.max - bounds.min;
        const initialPosition = bounds.min;
        const maxPosition = bounds.min + span * (1 - SAFE_FRACTION);
        this.#front = new NormalityFront({
            origin,
            axis: FRONT_AXIS,
            initialPosition,
            maxPosition,
            step: (maxPosition - initialPosition) / DESIRED_JUMPS,
        });
        // The front normalises the axis; reuse it so the renderer's sweep scale matches the geometry.
        this.#reality = this.add(
            new Reality(this.scene, this.#front.origin, this.#front.axis, initialPosition)
        ) as Reality;

        this.#current = this.#start;
        super.init();
    };

    get startingPlanet() {
        return this.#start;
    }

    create(container?: Phaser.GameObjects.Container) {
        super.create(container);
        this.#planets.forEach(planet => planet.on('pointerup', () => this.#onPlanetTap(planet)));
        this.#setupCameraDrag();

        this.#here = this.scene.add.circle(0, 0, 1, 0x66ccff, 0).setStrokeStyle(12, 0x66ccff, 0.9).setDepth(25);
        this.scene.tweens.add({
            targets: this.#here,
            alpha: 0.4,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.#refreshStates();
        // Let every scene register its listeners first, then publish the starting front state to the HUD.
        this.scene.time.delayedCall(0, () => this.#emitFront());
    }

    public setRocket(rocket: NPMovableSprite) {
        this.#rocket = rocket;
    }

    /** Distortion-battery pushback (§4): push the front back out. TODO(Leet-29): wire to event/loot rewards. */
    public pushFront(amount?: number) {
        this.#reality.sweepTo(this.#front.pushFront(amount), 600);
        this.#refreshStates();
        this.#emitFront();
    }

    // Drag-to-pan the map when idle, with a movement threshold so a small wobble still reads as a tap.
    #setupCameraDrag() {
        const cam = this.scene.cameras.main;
        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            this.#dragging = false;
            this.#dragMoved = 0;
            this.#lastDrag = { x: pointer.x, y: pointer.y };
        });
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown || this.#frozen || !this.#lastDrag) return;
            const dx = pointer.x - this.#lastDrag.x;
            const dy = pointer.y - this.#lastDrag.y;
            this.#lastDrag = { x: pointer.x, y: pointer.y };
            this.#dragMoved += Math.hypot(dx, dy);
            if (this.#dragMoved < DRAG_THRESHOLD) return;
            this.#dragging = true;
            cam.panEffect.reset(); // a drag cancels any in-flight ease-to-selected-planet
            cam.scrollX -= dx / cam.zoom;
            cam.scrollY -= dy / cam.zoom;
        });
        this.scene.input.on(Phaser.Input.Events.POINTER_UP, (_pointer: Phaser.Input.Pointer, over: unknown[]) => {
            // A genuine click on empty space clears the selection; a drag (or a click on a planet) does not.
            if (!this.#dragging && !over.length) this.#deselect();
            this.#dragging = false;
            this.#lastDrag = undefined;
        });
    }

    #onPlanetTap(planet: Planet) {
        if (this.#frozen || this.#traveling || this.#dragging || !this.#rocket) return;
        // Any live planet can be selected for inspection; a second tap on a reachable, already-selected
        // one commits the jump (GDD §6 two-tap).
        if (this.#selected === planet && this.#reachable().includes(planet)) {
            this.#commitJump(planet);
            return;
        }
        this.#select(planet);
    }

    /** Adjacent nodes that are still distorted (swallowed neighbours drop out of reach). */
    #reachable(): Planet[] {
        return (this.#adjacency.get(this.#current) ?? []).filter(neighbour => neighbour.alive);
    }

    #select(planet: Planet) {
        this.#restoreSelectedVisuals();
        this.#selected = planet;
        planet.setTint(PREVIEW_TINT);
        // Highlight the route only when it's an actual jump target.
        if (this.#reachable().includes(planet)) {
            this.#lineBetween(this.#current, planet)?.setAlpha(LINE_PREVIEW_ALPHA);
        }
        // Ease the camera to the selected planet so an off-screen pick is brought into view.
        this.scene.cameras.main.pan(planet.x, planet.y, SELECT_PAN_MS, 'Sine.easeInOut');
        this.scene.game.events.emit(SPACE_EVENTS.PLANET_SELECTED, planet.info);
    }

    #deselect() {
        if (!this.#selected) return;
        this.#restoreSelectedVisuals();
        this.#selected = undefined;
        this.scene.game.events.emit(SPACE_EVENTS.PLANET_DESELECTED);
    }

    #restoreSelectedVisuals() {
        if (!this.#selected) return;
        if (this.#selected.alive) this.#selected.clearTint();
        this.#lineBetween(this.#current, this.#selected)?.setAlpha(LINE_ALPHA);
    }

    #commitJump(target: Planet) {
        this.#deselect();
        this.#traveling = true;
        this.#jumps += 1;
        this.#here.setVisible(false);
        this.#liveLines().forEach(line => line.setAlpha(LINE_TRAVEL_ALPHA));
        this.scene.game.events.emit(SPACE_EVENTS.JUMP_COMMITTED, { to: target.name });

        // The front advances only on jumps (GDD §3). Sweep it — and grey out what falls behind — in
        // lockstep with the rocket, so reality visibly closes in *as* the kid flies, not after landing.
        const flightMs = this.#rocket!.travelDurationTo({ x: target.x, y: target.y });
        this.#reality.sweepTo(this.#front.advance(), flightMs);
        this.#front
            .swallowed(this.#planets)
            .filter(planet => planet.alive)
            .forEach(planet => this.#swallow(planet, flightMs));
        this.#emitFront();

        this.#rocket!.onceMoved(() => this.#onArrived(target));
        this.#rocket!.moveToTarget({ x: target.x, y: target.y });
    }

    #onArrived(target: Planet) {
        this.#current = target;
        this.#traveling = false;

        // Reaching a rim sun bails the sector (no reward; run-end stub) — takes precedence over snapback.
        if (target.outer) {
            this.#onSectorExit();
            return;
        }

        this.#liveLines().forEach(line => line.setAlpha(LINE_ALPHA));
        this.#refreshStates();

        // The front advanced at launch; if it overtook the ship's destination, reality snaps back on arrival.
        if (!this.#front.contains(this.#current)) {
            this.#onSnapback();
        }
    }

    #swallow(planet: Planet, duration = 800) {
        planet.setMapState('swallowed');
        this.#connections
            .filter(conn => conn.from === planet || conn.to === planet)
            .forEach(conn => this.scene.tweens.add({ targets: conn.line, alpha: 0, duration }));
        this.scene.game.events.emit(SPACE_EVENTS.PLANET_SWALLOWED, { planet: planet.name });
    }

    #onSnapback() {
        this.#frozen = true;
        this.#deselect();
        this.#here.setVisible(false);
        this.scene.cameras.main.flash(600, 200, 200, 220);
        this.scene.game.events.emit(SPACE_EVENTS.REALITY_SNAPBACK, { jumps: this.#jumps });
        // TODO(Leet-27): hand off to the run state machine for the snap-back ending screen.
    }

    #onSectorExit() {
        this.#frozen = true;
        this.#deselect();
        this.#here.setVisible(false);
        this.scene.cameras.main.flash(600, 120, 220, 180); // calm green-cyan, distinct from the red snapback
        this.scene.game.events.emit(SPACE_EVENTS.SECTOR_EXIT, { jumps: this.#jumps });
        // TODO(Leet-27): hand off to the run state machine — bailing leaves the sector with no rescue.
    }

    #refreshStates() {
        const reachable = new Set(this.#reachable());
        for (const planet of this.#planets) {
            if (!planet.alive) continue; // swallowed nodes stay swallowed
            if (planet === this.#current) planet.setMapState('current');
            else if (reachable.has(planet)) planet.setMapState('reachable');
            else planet.setMapState('dim');
        }
        this.#here.setVisible(this.#current.alive);
        if (this.#current.alive) {
            this.#here.setPosition(this.#current.x, this.#current.y).setRadius(this.#current.displayWidth * 0.62);
        }
        // If the selected planet just fell to the front, drop the selection (its visuals are now the swallow look).
        if (this.#selected && !this.#selected.alive) {
            this.#selected = undefined;
            this.scene.game.events.emit(SPACE_EVENTS.PLANET_DESELECTED);
        }
    }

    #emitFront() {
        this.scene.game.events.emit(SPACE_EVENTS.FRONT_ADVANCED, {
            closedFraction: this.#front.closedFraction,
            position: this.#front.position,
            jumps: this.#jumps,
        });
    }

    #lineBetween(a: Planet, b: Planet): DashedLine | undefined {
        return this.#connections.find(conn => (conn.from === a && conn.to === b) || (conn.from === b && conn.to === a))
            ?.line;
    }

    // Routes whose endpoints are both still distorted — the dead ones have already faded to 0.
    #liveLines(): DashedLine[] {
        return this.#connections.filter(conn => conn.from.alive && conn.to.alive).map(conn => conn.line);
    }

    #initPlanets() {
        let topLeft: Planet | undefined;
        this.#map.coords.planets.forEach((coords, index) => {
            // Seed the readout by index so a planet reports the same stats every time it's reselected.
            const planet = this.#addPlanet(coords, false)
                .setDepth(3)
                .setInfo(generatePlanetInfo(new NPRng(`planet-${index}`)));
            this.#planets.push(planet);
            if (!topLeft || (topLeft.x > coords.x && topLeft.y > coords.y)) {
                topLeft = planet;
            }
        });
        this.#start = topLeft!;
        // Outer suns join the same node list as navigable bonus detours — sized + flagged via #addPlanet.
        this.#map.coords.outerSpace.forEach((coords, index) => {
            this.#planets.push(
                this.#addPlanet(coords, true)
                    .setDepth(3)
                    .setInfo(generatePlanetInfo(new NPRng(`outer-${index}`), true))
            );
        });
    }

    #addPlanet(coords: Phaser.Types.Math.Vector2Like, isOuter: boolean): Planet {
        const planet = new Planet(this.scene, this.#getPlanetType(isOuter))
            .setPosition(coords.x, coords.y)
            .setOuter(isOuter);
        planet.setOrigin(0.5);
        return this.add(planet) as Planet;
    }

    #getPlanetType(isOuter: boolean) {
        if (isOuter) return 'planetSun';
        let type = Planet.getRandom();
        while (type === 'planetSun') {
            type = Planet.getRandom();
        }
        return type;
    }

    // Inner planets form the main graph (each linked to its 3 nearest inner planets); each outer sun
    // spurs off its single nearest inner planet — an out-of-the-way bonus detour.
    #initConnections() {
        const inner = this.#planets.filter(planet => !planet.outer);
        for (const planet of inner) {
            for (const target of getClosest(planet, inner, 3)) {
                this.#connect(planet, target.item);
            }
        }
        for (const sun of this.#planets.filter(planet => planet.outer)) {
            for (const target of getClosest(sun, inner, 1)) {
                this.#connect(sun, target.item);
            }
        }
    }

    #connect(planet: Planet, target: Planet) {
        if (this.#lineBetween(planet, target)) return;
        const line = new DashedLine(this.scene, 'dashedLineRed', planet, target);
        line.setDepth(2);
        this.add(line);
        this.#connections.push({ from: planet, to: target, line });
        this.#link(planet, target);
        this.#link(target, planet);
    }

    #link(from: Planet, to: Planet) {
        const neighbours = this.#adjacency.get(from) ?? [];
        if (!neighbours.includes(to)) neighbours.push(to);
        this.#adjacency.set(from, neighbours);
    }
}
