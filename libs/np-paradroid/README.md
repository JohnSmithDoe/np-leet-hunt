# np-paradroid

A Paradroid-style circuit mini-game — the "Influence Device" duel from the classic Paradroid, where two players (the human and the droid) fight for control of a procedurally-generated circuit board by activating flow paths from their own edge toward the contested middle column. Built on `@shared/np-phaser` (`NPScene` and the shared sprites/utilities).

Imported via the `@shared/np-paradroid` path alias defined in `tsconfig.base.json`.

## How it works

**The board.** The playfield is a grid of *tiles*, each tile a small 2×3 arrangement of *sub-tiles*, and each sub-tile carries one or more *paths* (a flow from an entry port to an exit port — top/bottom/left/right/mid). Shapes range from straight lines through L/T/X junctions, with two special effects a path can carry: `fx-changer` (flips ownership of the flow) and `fx-autofire` (a path that, once active, can't be switched off).

**Generation.** `ParadroidFactory` (`core/paradroid.factory.ts`) builds the grid column by column with a seeded `NPRng`, choosing tile types from a difficulty-specific tile set so each new column's entry ports line up with the previous column's exits. It validates that enough of the final column reaches the middle (so the board is winnable), then links every path to its upstream (`prev`) and downstream (`next`) neighbours and stamps on the changer/autofire effects. Difficulty (`CParadroidModes`) tunes the tile set plus changer and autofire rates.

**Play & state flow.** The two players' boards are built symmetrically; the droid's grid is rendered mirrored (`setScale(-1, 1)`).

1. The player clicks a `ParadroidButton` on their edge, activating the input path of that row's first field.
2. A `ParadroidField` filters its paths to those matching the incoming flow and activates them.
3. Each `ParadroidPath` runs a small state machine — `inactive → activating → active → deactivating → inactive` — animating its sprite width as it fills and drains.
4. When a path finishes activating, `ParadroidEngine` (`core/paradroid.engine.ts`) cascades to its `next` paths; a terminal path fires an event into the `ParadroidMiddle` column.
5. `ParadroidMiddle` tracks per-row ownership (none / player / droid / both) and reports totals — control of the middle is how you win the duel.

`ParadroidGame` (`core/paradroid.game.ts`) ties it together: it owns both grids, the engines, the row buttons, the shot counters, and the countdown timer.

## Main components

**Scene**
- `ParadroidScene` (`paradroid.scene.ts`) — entry point; extends `NPScene`, wires up the game, handles resize, and offers a re-create button for iterating on generation.

**Core logic** (`core/`)
- `ParadroidGame` (`paradroid.game.ts`) — orchestrates the two boards, buttons, shots, timer, and middle-row tallies.
- `ParadroidEngine` (`paradroid.engine.ts`) — event-driven activation/deactivation propagation across the field grid.
- `ParadroidFactory` (`paradroid.factory.ts`) — seeded procedural grid generator + solvability validation + path linking.

**Sprites** (`sprites/`)
- `ParadroidField` (`paradroid.field.ts`) — one circuit node; activates its paths and signals the engine when its inputs are satisfied.
- `ParadroidPath` (`paradroid.path.ts`) — the visual + state machine for a single flow.
- `ParadroidButton` (`paradroid.button.ts`) — a clickable row starter with a cooldown.
- `ParadroidMiddle` (`paradroid.middle.ts`) — the contested centre column; visualises per-row ownership.
- `ParadroidImage` (`paradroid.image.ts`) — image wrapper used for shots/artwork.
- `ParadroidIntro` (`paradroid.intro.ts`) — an intro animation, currently disabled.

**Types & constants** (`@types/`)
- `paradroid.consts.ts` — enums (owner, access, flow-from/to, shape, tile type, difficulty) and the lookup tables `CParadroidShapeInfo`, `CParadroidTileInfo`, `CParadroidModes`.
- `paradroid.types.ts` — the `TParadroidPath` / `TParadroidSubTile` / `TParadroidTile` / mode interfaces.
- `paradroid.utils.ts` — shape predicates (`isCombineShape`, `isExpandShape`), flow conversion, row enumeration.

## Data model

The core graph node is `TParadroidPath` — a flow with `from`/`to` ports, an `fx` of `none | fx-changer | fx-autofire`, an `owner`, and `prev[]` / `next[]` links to neighbouring paths. Paths live on a `TParadroidSubTile` (its grid `col`/`row` plus a shape definition); sub-tiles compose into a `TParadroidTile` (a typed 2×3 block with `incoming`/`outgoing` port definitions). Ownership and routing are driven by the `EParadroidOwner`, `EFlowFrom`/`EFlowTo`, `EParadroidShape`, `EParadroidTileType`, and `EParadroidDifficulty` enums in `paradroid.consts.ts`.

## Public API

`src/index.ts` exports only `ParadroidScene`. Everything else is internal. Consumers start the scene through `StageService` (`startScene(ParadroidScene.key, new ParadroidScene())`).

## What can be improved

- **Magic numbers everywhere.** Path fill/drain speeds, the button cooldown, and the round timer are inline literals scattered through the sprites and game; pull them into `paradroid.consts.ts`.
- **Stringly-typed path state.** `ParadroidPath`'s `'inactive' | 'activating' | 'deactivating' | 'active'` union should be an enum to match the rest of the type model.
- **Dead code.** `ParadroidIntro` references a removed camera and is disabled; `TParadroidPath.triggeredBy` is declared but never used; the factory imports a flow helper it doesn't call — all worth removing.
- **Debug `console.log` noise** on field activation, middle-row changes, and factory stats should be gated or removed.
- **Undocumented protocols.** The field activate/deactivate rules and the sprite-sheet frame mapping (`shapeToFieldDefinition`) are non-obvious and deserve a doc comment; the shape→frame mapping isn't exhaustively distinct for every tile type.
- **Hardcoded generation thresholds.** The "≥50 % of the final column must reach the middle" solvability check and the retry count are baked in; expose them (and the RNG seed) through factory options for tuning and reproducibility.
- **No tests.** Generation/validation, path linking, and the activation state machine are the highest-value targets and currently have no coverage.

## Running unit tests

Run `npx nx test np-paradroid` to execute the unit tests (Vitest).
