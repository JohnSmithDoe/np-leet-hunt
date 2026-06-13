# np-library

Framework-agnostic utility library. No Angular, no Phaser — just plain TypeScript helpers that any other library or the app can depend on without pulling in a rendering or UI framework. It sits at the bottom of the dependency graph: everything may import from it, and it imports from nobody (with one pragmatic exception, see below).

Imported via the `@shared/np-library` path alias defined in `tsconfig.base.json`.

## What's inside

- **`NPBaseSubscriber`** (`src/lib/base/np-base-subscriber.ts`) — an `@Directive()`-decorated base class that owns a single RxJS `Subscription`. Subclasses call `listen(sub)` to register subscriptions and the base `ngOnDestroy()` tears them all down at once. This is the standard subscription-cleanup pattern for the Angular components in the workspace.
- **Math constants & helpers** (`src/lib/np-utils.ts`) — pre-computed radian constants (`PI`, `PIHalf`, `PIQuart`, `PIAndAHalf`, `PIDouble`, `OneDegInRad`), a `clamp(value, upper, lower)` function, and `array2D(rows, cols, generator)` for building 2-D arrays from a per-cell factory (used heavily by the grid-based game modes).
- **`nyanConsole(message)`** (`src/lib/np-utils.ts`) — a rainbow-text `console.log` helper for eye-catching debug output.

## Public API

`src/index.ts` re-exports:

- everything from `np-utils` (the constants plus `clamp`, `array2D`, `nyanConsole`)
- `NPBaseSubscriber`
- the entire **`piecemeal`** geometry toolkit (`NPVec2`, `NPRect`, `NPRng`, `EDirection`) — note this is re-exported *from* `np-phaser` (`../../np-phaser/src/lib/utilities/piecemeal`), not defined here.

## What can be improved

- **The `piecemeal` re-export crosses a library boundary.** `np-library` reaches into `np-phaser`'s source tree (`../../np-phaser/...`) to re-export the geometry helpers. That inverts the intended dependency direction (the framework-agnostic base depending on the Phaser bridge) and bypasses the `@shared/*` aliases. The `piecemeal` helpers are themselves framework-agnostic and would be a more natural fit living *in* `np-library`, with `np-phaser` re-exporting them instead.
- **No tests.** None of the utilities are covered. `clamp` (note the unconventional argument order), `array2D`, and the geometry helpers are pure functions and cheap to test.
- **`clamp` argument order is surprising** — `clamp(value, upper, lower)` rather than the more common `(value, min, max)`. Worth a doc comment or a signature change.

## Running unit tests

Run `npx nx test np-library` to execute the unit tests (Vitest).
