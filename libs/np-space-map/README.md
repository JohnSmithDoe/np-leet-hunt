# np-space-map

The star map / overworld game mode: a large, procedurally-generated field of planets connected by travel routes, with a rocket avatar the player jumps between them — while the **normality front** (reality reasserting itself) collapses inward and swallows the map behind them. Built on `@shared/np-phaser` (`NPScene`, `NPMovableSprite`, `DashedLine`, the geometry/RNG toolkit).

Imported via the `@shared/np-space-map` path alias defined in `tsconfig.base.json`.

## How it works

**Three concurrent scenes, not layers.** Instead of one scene with display layers, this mode runs **three** Phaser scenes simultaneously, each with its own camera (layers were deliberately avoided — see the camera-handling note in `TODO.md`). The shell adds and starts all three at once:

- **`SpaceScene`** (`scenes/space.scene.ts`) — the animated nebula background (a tiling `Space` sprite that scrolls its texture each frame).
- **`SpaceMapScene`** (`scenes/space-map.scene.ts`) — the interactive map itself: hosts `NPSpaceMap`, owns the rocket, follows it with a zoomed-out camera, and zooms on mouse-wheel.
- **`SpaceUiScene`** (`scenes/space-ui.scene.ts`) — the fixed HUD: the "reality closing in" bar and jump counter.

**Cross-scene communication** goes through Phaser's global game event emitter. `SPACE_EVENTS` (`space.events.ts`) carries map → HUD signals: `JUMP_COMMITTED`, `FRONT_ADVANCED` (with a `FrontAdvancedPayload` of `closedFraction` / `radius` / `jumps`), `PLANET_SWALLOWED`, and `REALITY_SNAPBACK`.

**Map generation.** `StarmapFactory.create(config)` (`space/starmap.factory.ts`) is a pure, scene-free factory. It uses **Poisson-disc sampling** to scatter inner planets evenly across a large world (defaults: 12 planets in a 15 000 × 15 000 space, `minDistance` 1750) and, optionally, a ring of larger "outer space" suns around the playable area. It returns a `Starmap` describing world size, the inner/outer planet coordinates, and the start position.

**Building the playable map.** `NPSpaceMap` (`space/np-space-map.ts`, an `NPGameObjectList`) turns the `Starmap` data into live objects: it instantiates `Planet` sprites, builds the travel graph (each inner planet links to its ~3 nearest neighbours; outer suns are decorative backdrop, not nodes), draws a `DashedLine` per edge, and keeps an adjacency map.

**Travel is a tap-to-jump graph walk.** The map tracks a *current* node. Tapping a reachable (adjacent, still-distorted) planet **previews** the jump (highlights its route, tints the target); tapping it again **commits** — the rocket flies there (`NPMovableSprite.moveToTarget`), the front advances, and the reachable set is recomputed. Planets carry a `PlanetMapState` (`current` / `reachable` / `dim` / `swallowed`) that drives their tint, pulse, and interactivity.

**The normality front.** `NormalityFront` (`reality/normality-front.ts`) is the pure, Phaser-free geometry of the front: a circle of still-distorted space centred on the map that collapses one `step` per jump down to a safe core, with `swallowed(points)` reporting what has fallen outside and `closedFraction` driving the HUD (it is unit-tested in isolation). `Reality` (`reality/reality.ts`) renders it as a **radial collapse**: a colour-drained veil covering everything outside the bubble, punched out with an inverted geometry mask so collapsing the front is just shrinking the masked circle. On each jump `NPSpaceMap` advances the front, greys + shrinks the newly-swallowed planets, fades their routes, and — if the front catches the ship's node — fires `REALITY_SNAPBACK` (a stub for the future run-end, Leet-27).

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
- `NormalityFront` (`normality-front.ts`) — pure collapse/swallow geometry; the unit-tested core.
- `Reality` (`reality.ts`) — the radial-collapse renderer (masked veil) that visualises the front.

**Domain objects**
- `Planet` (`planet/planet.ts`) — a visitable node; a slowly rotating Phaser sprite (~14 texture variants) with a `PlanetMapState` machine for look + interactivity.

**Events**
- `SPACE_EVENTS` (`space.events.ts`) — `JUMP_COMMITTED`, `FRONT_ADVANCED`, `PLANET_SWALLOWED`, `REALITY_SNAPBACK`, plus the `FrontAdvancedPayload` type.

## Public API

`src/index.ts` exports only the three scene classes — `SpaceScene`, `SpaceMapScene`, `SpaceUiScene` (each with a static `key`). The factory, front, domain objects, and event enum are library-internal. Consumers add the three scenes to the Phaser game and let them talk via events.

## What can be improved

- **Front tuning is hardcoded.** Margin, desired-jumps, and the min-radius factor are constants in `NPSpaceMap`; they should become map/run options once the run state machine drives sectors.
- **Snapback is a stub.** `REALITY_SNAPBACK` only flashes the camera and freezes input — it needs to hand off to the run state machine for a real ending screen (Leet-27), and `pushFront()` (distortion-battery pushback, §4) needs wiring to event/loot rewards (Leet-29).
- **No en-route events yet.** Jumps are unconditional; intercepts/events on a jump (GDD §3) are the next gameplay layer.
- **Background doesn't track the map.** `SpaceScene`'s nebula scrolls independently of the rocket-following map camera — link the cameras (parallax) or fold the background in.
- **Outer-space sampling looks inconsistent.** In `StarmapFactory`, the exclusion rectangle and `map.inner` use different origins — worth verifying outer suns can't clip into the inner field.
- **Lifecycle cleanup.** `game.events.on(...)` listeners registered by the scenes are never removed on shutdown — a leak risk if scenes are ever rebuilt rather than slept.

## Running unit tests

Run `npx nx test np-space-map` to execute the unit tests (Vitest) — currently the `NormalityFront` collapse/swallow suite.
