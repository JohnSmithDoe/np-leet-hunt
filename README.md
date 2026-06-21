# np-leet-hunt

A hobby space-RPG game ("leet hunt") built as an **Nx monorepo**: an **Angular 21 / Ionic 8** shell app (standalone components, zoneless, OnPush) hosting a **Phaser 3** game, packaged for iOS/Android via **Capacitor 8**.

- The full game design doc lives in [`game-design.md`](./game-design.md).
- The active issue backlog is [`BACKLOG.md`](./BACKLOG.md) (`Leet-<n>` numbering).
- Working notes for contributors (incl. AI agents) are in [`CLAUDE.md`](./CLAUDE.md).

**Version constraints to respect:**

- **Phaser stays on 3.x** — Phaser 4 is a ground-up rewrite incompatible with the game code and `phaser3-rex-plugins`.
- **Angular tracks the newest version Nx supports** (Nx's peer range usually lags one major behind Angular's latest).

## Architecture

The npm scope is `np-afterwork`; libraries are imported via the `@shared/*` path aliases in `tsconfig.base.json`. The dependency graph is layered — the app sits on the game modes, the game modes sit on the Phaser bridge, and everything bottoms out in the framework-agnostic utilities:

```
apps/np-leet-hunt  (Ionic shell)
        │
        ├── @shared/np-space-map      (overworld)
        ├── @shared/np-paradroid      (circuit mini-game)
        └── @shared/np-pixel-dungeon  (roguelike)
                    │
                @shared/np-phaser     (Angular↔Phaser bridge + game framework)
                    │
                @shared/np-library    (framework-agnostic utilities)
```

- **`apps/np-leet-hunt`** — the Ionic shell. `HomePageComponent` waits for `StageService.initialized$`, then adds and starts game-mode scenes. (`apps/old/` is scrap, not part of the build.)

Each library has its own README with how it works, its main components, and a grounded "what can be improved" list:

| Library                                                 | What it is                                                                                                                                 | Key components                                                                                                                                                                                                                       | Notable gaps (see its README)                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`np-library`](./libs/np-library/README.md)             | Framework-agnostic TypeScript utilities; the bottom of the dependency graph.                                                               | `NPBaseSubscriber` (RxJS cleanup), math helpers (`clamp`, `array2D`, radian constants).                                                                                                                                              | Re-exports `piecemeal` _from_ `np-phaser`, inverting the dependency direction; no tests.                                                        |
| [`np-phaser`](./libs/np-phaser/README.md)               | The Angular↔Phaser bridge and shared game framework everything builds on.                                                                  | `PhaserService` (owns `Phaser.Game`), `StageService` (scene lifecycle), `NPScene` (component model), `StageComponent`, shared sprites/cameras, and the `piecemeal` geometry/RNG toolkit (`NPVec2`, `NPRect`, `NPRng`, `EDirection`). | Thin public barrel forces deep imports; fragile fade plumbing; heavy rex-plugin coupling; near-zero tests.                                      |
| [`np-space-map`](./libs/np-space-map/README.md)         | The star-map / overworld, run as **three concurrent scenes** (background, map, UI) with independent cameras instead of Phaser layers.      | `SpaceScene` / `SpaceMapScene` / `SpaceUiScene`, `NPSpaceMap`, `StarmapFactory` (Poisson-disc generation), `Planet`.                                                                                                                 | Cross-scene API is only two zoom events; hardcoded config; possible outer-space sampling offset.                                                |
| [`np-paradroid`](./libs/np-paradroid/README.md)         | A Paradroid-style "Influence Device" duel — capture a procedurally-generated circuit by activating flow paths toward the contested middle. | `ParadroidScene`, `ParadroidFactory` (seeded generation), `ParadroidEngine`, `ParadroidField`/`Path` state machines.                                                                                                                 | Magic numbers; stringly-typed path state; dead `ParadroidIntro`; no tests.                                                                      |
| [`np-pixel-dungeon`](./libs/np-pixel-dungeon/README.md) | A turn-based roguelike: room-and-maze dungeon generation, energy-gated turns, pathfinding, FOV, LPC-spritesheet mobs.                      | `PixelDungeonScene`, `PixelDungeonEngine` (rex state machine), `PixelDungeonFactory`, tilemap layers, mob traits (movement/action/vision).                                                                                           | FOV `perspective` mode disabled (_"true crashs"_) so no true line-of-sight occlusion; placeholder enemy AI; `EndGameState` is a stub; no tests. |

**Asset convention:** each library keeps its assets under its own source tree; the app's `project.json` build target copies them to output folders named after the lib (`./np-phaser`, `./np-space-map`, …), so in-game `load` calls reference paths like `np-space-map/...`.

### Cross-cutting observations

Themes that recur across the game libraries and are worth treating as a shared backlog:

- **No unit tests in any game library.** The pure, deterministic pieces — `StarmapFactory`, the Paradroid factory, the dungeon generator, and the `piecemeal` geometry/RNG toolkit — are the cheapest, highest-value places to start.
- **Debug `console.log` noise** is left in across all of the game modes and `np-phaser`; gate it behind a debug flag or remove it.
- **Dead / commented-out code** lingers (`np-phaser`'s `WorldScene`/`NPTileableMap`, Paradroid's `ParadroidIntro`, space-map's `Reality` and unused scroller).
- **Hardcoded magic numbers and config** (fade/scroll durations, starmap dimensions, zoom levels, path speeds, room sizing) should move into named constants or options.
- **Thin public surfaces** mean consumers reach into `src/lib/...` by deep path; widening the barrels would make the available toolkit discoverable.

## Getting started

```bash
npm install
npm start                       # serve np-leet-hunt at http://localhost:4200
npx nx serve np-leet-hunt       # same, explicit
```

### Common commands

```bash
npx nx build np-leet-hunt                  # production build → dist/apps/np-leet-hunt
npx nx test <project>                      # Vitest (np-leet-hunt, np-library, np-phaser, np-paradroid, np-pixel-dungeon, np-space-map)
npx nx test <project> -- <path>            # single test file
npx nx test <project> -- -t "<pattern>"    # single test by name
npx nx lint <project>                      # ESLint (flat config, eslint.config.mjs)
npx nx stylelint <project>                 # Stylelint (scss)
npx nx e2e np-leet-hunt-e2e                # Playwright e2e (first run: npx playwright install chromium)
npx nx affected:test                       # affected only; defaultBase is 'master'
npx nx graph                               # view the project dependency graph
```

When generating a new project with Nx, also add Stylelint: `nx g nx-stylelint:configuration --project <projectName>`.

## Mobile (Capacitor)

A production build must exist before syncing to a native platform:

```bash
npx nx build np-leet-hunt
npm run sync:app:angular        # cap copy + sync
npm run ios:app:angular         # open the iOS project
npm run android:app:angular     # open the Android project
```

## License

np-leet-hunt is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see [`LICENSE`](./LICENSE).

The project adopted AGPL to match its **Strudel** audio engine (`@strudel/web`, also AGPL-3.0): bundling AGPL code makes the combined work AGPL, so the whole game is source-available. AGPL's distribution/network terms conflict with the Apple App Store's usage rules, so the game ships via **GitHub, Google Play, and F-Droid — never the Apple App Store** (direct iOS sideloading stays AGPL-clean).

Copyright (C) 2026 Martin Stärk. _(adjust the holder/year to taste)_

## Checking licenses

```bash
npx license-checker --summary   # or vanilla: npx license-checker
```

## Further help

Visit the [Nx documentation](https://nx.dev) to learn more about generators, the task runner, and the dependency graph.
