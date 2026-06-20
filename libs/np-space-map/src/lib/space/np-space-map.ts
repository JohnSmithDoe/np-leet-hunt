import { NPRng } from '@shared/np-library';
import { DashedLine, getClosest, NPGameObjectList, NPMovableSprite, NPScene } from '@shared/np-phaser';
import type { GameState, Sector } from '@shared/np-state';
import * as Phaser from 'phaser';

import { Effect } from '../events/event.model';
import { resolvePlanetEvent } from '../events/event.pool';
import { Planet } from '../planet/planet';
import { generatePlanetInfo } from '../planet/planet-info';
import { NormalityFront } from '../reality/normality-front';
import { Reality } from '../reality/reality';
import { EventChoiceCommittedPayload, EventResolvedPayload, SPACE_EVENTS } from '../space.events';
import { Starmap, StarmapFactory } from './starmap.factory';
import { TravelButtons } from './travel-buttons';

interface Connection {
    from: Planet;
    to: Planet;
    line: DashedLine;
}

// Map generation.
const MAP_SIZE = 15000;
const MIN_PLANET_DISTANCE = 1750;

// Normality-front tuning. The front sweeps in as a diagonal line from the left (the Hush greying the
// map one layer at a time); it takes the sector's `frontSteps` jumps to cross, whatever the map size,
// and stops short of the far edge so a sliver of distorted space (the safe core) never normalises.
const FRONT_MARGIN = 600;
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
// Button-initiated (following) jumps zoom the camera all the way in so the ride reads up close.
const FOLLOW_ZOOM = 1; // == MAX_ZOOM in space-map.scene.ts
const FOLLOW_ZOOM_MS = 600;
// The direction buttons are the zoomed-in nav aid, so they only show once the camera is near full zoom.
const BUTTON_MIN_ZOOM = 0.9;

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
    #travelButtons!: TravelButtons;
    #buttonsShown = false; // whether the direction buttons are currently drawn (gated on zoom + map state)
    #following = false; // camera is tracking the rocket for a button-initiated jump

    #selected?: Planet;
    #traveling = false;
    #frozen = false;
    #inEvent = false; // a planet-arrival event dialog is open; map input is locked until it resolves
    #jumps = 0;
    #built = false; // whether a sector's objects are currently built (guards teardown before first build)

    #dragging = false;
    #dragMoved = 0;
    #lastDrag?: { x: number; y: number };

    // The run-state store (Leet-27), injected from the app (the composition root) and shared with the
    // HUD and other modes. The map mutates it through the GameState interface; np-space-map never sees
    // the Angular facade or a global singleton.
    #state: GameState;
    // The sector being traversed (np-state balance, injected from the app). Drives map size, exit count,
    // front speed, and which event pool arrival events are drawn from.
    #sector: Sector;

    constructor(scene: NPScene, state: GameState, sector: Sector) {
        super(scene);
        this.#state = state;
        this.#sector = sector;
    }

    override preload() {
        // Preload every map texture up front — not just the ones the first sector happens to use — so a
        // sector change can rebuild the map synchronously from cache, with no loader and no async race.
        Planet.preloadAll(this.scene);
        DashedLine.preloadAll(this.scene);
    }

    get startingPlanet() {
        return this.#start;
    }

    override create(container?: Phaser.GameObjects.Container) {
        super.create(container);
        // One-time, instance-level wiring that outlives sector changes (the scene is persistent): map
        // input and the event-dialog round-trip stay bound to this instance, which always points at the
        // current sector's objects. The per-sector map content is built — and rebuilt — by loadSector().
        this.#setupCameraDrag();
        this.#travelButtons = new TravelButtons(this.scene);
        this.#travelButtons.onTap = planet => this.#onTravelButtonTap(planet);
        this.scene.game.events.on(SPACE_EVENTS.EVENT_CHOICE_COMMITTED, this.#onChoiceCommitted);
        this.scene.game.events.on(SPACE_EVENTS.EVENT_RESOLVED, this.#onEventResolved);
        this.loadSector(this.#sector);
    }

    /**
     * Swap the map to `sector`: tear down the current sector's game objects and build the new one's, all
     * inside the same live scene — no scene swap or restart. The persistent space scene keeps running, so
     * input, cameras, and cached textures stay intact. This is the single airtight path for sector change.
     */
    loadSector(sector: Sector) {
        this.#teardownSector();
        this.#sector = sector;
        this.#resetState();
        this.#buildSector();
    }

    /** Destroy every game object + tween this sector built, and clear the route graph. No-op if empty. */
    #teardownSector() {
        if (!this.#built) return;
        const objects: Phaser.GameObjects.GameObject[] = [
            ...this.#planets,
            ...this.#connections.map(connection => connection.line),
            this.#reality,
            this.#here,
        ];
        this.scene.tweens.killTweensOf(objects);
        objects.forEach(object => object.destroy());
        this.#travelButtons?.clear(); // drop buttons referencing the planets we just destroyed
        this.#planets = [];
        this.#connections = [];
        this.#adjacency.clear();
        this.#selected = undefined;
        this.#built = false;
    }

    /** Reset per-sector run flags so the new sector starts clean (front fresh, nothing in flight). */
    #resetState() {
        this.#traveling = false;
        this.#frozen = false;
        this.#inEvent = false;
        this.#jumps = 0;
        this.#dragging = false;
        this.#lastDrag = undefined;
        // Release any camera follow before the scene re-centres on the new sector's start node.
        if (this.#following) {
            this.scene.cameras.main.stopFollow();
            this.#following = false;
        }
    }

    /** Build the current sector's map objects: the star graph, the front + its veil, and the "here" ring. */
    #buildSector() {
        this.#map = StarmapFactory.create({
            planets: this.#sector.planetCount,
            exits: this.#sector.exits,
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
            // Front speed is a sector difficulty knob: fewer jumps to cross = the grey closes faster.
            step: (maxPosition - initialPosition) / this.#sector.frontSteps,
        });
        this.#reality = new Reality(this.scene, this.#front.origin, this.#front.axis, initialPosition);
        this.#reality.create();
        this.#reality.addToScene();

        this.#current = this.#start;

        // Per-sector interactive bits: a tap handler per planet, the pulsing "here" ring, the initial map
        // states, and the opening front readout (deferred a tick so the HUD's listeners are registered).
        this.#planets.forEach(planet => planet.on('pointerup', () => this.#onPlanetTap(planet)));
        this.#here = this.scene.add.circle(0, 0, 1, 0x66ccff, 0).setStrokeStyle(12, 0x66ccff, 0.9).setDepth(25);
        this.scene.tweens.add({
            targets: this.#here,
            alpha: 0.4,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        this.#built = true;
        this.#refreshStates();
        this.scene.time.delayedCall(0, () => this.#emitFront());
    }

    /** Per-frame motion of the map's objects (planet spin, route shimmer); driven by the scene update. */
    override update(...args: number[]) {
        this.#planets.forEach(planet => planet.update(...args));
        this.#connections.forEach(connection => connection.line.update(...args));
        // Wheel-zoom (and the follow zoom-in) don't run through #refreshStates, so watch the zoom here and
        // show/hide the buttons as it crosses the threshold.
        if (this.#shouldShowButtons() !== this.#buttonsShown) this.#updateTravelButtons();
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
            if (!pointer.isDown || this.#frozen || this.#inEvent || this.#following || !this.#lastDrag) return;
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
        if (this.#frozen || this.#traveling || this.#inEvent || this.#dragging || !this.#rocket) return;
        // Any live planet can be selected for inspection; a second tap on a reachable, already-selected
        // one commits the jump (GDD §6 two-tap).
        if (this.#selected === planet && this.#reachable().includes(planet)) {
            this.#commitJump(planet);
            return;
        }
        this.#select(planet);
    }

    /**
     * A direction button on the "here" marker was tapped. It proxies its target planet under the same
     * two-tap rule (first tap arms + shows the readout, second commits), but commits a *camera-following*
     * jump — these buttons are the zoomed-in navigation aid, so the camera rides the rocket to the node.
     */
    #onTravelButtonTap(planet: Planet) {
        if (this.#frozen || this.#traveling || this.#inEvent || this.#dragging || !this.#rocket) return;
        if (this.#selected === planet) {
            this.#commitJump(planet, true);
            return;
        }
        // Don't pan to the target: keep the camera on the rocket (the player is zoomed in on it), just
        // arm the button and surface the readout. The following jump then flies the ship into view.
        this.#select(planet, false);
    }

    /** Adjacent nodes that are still distorted (swallowed neighbours drop out of reach). */
    #reachable(): Planet[] {
        return (this.#adjacency.get(this.#current) ?? []).filter(neighbour => neighbour.alive);
    }

    #select(planet: Planet, pan = true) {
        this.#restoreSelectedVisuals();
        this.#selected = planet;
        planet.setTint(PREVIEW_TINT);
        // Highlight the route only when it's an actual jump target.
        if (this.#reachable().includes(planet)) {
            this.#lineBetween(this.#current, planet)?.setAlpha(LINE_PREVIEW_ALPHA);
        }
        // Ease the camera to the selected planet so an off-screen pick is brought into view. Button picks
        // pass pan=false: they keep the camera on the rocket and let the following jump reveal the target.
        if (pan) this.scene.cameras.main.pan(planet.x, planet.y, SELECT_PAN_MS, 'Sine.easeInOut');
        this.#syncTravelArmed();
        this.scene.game.events.emit(SPACE_EVENTS.PLANET_SELECTED, planet.info);
    }

    #deselect() {
        if (!this.#selected) return;
        this.#restoreSelectedVisuals();
        this.#selected = undefined;
        this.#syncTravelArmed();
        this.scene.game.events.emit(SPACE_EVENTS.PLANET_DESELECTED);
    }

    /** Reflect the current selection on the direction buttons (only a reachable pick arms one). */
    #syncTravelArmed() {
        const armed = this.#selected && this.#reachable().includes(this.#selected) ? this.#selected : undefined;
        this.#travelButtons?.setArmed(armed);
    }

    #restoreSelectedVisuals() {
        if (!this.#selected) return;
        if (this.#selected.alive) this.#selected.clearTint();
        this.#lineBetween(this.#current, this.#selected)?.setAlpha(LINE_ALPHA);
    }

    #commitJump(target: Planet, follow = false) {
        this.#deselect();
        this.#traveling = true;
        this.#jumps += 1;
        this.#here.setVisible(false);
        this.#updateTravelButtons(); // #traveling is set, so this clears them for the trip
        this.#liveLines().forEach(line => line.setAlpha(LINE_TRAVEL_ALPHA));
        this.scene.game.events.emit(SPACE_EVENTS.JUMP_COMMITTED, { to: target.name });

        // Button-initiated jumps ride the camera on the rocket until it arrives (the zoomed-in nav case);
        // planet-tap jumps keep the player's overview framing. Lerp so the camera eases onto the ship.
        if (follow) {
            const cam = this.scene.cameras.main;
            cam.panEffect.reset();
            cam.startFollow(this.#rocket!, false, 0.2, 0.2); // eased lerp: settles onto the ship, tracks it close
            cam.zoomTo(FOLLOW_ZOOM, FOLLOW_ZOOM_MS, 'Sine.easeInOut'); // close in fully for the ride
            this.#following = true;
        }

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

        // Hand the camera back to the player on arrival (no-op for non-following planet-tap jumps).
        if (this.#following) {
            this.scene.cameras.main.stopFollow();
            this.#following = false;
        }

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
            return;
        }

        // Landed safely → the planet's event fires (event-system.md §6). Lock map input until it resolves.
        // The event is drawn from this sector's pool (+ the core pool), seeded by the planet.
        this.#inEvent = true;
        this.#updateTravelButtons(); // #inEvent is set, so this clears them while the event holds the map
        const event = resolvePlanetEvent(this.#sector.id, target.info.name);
        this.scene.game.events.emit(SPACE_EVENTS.PLANET_ARRIVED, { event, planet: target.name });
    }

    // An answer's stake (spec §8): spent the instant the player commits to that branch, before its
    // payoff. The dialog stays open and the run continues, so this only touches the run-state store.
    #onChoiceCommitted = (payload: EventChoiceCommittedPayload) => {
        this.#applyEffects(payload.cost);
    };

    #onEventResolved = (payload: EventResolvedPayload) => {
        this.#inEvent = false; // clear first so the effect/refresh path below can restore the buttons
        this.#applyEffects(payload.effects);
        this.#updateTravelButtons();
    };

    /**
     * Apply an outcome's effects (event-system.md §8). Resources and the normality front are wired for
     * real; flags/items land in the run-state stub; openRoute/spawnGame are logged hand-offs until the
     * hidden-route infra and the mode contract (Leet-29) exist.
     */
    #applyEffects(effects: Effect[]) {
        let frontSteps = 0;
        for (const effect of effects) {
            switch (effect.kind) {
                case 'resource':
                    this.#state.adjustResources({ hull: effect.hull, heart: effect.heart, marbles: effect.marbles });
                    break;
                case 'front':
                    frontSteps += effect.advance;
                    break;
                case 'flag':
                    this.#state.setFlag(effect.set);
                    break;
                case 'item':
                    if (effect.grant) this.#state.grantItem(effect.grant);
                    if (effect.take) this.#state.takeItem(effect.take);
                    break;
                case 'openRoute':
                case 'spawnGame':
                    console.log('[event] effect deferred:', effect); // TODO(event-system.md §8)
                    break;
            }
        }
        if (frontSteps !== 0) this.#applyFrontShift(frontSteps);
    }

    // An event can shove the front forward (a bad outcome) or push it back (a distortion battery, §4).
    #applyFrontShift(steps: number) {
        if (steps > 0) {
            let position = this.#front.position;
            for (let i = 0; i < steps; i++) position = this.#front.advance();
            this.#reality.sweepTo(position, 600);
            this.#front
                .swallowed(this.#planets)
                .filter(planet => planet.alive)
                .forEach(planet => this.#swallow(planet, 600));
        } else {
            this.#reality.sweepTo(this.#front.pushFront(-steps), 600);
        }
        this.#refreshStates();
        this.#emitFront();
        // A forward shove can overrun the ship's node — same snapback as arriving behind the front.
        if (!this.#front.contains(this.#current)) this.#onSnapback();
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
        this.#updateTravelButtons();
    }

    /** Buttons show only when the map is idle (no jump/event/snapback) AND the camera is zoomed near full in. */
    #shouldShowButtons(): boolean {
        if (this.#traveling || this.#frozen || this.#inEvent || !this.#rocket || !this.#current?.alive) return false;
        return this.scene.cameras.main.zoom >= BUTTON_MIN_ZOOM;
    }

    /** Draw the direction buttons clustered around the ship, or clear them when they shouldn't show. */
    #updateTravelButtons() {
        this.#buttonsShown = this.#shouldShowButtons();
        if (!this.#buttonsShown) {
            this.#travelButtons.clear();
            return;
        }
        // Anchor on the ship (parked on the current node), sized to the ship — not the much larger node
        // marker — so the buttons sit tight around the rocket at full zoom.
        const ship = this.#rocket!;
        const shipRadius = Math.max(ship.displayWidth, ship.displayHeight) / 2;
        this.#travelButtons.render({ x: ship.x, y: ship.y }, shipRadius, this.#reachable(), this.#selected);
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
        planet.create(); // textures are preloaded, so setTexture is synchronous (works on rebuild too)
        this.scene.addExisting(planet);
        return planet;
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
        line.create(); // dashed-line texture is preloaded
        line.setDepth(2);
        this.scene.addExisting(line);
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
