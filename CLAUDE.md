# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A hobby space-RPG game ("leet hunt") built as an Nx monorepo: an Angular 21 / Ionic 8 shell app (standalone components, zoneless — no zone.js — with OnPush change detection, `bootstrapApplication` + `app.config.ts`) hosting a Phaser 3 game, packaged for iOS/Android via Capacitor 8. The design doc is `game-design.md` (full GDD, built with the `/game-designer` skill); the active issue backlog is `BACKLOG.md` (continues the `Leet-<n>` numbering). Neither contains coding rules.

Version constraints to respect:
- **Phaser stays on 3.x** — Phaser 4 is a ground-up rewrite incompatible with the game code and `phaser3-rex-plugins`.
- **Angular tracks the newest version Nx supports** (Nx's peer range usually lags one major behind Angular's latest).

## Commands

```bash
npm start                                  # serve default project (np-leet-hunt) at http://localhost:4200
npx nx serve np-leet-hunt                  # same, explicit
npx nx build np-leet-hunt                  # production build to dist/apps/np-leet-hunt (esbuild application builder)
npx nx test <project>                      # Vitest (projects: np-leet-hunt, np-library, np-phaser, np-paradroid, np-pixel-dungeon, np-space-map)
npx nx test <project> -- <path>            # single test file (e.g. -- src/lib/phaser.spec.ts)
npx nx test <project> -- -t "<pattern>"    # single test by name
npx nx lint <project>                      # ESLint (flat config, eslint.config.mjs at root)
npx nx stylelint <project>                 # Stylelint (scss)
npx nx e2e np-leet-hunt-e2e                # Playwright e2e (first run: npx playwright install chromium)
npx nx affected:test                       # affected only; defaultBase is 'master'
```

Mobile (Capacitor): `npm run sync:app:angular`, `npm run ios:app:angular`, `npm run android:app:angular` (run a build first).

When generating a new project with Nx, also run `nx g nx-stylelint:configuration --project <projectName>`.

Vitest specifics: tests run via `@nx/vitest:test` with per-project `vitest.config.ts` (jsdom, globals on, `@analogjs/vite-plugin-angular` for TestBed/templateUrl support). `vitest-canvas-mock` satisfies Phaser's canvas probing, `phaser3spectorjs` is installed as a devDependency (Phaser's source build requires it), and the Ionic packages are inlined via `test.server.deps.inline` because their fesm bundles use directory imports Node ESM rejects. `window.matchMedia` is mocked in the app's `test-setup.ts` for Ionic.

## Architecture

Nx workspace, npm scope `np-afterwork`. Libraries are imported via the `@shared/*` path aliases defined in `tsconfig.base.json`:

- **`@shared/np-library`** — framework-agnostic utilities (e.g. `NPBaseSubscriber` for RxJS subscription cleanup).
- **`@shared/np-phaser`** — the Angular↔Phaser bridge and shared game framework. Everything else builds on this:
    - `PhaserService` creates the single `Phaser.Game` and registers the global rex plugins (`rexMouseWheelScroller`, `rexShip`, `rexStateManager`). The app is zoneless, so the 60 FPS game loop can't trigger Angular change detection by construction (no `NgZone` workarounds needed).
    - `StageService` (root-provided) owns scene lifecycle: `initStage(container)` boots Phaser, `startScene(...entries)` swaps the visible mode with a camera fade-out → switch → fade-in. A mode is the *whole set* of scenes passed in one call (the three space scenes are one mode). On leave, entries flagged `persistent: true` are **slept** (no update/render, full state kept) and resumed/woken on return; entries without the flag are **removed** and rebuilt fresh on next entry. So the space map persists across excursions while a Paradroid fight or dungeon run starts clean each time. Only one mode is awake/visible at a time. Components subscribe to `initialized$` before starting scenes.
    - `NPScene` (abstract, extends `Phaser.Scene`) defines the component model: subclasses implement `setupComponents()` and register objects via `addComponent()`; the base class then drives them through `init/preload/create` and fades cameras in. Scenes target a 1920×1080 base size.
- **Game-mode libraries**, each exposing scene(s) started from the app:
    - `@shared/np-space-map` — the star map / overworld. Runs **three concurrent scenes** (`SpaceScene`, `SpaceMapScene`, `SpaceUiScene`) instead of Phaser layers (layers were deliberately avoided — see TODO.md "Camera handling"); each scene has its own camera.
    - `@shared/np-paradroid` — Paradroid-style circuit mini-game (`ParadroidScene`).
    - `@shared/np-pixel-dungeon` — roguelike dungeon mode (`PixelDungeonScene`).
- **`apps/np-leet-hunt`** — the Ionic shell. `HomePageComponent` waits for `StageService.initialized$` then adds/starts scenes. `apps/old/` is scrap, not part of the build.

**Asset convention:** each library keeps its assets under its own source tree; the app's `project.json` build target copies them to output folders named after the lib (`./np-phaser`, `./np-space-map`, `./np-paradroid`, `./np-pixel-dungeon`). In-game `load` calls therefore reference paths like `np-space-map/...`.

## Code style

- Prettier: 4-space indent, 120 print width, single quotes. ESLint (v9 flat config, `eslint.config.mjs`) enforces `simple-import-sort`, one class per file, and `interface` over `type` for object shapes. `member-ordering` is deliberately off — the codebase interleaves `#private` and public members.
- Angular selectors use the `np` prefix (`np-` kebab-case for components, `npCamelCase` for directives); component classes end in `Component`. Everything is standalone (no NgModules) and OnPush; the app is zoneless, so template-driving state must use signals or explicit change notification.
- `*.spec.ts` files are excluded from ESLint (ignores in `eslint.config.mjs`).
- Husky + lint-staged run `eslint --fix` / `stylelint --fix` on commit.
- Commit messages follow `Leet-<n>: <description>` (see git log).

## Gotchas

- Phaser must never boot while its container is 0×0 — since Phaser 3.8x a zero-sized WebGL renderer throws "Framebuffer status: Incomplete Attachment" at boot instead of recovering on resize. `StageComponent` defers `initStage` via ResizeObserver until the container has dimensions; keep that behavior when touching stage bootstrapping.
- Ionic imports must come from `@ionic/angular/standalone`, never `@ionic/angular` — mixing the two entrypoints double-registers the web components. Icons are bundled via `addIcons({ ... })` from `ionicons` in the component that uses them (see `home.page.ts`).
