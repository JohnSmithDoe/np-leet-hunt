# np-phaser

The Angular ↔ Phaser bridge and the shared game framework every game-mode library builds on (`np-space-map`, `np-paradroid`, `np-pixel-dungeon`). It owns the single `Phaser.Game` instance, drives scene lifecycle, defines the component model that scenes are written against, and ships a grab-bag of reusable sprites, cameras, and geometry/RNG utilities.

Imported via the `@shared/np-phaser` path alias defined in `tsconfig.base.json`.

## How it works

**Booting Phaser from Angular**

1. `StageComponent` (`src/lib/basics/stage/stage.component.ts`) is the Angular host for the canvas. It is `OnPush` and uses a `ResizeObserver` to **defer** `StageService.initStage(container)` until the container has non-zero dimensions — Phaser 3.8x throws *"Framebuffer status: Incomplete Attachment"* if a WebGL renderer boots at 0×0 and never recovers on resize. Keep this deferral when touching stage bootstrap.
2. `PhaserService` (`src/lib/service/phaser.service.ts`) creates the one `Phaser.Game`, configures the scale manager, and registers the global rex plugins (`rexMouseWheelScroller`, `rexShip`, `rexStateManager`). It exposes `initialized$` so consumers know when the game is live.
3. `StageService` (`src/lib/service/stage.service.ts`, root-provided) is the scene orchestrator. Components subscribe to `initialized$`, then call `startScene(key, scene)`, which fades the current scene's cameras out, removes it, adds the new scene, and lets it fade in.

The app is **zoneless** (no zone.js), so Phaser's 60 FPS loop never trips Angular change detection by construction — there are no `NgZone.runOutsideAngular` workarounds, and template-driving state must use signals or explicit notification.

**The scene component model (`NPScene`)**

`NPScene` (`src/lib/scenes/np-scene.ts`) is an abstract `Phaser.Scene`. Subclasses implement `setupComponents()` and register game objects via `addComponent()`. The base class then drives every registered component through the Phaser lifecycle — `init` → `preload` → `create` → `addToScene` — and finally fades the cameras in. Components implement the `NPSceneComponent` / `NPGameObject` hooks (`src/lib/scenes/np-scene-component.ts`); `NPGameObjectList` lets components be composed into nested trees that the scene drives as one. Scenes target a 1920×1080 base resolution.

**Cameras & layers**

Game modes deliberately avoid Phaser display layers in favour of per-concern cameras. `NPCamera` (`src/lib/cameras/np-camera.ts`) can *focus* a subset of objects/layers and filters its render list to them; `NPFullscreenCamera` resizes itself to the scene scale on every resize event; `NPLayer` (`src/lib/scenes/np-layer.ts`) pairs a `Phaser.GameObjects.Layer` with its own fullscreen camera.

## Main components

**Services**
- `PhaserService` (`service/phaser.service.ts`) — owns `Phaser.Game`, registers rex plugins, exposes `initialized$`, tears the game down.
- `StageService` (`service/stage.service.ts`) — scene lifecycle: `initStage`, `startScene` (fade-out → remove → add → fade-in), `destroyStage`.

**Scene framework**
- `NPScene` (`scenes/np-scene.ts`) — abstract base; runs the component lifecycle and camera fades.
- `NPSceneComponent` / `NPGameObject` / `NPGameObjectList` (`scenes/np-scene-component.ts`) — the lifecycle interfaces and the composite collection that batches them.
- `NPLayer` (`scenes/np-layer.ts`) — a Phaser layer bundled with a fullscreen camera.
- `WorldScene` (`scenes/world.scene.ts`) — a minimal example scene (largely a stub / scroll-manager demo).

**Angular**
- `StageComponent` (`basics/stage/stage.component.ts`) — `OnPush` canvas host with `ResizeObserver`-deferred boot.

**Cameras** — `NPCamera`, `NPFullscreenCamera` (`cameras/`).

