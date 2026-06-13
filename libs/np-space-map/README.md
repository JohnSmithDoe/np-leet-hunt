# np-space-map

The star map / overworld game mode: a large, procedurally-generated field of planets connected by travel routes, with a rocket avatar the player flies between them. Built on `@shared/np-phaser` (`NPScene`, `NPMovableSprite`, `DashedLine`, `NPButton`, the geometry/RNG toolkit).

Imported via the `@shared/np-space-map` path alias defined in `tsconfig.base.json`.

## How it works

**Three concurrent scenes, not layers.** Instead of one scene with display layers, this mode runs **three** Phaser scenes simultaneously, each with its own camera (layers were deliberately avoided — see the camera-handling note in `TODO.md`). The shell adds and starts all three at once (`game.scene.add(key, scene, true)`):

- **`SpaceScene`** (`scenes/space.scene.ts`) — the animated nebula background (a tiling `Space` sprite that scrolls its texture each frame).
- **`SpaceMapScene`** (`scenes/space-map.scene.ts`) — the interactive map itself: hosts `NPSpaceMap`, owns the rocket, and its main camera follows the rocket at a zoomed-out level.
- **`SpaceUiScene`** (`scenes/space-ui.scene.ts`) — the UI overlay: zoom buttons and speech-bubble UI on a fixed camera.

**Cross-scene communication** goes through Phaser's global game event emitter. `SPACE_EVENTS` (`space.events.ts`) currently defines `ZOOM_IN` / `ZOOM_OUT`: the UI scene emits them on button press and the map scene listens and changes its camera zoom. This keeps UI input decoupled from map logic.

**Map generation.** `StarmapFactory.create(config)` (`space/starmap.factory.ts`) is a pure, scene-free factory. It uses **Poisson-disc sampling** to scatter inner planets evenly across a large world (defaults: 12 planets in a 15 000 × 15 000 space, `minDistance` 1750) and, optionally, a ring of larger "outer space" suns around the playable area. It returns a `Starmap` describing world size, the inner/outer planet coordinates, and the start position.

**Building the playable map.** `NPSpaceMap` (`space/np-space-map.ts`, an `NPGameObjectList`) turns the `Starmap` data into live objects: it instantiates `Planet` sprites, wires up the navigation graph (each inner planet links to its ~3 nearest neighbours; outer planets link to their ~2 nearest inner planets), and for each edge draws a `DashedLine` plus travel `NPButton`s. `travelTo()` animates the rocket along an edge, fading connections during flight and restoring the UI on arrival.

## Main components

**Scenes** (`scenes/`)
- `SpaceScene` — background tile sprite; also constructs a (currently unused) mouse-wheel scroller.
- `SpaceMapScene` — core map scene; holds `NPSpaceMap` + rocket, reacts to zoom events.
- `SpaceUiScene` — zoom buttons and ambient UI; emits `SPACE_EVENTS`.

**Map model & factory** (`space/`)
- `NPSpaceMap` (`np-space-map.ts`) — owns planets, connections, and the rocket; builds the graph and runs travel.
- `StarmapFactory` (`starmap.factory.ts`) — pure Poisson-disc map generator producing a `Starmap`.
- `Space` (`space.ts`) — tiling, animated nebula background sprite (one of 8 textures, chosen at random).

**Domain objects**
- `Planet` (`planet/planet.ts`) — a visitable location; a slowly rotating Phaser sprite with ~14 texture variants, implements the `NPGameObject` lifecycle.
- `Reality` (`reality/reality.ts`) — an experimental lens/vignette tile sprite, **not currently wired into the map** (mostly commented out).

**Events**
- `SPACE_EVENTS` (`space.events.ts`) — the cross-scene event enum (`ZOOM_IN`, `ZOOM_OUT`).

## Public API

`src/index.ts` exports only the three scene classes — `SpaceScene`, `SpaceMapScene`, `SpaceUiScene` (each with a static `key`). The factory, domain objects, and event enum are library-internal. Consumers add the three scenes to the Phaser game and let them talk to each other via events.

## What can be improved

- **Cross-scene API is too thin.** Only `ZOOM_IN`/`ZOOM_OUT` exist. There are no events for planet selection, travel start/complete, or map-ready, so richer interactions have nowhere to hook in. Expanding `SPACE_EVENTS` is the natural next step.
- **Background doesn't track the map.** `SpaceScene`'s nebula scrolls its own texture independently of the rocket-following map camera, so there's no real parallax tie between background and map. Either link the cameras (with a parallax offset) or fold the background into the map scene.
- **Hardcoded configuration.** The starmap config (planet count, world size, distances) is inlined in `NPSpaceMap`, and zoom levels are hardcoded in the UI scene. These should be constructor/scene options.
- **Outer-space sampling looks inconsistent.** In `StarmapFactory`, the rectangle used to exclude the inner region from outer-planet sampling and the `map.inner` rectangle are computed with different origins — worth verifying outer planets can't clip into the inner field.
- **Dead code & debug noise.** Several `console.log` calls across the scenes/objects, an instantiated-but-unused `MouseWheelScroller`, large commented-out camera/resize blocks, and the unused `Reality` class should be cleaned up or finished.
- **No camera pan/drag.** Navigation is button-zoom only; mouse-wheel/drag panning is stubbed but not implemented.
- **Lifecycle cleanup.** `game.events.on(...)` listeners registered by the scenes are never removed on shutdown — a leak risk if scenes are recreated.
- **No tests.** The library has zero specs; `StarmapFactory` (graph connectivity, Poisson spacing) is pure and the obvious first target.

## Running unit tests

Run `npx nx test np-space-map` to execute the unit tests (Vitest).
