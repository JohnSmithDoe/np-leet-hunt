# np-pixel-dungeon

A turn-based roguelike dungeon mode: a procedurally-generated dungeon (rooms joined by mazey hallways and doors) rendered to Phaser tilemaps, with energy-gated turns, grid movement, pathfinding, and field-of-view vision. Mobs are drawn from Liberated Pixel Cup (LPC) spritesheets. Built on `@shared/np-phaser` and the `phaser4-rex-plugins` board / pathfinder / field-of-view / state-manager plugins.

Imported via the `@shared/np-pixel-dungeon` path alias defined in `tsconfig.base.json`.

> For the in-depth design — boot sequence, coordinate systems, and the turn engine — see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

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

See [`ARCHITECTURE.md` §12 Known gaps](./ARCHITECTURE.md#12-known-gaps) for the maintained list. In short:

- **No health/damage/death model** — attacks are cosmetic (a tween + a `"3"` text); nothing dies.
- **No win/lose condition** — `EndGameState` is a stub; the only exit is the debug `M` key (always reports `failed`).
- **The dungeon seed is hard-coded** — every run generates the identical layout, and difficulty/size/spawns ignore the central `@shared/np-state` `Balance` curve other modes use.
- **Spawn placement is unchecked** — mobs are placed in a line from one room corner with no walkability guard.
- **Enemy AI is placeholder** — adjacent-attack or random-walk/warp; never hunts or paths toward the player.
- **Engine is hard-wired** — mobs and level built directly in the engine; no spawn/factory seam, no event bus.
- **LPC animation coverage is thin** — walk directions plus a die frame; no attack/hurt/idle animations.
- **Room sizing isn't tunable** — a baked-in formula (`// TODO ... do something better` in the factory) rather than min/max `TDungeonOptions` fields.
- **Camera wheel-zoom is broken** — a `// TODO not working` around preserving the world point under the cursor.
- **Debug `console.log` noise** scattered across the scene, engine, traits, and dungeon; floating `"mov"`/`"!"` texts on movement.
- **Brittle initialisation order** — `PixelDungeonMob.tile` logs and returns `{0,0,0}` when a mob has no board position yet.

## Running unit tests

Run `npx nx test np-pixel-dungeon` to execute the unit tests (Vitest).
