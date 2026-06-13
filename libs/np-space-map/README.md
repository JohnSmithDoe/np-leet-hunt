# np-space-map

The star map / overworld game mode: a large, procedurally-generated field of planets connected by travel routes, with a rocket avatar the player jumps between them — while the **normality front** (reality reasserting itself) sweeps in as a diagonal line and swallows the map behind them. Built on `@shared/np-phaser` (`NPScene`, `NPMovableSprite`, `DashedLine`, the geometry/RNG toolkit).

Imported via the `@shared/np-space-map` path alias defined in `tsconfig.base.json`.

## How it works

**Three concurrent scenes, not layers.** Instead of one scene with display layers, this mode runs **three** Phaser scenes simultaneously, each with its own camera (layers were deliberately avoided — see the camera-handling note in `TODO.md`). The shell adds and starts all three at once:

- **`SpaceScene`** (`scenes/space.scene.ts`) — the animated nebula background (a tiling `Space` sprite that scrolls its texture each frame).
- **`SpaceMapScene`** (`scenes/space-map.scene.ts`) — the interactive map itself: hosts `NPSpaceMap`, owns the rocket, follows it with a zoomed-out camera, and zooms on mouse-wheel.
- **`SpaceUiScene`** (`scenes/space-ui.scene.ts`) — the fixed HUD: the "reality closing in" bar and jump counter.

**Cross-scene communication** goes through Phaser's global game event emitter. `SPACE_EVENTS` (`space.events.ts`) carries map → HUD signals: `JUMP_COMMITTED`, `FRONT_ADVANCED` (with a `FrontAdvancedPayload` of `closedFraction` / `position` / `jumps`), `PLANET_SWALLOWED`, and `REALITY_SNAPBACK`.

**Map generation.** `StarmapFactory.create(config)` (`space/starmap.factory.ts`) is a pure, scene-free factory. It uses **Poisson-disc sampling** to scatter inner planets evenly across a large world (defaults: 12 planets in a 15 000 × 15 000 space, `minDistance` 1750) and, optionally, a ring of larger "outer space" suns around the playable area. It returns a `Starmap` describing world size, the inner/outer planet coordinates, and the start position.

**Building the playable map.** `NPSpaceMap` (`space/np-space-map.ts`, an `NPGameObjectList`) turns the `Starmap` data into live objects: it instantiates `Planet` sprites, builds the travel graph (each inner planet links to its ~3 nearest neighbours), draws a `DashedLine` per edge, and keeps an adjacency map. The outer-ring suns are real nodes too — flagged `Planet.outer`, rendered larger, each **spurred off its single nearest inner planet**. They are **sector exits (bail points)**: jumping to any one ends the sector immediately with no reward (a `SECTOR_EXIT` run-end stub) — the speed-run option, traded against lingering on the inner planets for loot while the Hush closes. They share the inner planets' node list, so the front, swallow, selection, and info overlay all cover them (the Hush burns near-side exits first); their survey readout rolls from exit-flavoured "outer" pools (`generatePlanetInfo(rng, true)`).

