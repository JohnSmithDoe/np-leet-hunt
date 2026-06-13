# np-pixel-dungeon

A turn-based roguelike dungeon mode: a procedurally-generated dungeon (rooms joined by mazey hallways and doors) rendered to Phaser tilemaps, with energy-gated turns, grid movement, pathfinding, and field-of-view vision. Mobs are drawn from Liberated Pixel Cup (LPC) spritesheets. Built on `@shared/np-phaser` and the `phaser3-rex-plugins` board / pathfinder / field-of-view / state-manager plugins.

Imported via the `@shared/np-pixel-dungeon` path alias defined in `tsconfig.base.json`.

## How it works

**1 · Dungeon generation** (`dungeon/pixel-dungeon.factory.ts`, `dungeon/pixel-dungeon.ts`)

A classic room-and-maze carve over an odd-sized wall grid, seeded by `NPRng` for reproducibility:

1. **Rooms** — try to place non-overlapping rectangular rooms; each gets a unique *region* id.
2. **Hallways** — flood the leftover space with a growing-tree maze (a `straightenPercentage` biases toward straight corridors).
3. **Junctions** — find walls that border two unconnected regions, carve connectors to merge them, and (per `extraConnectorChance`) add a few redundant doors to create loops.
4. **Cleanup** — iteratively fill dead-end corridors and prune fully-enclosed walls, then add an empty border frame.

The result is a grid of `TDungeonTile`s (`type` ∈ wall/floor/room/junction/empty, plus `x`/`y` and `region`). Higher-level objects group those tiles: `PixelDungeonRoom`, `PixelDungeonHallway`, `PixelDungeonWall`, `PixelDungeonJunction` (`dungeon/parts/`).

**2 · Rendering** (`map/`)

`PixelDungeonMap` builds a Phaser tilemap and delegates to four layers: floor, wall, object (doors/junctions), and a stitch layer for wall-roof polish. `PixelDungeonTileset` maps each dungeon tile type to spritesheet indices with weighted-random variety (the "shattered" 16×16 tileset). A rex `Board` (`core/pixel-dungeon-board.ts`) is overlaid on the tilemap to drive grid coordinates, occupancy, and pathfinding. Vision is shown by alpha: `gainVision`/`loseVision` brighten or dim tiles as they enter/leave a mob's view.

**3 · The turn engine** (`engine/`)

`PixelDungeonEngine` owns the player, mobs, and level, and runs a rex `StateManager` state machine (`engine/states/`):

- `StartGameState` → `HandleActionState` → (`EndGameState`, currently a stub).
- `HandleActionState` is the core loop: pump energy onto every mob until at least one reaches `FULL_ENERGY` (100), then let each ready mob `perform()` its queued action to completion (waiting out animations), draining energy on finish, before looping back to pump again.

Actions implement a small `perform()/finish()` contract: `WalkToAction`, `AttackMobAction` (tween + yoyo hit), `WarpAction` (teleport), `RestAction`, and `WaitForInputAction` (blocks on player input).

**4 · Mobs & traits** (`sprites/`, `sprites/traits/`)

A `PixelDungeonMob` (extending `PixelDungeonLPCSprite`) composes three orthogonal traits:

- `MobMovement` (`mob-movement.ts`) — rex `MoveTo`-based grid movement and path queueing.
- `MobAction` (`mob-action.ts`) — the energy pool and per-turn action queue.
- `MobVision` (`mob-vision.ts`) — rex `FieldOfView` cone, `canSee(tile)`, and facing direction.

`PixelDungeonPlayer` walks player-clicked paths and attacks adjacent mobs; `PixelDungeonEnemy` runs a simple AI (attack if the player is adjacent, otherwise random-walk or warp). `PixelDungeonInfoText` shows floating damage/status text.

## Main components