**Sprites & UI** (`sprites/`)
- `NPMovableSprite` (`np-movable-sprite.ts`) — arcade image with rex `Ship` behaviour and `MoveTo` path-following.
- `NPButton` (`button/NpButton.ts`) — textured button with hover/active/disabled states, emits a click event.
- `TextButton` (`button/text-button.ts`) — lightweight text-only button.
- `Image` (`image/image.ts`) — image/spritesheet wrapper that handles its own preload.
- `DashedLine` (`dashed-line/dashed-line.ts`) — animated dashed connector drawn as a tile sprite.
- `BinaryTimer` (`timer/binarytimer.ts`) — graphics countdown that renders the remaining time in binary, with an end event and a "frenzy" finish.

**Containers & factories**
- `NPTileableMap` (`container/np-tileable-map.ts`) — a tiled-map game-object list (largely stubbed).
- `graphics.factory.ts` (`factories/`) — `createRectangle`, `createSpeechBubble` helpers.

**Utilities** (`utilities/`)
- `np-phaser-utils.ts` — type guards (`isLayer`), angle/point math, `getClosest`, Poisson-disc point sampling.
- `np-timer.ts` — a stateful `waitFor(ms)` elapsed-time check.
- `scroll-manager.ts` — drag-to-pan and tweened scroll-to with bounds.

**Piecemeal geometry/RNG toolkit** (`utilities/piecemeal/`, re-exported by `np-library`)
- `NPVec2` — immutable 2-D vector with arithmetic, distance metrics (Euclidean/rook/king), neighbour queries, and direction conversion.
- `NPRect` — immutable integer rectangle: corners, center, intersection, containment, edge tracing, point iteration.
- `NPRng` — seeded RNG over `Phaser.Math.RandomDataGenerator` (`inRange`, `oneIn`, `percentageHit`, `item`, …) for reproducible generation.
- `EDirection` — the 8 cardinal/intercardinal directions plus rotators and rex-plugin direction mapping.

## Public API

`src/index.ts` exports `StageService`, `PhaserService`, `WorldScene`, `StageComponent`, `NPScene`, and `NPSceneComponent`. Sprites, cameras, and most utilities are **not** in the barrel — game modes import them by deep path (e.g. `@shared/np-phaser/src/lib/sprites/...`). The piecemeal toolkit is surfaced through `@shared/np-library`.

## What can be improved

- **Thin public surface, deep imports everywhere.** Only six symbols are exported from `index.ts`, so consumers reach into `src/lib/...` directly for sprites, cameras, and utilities. Widening the barrel would stop the import sprawl and make the available toolkit discoverable.
- **Debug `console.log` noise.** Scene transitions and service boot log freely (e.g. "fade done remove scene" on every swap). These should be gated behind a debug flag or removed.
- **Dead / commented-out code.** `WorldScene`, `NPTileableMap`, `DashedLine`, and the two unused point-distribution algorithms in `np-phaser-utils.ts` carry large commented blocks worth pruning.
- **Fragile fade plumbing.** Fade-in/out is built on raw `Observable` + `take(1)` with manual subscription handling and a hardcoded 1000 ms duration in both `NPScene` and `StageService`. A promise-based or operator-based approach would be sturdier and the duration should be a parameter.
- **No lifecycle error boundary.** If a component's `preload`/`create` throws, the scene is left half-initialised with no recovery path.
- **Heavy rex-plugin coupling with no abstraction.** `NPMovableSprite` (Ship/MoveTo), the scroll manager, the state manager, and pathfinding all bind directly to `phaser3-rex-plugins`; there's no seam to swap or stub them.
- **Almost no tests.** Coverage is a single smoke test that the Phaser bundle loads. The pure pieces — `NPVec2`/`NPRect`/`NPRng` math, scroll bounds, `BinaryTimer` countdown, component ordering — are all testable and currently untested.
- **Hardcoded magic numbers** for fade and scroll-tween durations should move into named constants or options.

## Running unit tests

Run `npx nx test np-phaser` to execute the unit tests (Vitest, jsdom + `vitest-canvas-mock` for Phaser's canvas probing).