**Travel is a tap-to-jump graph walk.** The map tracks a *current* node. Tapping a reachable (adjacent, still-distorted) planet **previews** the jump (highlights its route, tints the target); tapping it again **commits** — the rocket flies there (`NPMovableSprite.moveToTarget`), the front sweeps forward *in lockstep with the flight* (its tween duration matched to the rocket's travel time so reality closes in as the kid flies, not after landing), and the reachable set is recomputed. Planets carry a `PlanetMapState` (`current` / `reachable` / `dim` / `swallowed`) that drives their tint, pulse, and interactivity.

**Planet survey overlay.** Selecting a planet emits `PLANET_SELECTED` with its `PlanetInfo`; `PlanetInfoComponent` (`ui/planet-info/`) — an Angular/HTML overlay (selector `np-planet-info`), the only Angular piece in this otherwise Phaser/data library — renders that survey readout in a card and clears it on `PLANET_DESELECTED`. Text-heavy surfaces live in HTML, not Phaser (GDD §6); it bridges the Phaser→Angular boundary through the global game event bus and an OnPush signal, mirroring the `StageComponent` pattern in `@shared/np-phaser`.

**The normality front.** `NormalityFront` (`reality/normality-front.ts`) is the pure, Phaser-free geometry of the front: a straight line that sweeps along an `axis` (a diagonal from the left), advancing one `step` per jump until it stops short of a far-side safe core, with `swallowed(points)` reporting what has fallen behind it and `closedFraction` driving the HUD (it is unit-tested in isolation). `Reality` (`reality/reality.ts`) renders it as a **diagonal sweep**: one big colour-drained rectangle, rotated to the front angle and pinned by its leading edge to the line, so advancing the front is just sliding the rectangle along the axis. On each jump `NPSpaceMap` advances the front, greys the newly-swallowed planets, fades their routes, and — if the front catches the ship's node — fires `REALITY_SNAPBACK` (a stub for the future run-end, Leet-27).

## Main components

**Scenes** (`scenes/`)
- `SpaceScene` — background nebula tile sprite.
- `SpaceMapScene` — core map scene; holds `NPSpaceMap` + rocket, follows the rocket, wheel-zooms (clamped).
- `SpaceUiScene` — fixed HUD; listens for `FRONT_ADVANCED` / `REALITY_SNAPBACK` and redraws the reality bar.

**Map model & factory** (`space/`)
- `NPSpaceMap` (`np-space-map.ts`) — owns planets, routes, adjacency, the rocket, and the front; runs tap-to-jump travel and swallowing.
- `StarmapFactory` (`starmap.factory.ts`) — pure Poisson-disc map generator producing a `Starmap`.
- `Space` (`space.ts`) — tiling, animated nebula background sprite (one of 8 textures, chosen at random).

**The front** (`reality/`)
- `NormalityFront` (`normality-front.ts`) — pure line-sweep/swallow geometry; the unit-tested core.
- `Reality` (`reality.ts`) — the diagonal-sweep renderer (rotated veil) that visualises the front.

**Domain objects** (`planet/`)
- `Planet` (`planet/planet.ts`) — a visitable node; a slowly rotating Phaser sprite (~14 texture variants) with a `PlanetMapState` machine for look + interactivity.
- `PlanetInfo` / `generatePlanetInfo` (`planet/planet-info.ts`) — the survey-readout data model and its seeded, Phaser-free generator (rolls from the `planet-info.data.ts` pools; unit-tested).

**UI overlays** (`ui/`)
- `PlanetInfoComponent` (`ui/planet-info/`) — the Angular/HTML survey card described above; the lib's sole Angular component. Consumers place `<np-planet-info>` in their template.

**Events**
- `SPACE_EVENTS` (`space.events.ts`) — `PLANET_SELECTED`, `PLANET_DESELECTED`, `JUMP_COMMITTED`, `FRONT_ADVANCED`, `PLANET_SWALLOWED`, `REALITY_SNAPBACK`, `SECTOR_EXIT`, plus the `FrontAdvancedPayload` type.

## Public API

`src/index.ts` exports the three scene classes — `SpaceScene`, `SpaceMapScene`, `SpaceUiScene` (each with a static `key`) — plus the `PlanetInfoComponent` overlay, the `PlanetInfo` type, and the `SPACE_EVENTS` enum (with `FrontAdvancedPayload`). The `StarmapFactory`, the front geometry (`NormalityFront` / `Reality`), and `Planet` stay library-internal. Consumers add the three scenes to the Phaser game, drop `<np-planet-info>` into their template, and let everything talk through the event bus.

## What can be improved

- **Front tuning is hardcoded.** Margin, desired-jumps, the safe-core fraction, and the sweep axis/angle are constants in `NPSpaceMap`; they should become map/run options once the run state machine drives sectors.
- **Snapback is a stub.** `REALITY_SNAPBACK` only flashes the camera and freezes input — it needs to hand off to the run state machine for a real ending screen (Leet-27), and `pushFront()` (distortion-battery pushback, §4) needs wiring to event/loot rewards (Leet-29).
- **No en-route events yet.** Jumps are unconditional; intercepts/events on a jump (GDD §3) are the next gameplay layer.
- **Background doesn't track the map.** `SpaceScene`'s nebula scrolls independently of the rocket-following map camera — link the cameras (parallax) or fold the background in.
- **Outer-space sampling looks inconsistent.** In `StarmapFactory`, the exclusion rectangle and `map.inner` use different origins — worth verifying outer suns can't clip into the inner field.
- **Lifecycle cleanup.** `game.events.on(...)` listeners registered by the scenes are never removed on shutdown — a leak risk if scenes are ever rebuilt rather than slept.

## Running checks

- `npx nx test np-space-map` — unit tests (Vitest): the `NormalityFront` line-sweep/swallow geometry and the `generatePlanetInfo` survey generator.
- `npx nx lint np-space-map` — ESLint.
- `npx nx stylelint np-space-map` — Stylelint over the overlay's SCSS.