- **Scene** — `PixelDungeonScene` (`pixel-dungeon.scene.ts`): entry point; camera, input, and engine setup.
- **Engine** — `PixelDungeonEngine` + `PixelDungeonState` and the states in `engine/states/`.
- **Core** — `PixelDungeonBoard` (`core/pixel-dungeon-board.ts`), `PixelDungeonPathfinder` (`core/pixel-dungeon.pathfinder.ts`, A* over the board).
- **Dungeon model** — `PixelDungeon`, `PixelDungeonLevel`, `PixelDungeonFactory` (`dungeon/`) and the `parts/` tile objects.
- **Map/rendering** — `PixelDungeonMap`, `PixelDungeonTileset`, and the `map/layer/` floor/wall/object/tile layers.
- **Sprites** — `PixelDungeonLPCSprite`, `PixelDungeonMob`, `PixelDungeonPlayer`, `PixelDungeonEnemy`, `PixelDungeonInfoText` and the `traits/` (movement, action, vision).
- **Types** — `@types/pixel-dungeon.types.ts`.

## Data model

Key types in `@types/pixel-dungeon.types.ts`:

- `ETileType` — `none`/`floor`/`wall`/`room`/`junction`.
- `TDungeonTile` — `{ type, x, y, region }`; `region` 0 is void, positive ids are connected rooms/hallways.
- `TDungeonOptions` — generation knobs: `width`, `height`, `roomTries`, `roomArea`, `roomExtraSize`, `extraConnectorChance`, `straightenPercentage`, `seed`.
- Mob option types layer on top of the LPC sprite options (`energyGain`, `moveSpeed`, `visionRange`, `fovConeAngle`, `startingDirection`, character `key`).

## Public API

`src/index.ts` exports only `PixelDungeonScene`. Everything else is internal. Add the scene to the Phaser game (via `StageService`) to run the mode.

## What can be improved

- **Vision "blocking bits" (the standing TODO).** In `mob-vision.ts`, FOV runs with `blockerTest: true` but `perspective: false` because the plugin's perspective mode *"crashs"*, and the `preTestCallback`/`costCallback` are commented out. So walls register as blockers but the player never *sees* the shadowed geometry — visibility is effectively radius/cone-shaded rather than true line-of-sight occlusion. Getting perspective mode working (or rendering the blocked tiles explicitly) is the headline gameplay gap.
- **Enemy AI is placeholder.** Enemies attack only when the player is already adjacent; otherwise they random-walk or warp. The pathfinder exists but is used only for player clicks — enemies never hunt, flee, or path toward the player.
- **Engine is hard-wired.** `PixelDungeonEngine` constructs mobs directly and `PixelDungeonLevel` builds its map in its constructor; there's no spawn/factory seam, so swapping enemy types or injecting a level is awkward. There's also no event system for mob death / level-complete / player-spotted, so coupling is by direct calls.
- **`EndGameState` is a stub** — the game never really ends.
- **LPC animation coverage is thin** — walk directions plus a die frame; no attack/hurt/idle animations.
- **Room sizing isn't tunable.** Room dimensions come from a baked-in `inRange(1, 3 + roomExtraSize) * 2 + 1` formula (a `// TODO ... do something better` is in the factory); min/max should be real `TDungeonOptions` fields.
- **Camera wheel-zoom is broken** — the scene carries a `// TODO not working` around preserving the world point under the cursor while zooming.
- **Debug `console.log` noise** is scattered across the scene, factory, engine, and traits and should be gated or removed.
- **Brittle initialisation order** — `PixelDungeonMob.tile` logs an error and returns `{0,0,0}` when the mob has no board position yet, hinting at an ordering bug rather than a real fallback.
- **No tests.** Zero specs — and the dungeon generator (region connectivity, no overlaps, no unreachable rooms), the energy/action loop, pathfinding, and FOV are all high-value, deterministic things to cover.

## Running unit tests

Run `npx nx test np-pixel-dungeon` to execute the unit tests (Vitest).
