# np-pixel-dungeon — Architecture

A deep-dive into how the roguelike dungeon mode is put together. For the short "what it is /
how it works" summary, see [`README.md`](./README.md); this document covers the moving parts,
the boot sequence, the coordinate systems, and the turn engine in detail.

> Scope: this is the framework-and-data-flow doc. It does **not** prescribe coding rules (those
> live in the repo `CLAUDE.md`) and it is intentionally honest about the gaps — see
> [§12 Known gaps](#12-known-gaps).

---

## 1. What this library is

`@shared/np-pixel-dungeon` is one of the game-mode libraries layered on top of `@shared/np-phaser`.
It renders a **turn-based, grid-based roguelike**: a procedurally-generated dungeon of rooms joined
by mazey hallways and doors, mobs that act on an energy economy, click-to-path player movement,
A\* pathfinding, and field-of-view vision. It exposes exactly one public symbol — `PixelDungeonScene`
— which the app starts through `StageService`.

```
src/
├── index.ts                         // public surface: re-exports PixelDungeonScene only
└── lib/
    ├── pixel-dungeon.scene.ts        // NPScene entry point: camera, input, owns the engine
    ├── @types/pixel-dungeon.types.ts // ETileType, TDungeonTile, TDungeonOptions, NPSceneWithBoard
    ├── engine/                       // the turn state machine + actions
    │   ├── pixel-dungeon.engine.ts   //   PixelDungeonEngine (extends rex StateManager)
    │   ├── pixel-dungeon.state.ts    //   PixelDungeonState base
    │   └── states/                   //   StartGame → HandleAction → EndGame + the action classes
    ├── core/
    │   ├── pixel-dungeon-board.ts    // rex Board overlay (grid coords, occupancy)
    │   └── pixel-dungeon.pathfinder.ts // rex PathFinder (A*-line) for the player
    ├── dungeon/                      // the abstract dungeon MODEL (no Phaser objects)
    │   ├── pixel-dungeon.factory.ts  //   the generation algorithm (Rooms-and-Mazes)
    │   ├── pixel-dungeon.ts           //   PixelDungeon: maps the raw grid to part objects
    │   ├── pixel-dungeon.level.ts     //   PixelDungeonLevel: binds model ↔ map ↔ board
    │   └── parts/                     //   Tile/Floor/Wall/Junction/Room/Hallway
    ├── map/                          // the Phaser RENDERING of the model
    │   ├── pixel-dungeon.map.ts       //   PixelDungeonMap: four tilemap layers
    │   ├── pixel-dungeon-tileset.ts   //   role→tile-index mapping parsed from PixelDungeon.tsj
    │   └── layer/                     //   floor / wall / object / tile layer wrappers
    └── sprites/                      // the mobs
        ├── pixel-dungeon.lpc-sprite.ts // LPC spritesheet wrapper + walk/die animations
        ├── pixel-dungeon.mob.ts        // PixelDungeonMob: composes the three traits
        ├── pixel-dungeon.player.ts     // click-to-path + adjacent attack
        ├── pixel-dungeon.enemy.ts      // placeholder AI
        ├── pixel-dungeon.info-text.ts  // floating damage/status text
        └── traits/                     // movement / vision / action (energy)
```

---

## 2. The three layers (and why they're separate)

The library is organised around a strict **model → rendering → simulation** split:

| Layer | Owns | Knows about Phaser? | Key types |
|---|---|---|---|
| **Dungeon model** (`dungeon/`) | The abstract grid: what tile is where, which region it belongs to, room/hallway grouping | No — pure data and geometry | `PixelDungeon`, `PixelDungeonFactory`, `parts/*` |
| **Rendering** (`map/`, `sprites/`) | Phaser tilemaps, layers, the tileset role→index mapping, sprites | Yes | `PixelDungeonMap`, `PixelDungeonTileset`, `PixelDungeonLPCSprite` |
| **Simulation** (`engine/`, `core/`, traits) | Turn order, energy, actions, pathfinding, FOV, occupancy | Yes (via rex plugins) | `PixelDungeonEngine`, `PixelDungeonBoard`, `Mob*` traits |

`PixelDungeonLevel` (`dungeon/pixel-dungeon.level.ts`) is the **seam** that ties the three together:
it builds the model (`new PixelDungeon`), the rendering (`new PixelDungeonMap`), and the simulation
overlay (`new PixelDungeonBoard`) and exposes a single façade the engine talks to (`getMobAt`,
`moveMob`, `tileToWorldXY`, `areNeighbors`, `start`, …). The factory stays Phaser-free, which is why
it can be unit-tested headless (`pixel-dungeon.factory.spec.ts`).

---

## 3. Dependency stack

```
PixelDungeonScene
  └── @shared/np-phaser   (NPScene, NPGameObject, StageService — the Angular↔Phaser bridge)
  └── @shared/np-library  (NPRng, NPRect, NPVec2, EDirection, array2D — pure utilities)
  └── @shared/np-state     (DungeonResult — the typed result handed back to the run)
  └── phaser4-rex-plugins  (Board, PathFinder, FieldOfView, MoveTo, StateManager)
  └── phaser (4.x, ESM)
```

Two conventions worth knowing (both are deliberate — see the project memory notes):

- **Deep relative imports into `np-phaser`** (e.g. `../../../np-phaser/src/lib/...`) are intentional;
  game-mode libs reach into np-phaser internals rather than through the `@shared/np-phaser` barrel to
  avoid a self-import cycle. Don't "fix" them to the alias.
- **rex plugins are imported per-submodule** (`phaser4-rex-plugins/plugins/board/...`), never from a
  barrel. Phaser 4 is pure ESM and sets no global `Phaser`, so any file using `Phaser` as a *value*
  does `import * as Phaser from 'phaser'`.

> Note: `pixel-dungeon.tile.ts` currently imports `EDirection`/`NPVec2` via a deep
> `np-phaser/.../piecemeal` path while the rest of the lib imports them from `@shared/np-library`.
> These resolve to the **same module** (np-library re-exports piecemeal), so it's a cosmetic
> inconsistency, not a bug.

---

## 4. Boot sequence

`PixelDungeonScene` extends `NPScene`, which drives the standard Phaser `init → preload → create`
cycle (plus a camera fade-in). The scene does **not** use the `NPScene` component model
(`addComponent`); it owns a `PixelDungeonEngine` directly and forwards the lifecycle hooks to it.

```
StageService.startScene({ key, scene: new PixelDungeonScene({ onResult }) })
        │
NPScene.init()         → scene.setupComponents()  → new PixelDungeonEngine(scene)
        │                                              └─ #setup(): build Level, Player, Enemies, States
        │
scene.preload()        → engine.preload()          → level.preload()  (tileset image + PixelDungeon.tsj)
        │                                              mobs.preload()  (LPC spritesheets)
        │                 + load rexboardplugin scene plugin
        │
scene.create()         → engine.create()           → level.create()   (parse .tsj, build tilemap+layers,
        │                                                                place every tile on board+map)
        │                                              new PixelDungeonPathfinder
        │                                              #addMobs(start)  (place mobs, mob.create())
        │                                              updateFoV()
        │                 + camera/input wiring (drag-pan, wheel-zoom, click-to-move, "M" to leave)
        │                 + engine.startUP()   → goto(StartGame)
        │                 + engine.startUpdate()→ StateManager hooks the scene update loop
        │
scene.update(t, dt)    → camera smooth-follow of the player
engine.update(t, dt)   → StateManager.update → current state's next()/update()  (the turn loop)
```

**Persistence.** The run conductor starts the dungeon **without** `persistent: true`, so on leaving
the mode the scene is *removed* (not slept) and rebuilt fresh next time — every dungeon entry starts
clean. (The space map, by contrast, is persistent and slept.)

---

## 5. Coordinate systems

Four coordinate spaces coexist; mixing them up is the easiest way to introduce bugs.

| Space | Unit | Origin / range | Produced by |
|---|---|---|---|
| **Dungeon grid** | tile (col `x`, row `y`) | `0..width+1` incl. the empty border frame the factory adds | `PixelDungeonFactory` / `TDungeonTile` |
| **rex Board cell** | tile `(x, y, z)` | same grid; `z` is a *layer*: `'objects'`/`'walls'` for tiles, `1` for mobs | `PixelDungeonBoard` |
| **Tilemap tile** | tile | same grid; backs the visual layers | `Phaser.Tilemaps.Tilemap` |
| **World** | pixel | `tile * 16` (tile size from the tileset) | `tileToWorldXY` / `getTileAtWorldXY` |

The **board's `z` is a discriminator, not a height**: walls live at `z = 'walls'`, doors/junctions at
`z = 'objects'`, and *all mobs* at `z = 1`. `getMobAt(tile)` reads `z = 1`; `getTile(tile)` reads
`z = 'objects'`. Input arrives in world px (`pointer.worldX/worldY`), is converted to a tile via the
tilemap (`getTileAtWorldXY`), and movement/vision/pathfinding all then operate in board-tile space.

---

## 6. Dungeon generation (`dungeon/pixel-dungeon.factory.ts`)

A seeded, deterministic **Rooms-and-Mazes** carve (after Bob Nystrom's
[hauberk](https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/)), driven by `NPRng` so a
given `seed` always produces the same grid. The grid must be odd-sized (enforced) so rooms and maze
corridors align on the same parity.

`generate(options)` runs these passes over a solid wall grid:

1. **`#addRooms`** — place random odd-sized rectangular rooms until either `roomTries` runs out or the
   target `roomArea` percentage is covered; discard overlaps; each placed room gets a fresh *region* id.
2. **`#addHallways`** — flood the leftover wall space with a *growing-tree* maze; `straightenPercentage`
   biases toward continuing in the last direction (straighter corridors). Each maze is its own region.
3. **`#addJunctions`** — find every wall cell that borders ≥2 distinct regions ("connectors"); repeatedly
   carve one connector per merge until all regions are joined into one; `extraConnectorChance` sprinkles a
   few redundant doors so the dungeon isn't singly-connected (creates loops).
4. **`#removeDeadEnds`** — iteratively fill any corridor tile with exactly one exit, until none remain.
5. **`#removeFullWalls`** — turn walls entirely surrounded by walls/empty into `none` (carves open caverns).
6. **`#addEmptyFrame`** — wrap the whole grid in a one-tile `none` border (so edge tiles always have
   neighbours to test against during rendering).

Output: `TDungeonTile[][]` where each tile carries `{ type, x, y, region }`.
`pixel-dungeon.factory.spec.ts` locks in the invariants: odd-size rejection, the border frame,
seed determinism, **single fully-connected walkable area**, and **no dead-end corridors**.

`PixelDungeon` (`dungeon/pixel-dungeon.ts`) then walks that grid once (`#mapDungeon`) and groups tiles
into the higher-level **part objects**:

- `PixelDungeonFloor` (room floor vs hallway floor), `PixelDungeonWall`, `PixelDungeonJunction` (a door)
- `PixelDungeonRoom` / `PixelDungeonHallway` — region-keyed collections of tiles
- `#addStructure` wires each room's bordering junctions and flags single-door rooms.

---

## 7. Tile rendering (`map/`)

`PixelDungeonMap` creates a blank `Phaser.Tilemaps.Tilemap` and four layers, each a thin
`PixelDungeonTilelayer` wrapper:

- **`floors`** — the room/hallway floor under everything (interactive: hand cursor).
- **`walls`** — wall tops/sides.
- **`objects`** — doors/junctions.
- **`stitches`** (depth 10) — a one-row "roof lip" drawn *above* walls/doors for visual polish.

Each `PixelDungeonTile.addToLevel(map, board)` both **places itself on the board** (as a blocker for
walls, a non-blocker for doors) **and** asks the relevant layer to paint the right tile. The wall and
junction parts pick their tile index by inspecting neighbours (`wallTo`, `floorTo`, `emptyTo`,
`junctionTo`) — e.g. a wall with a room to its south renders `WALL_TOP`, with empty to its south
renders `WALL_TOP_OUTER`, with a junction to its south renders `WALL_TOP_JUNCTION`, etc.

### The tileset mapping is data-driven

The semantic **role → tile-index** map is *not* hand-maintained in code. It is parsed at runtime from
the Tiled tileset export `src/assets/PixelDungeon.tsj` (the single source of truth):

- `PixelDungeonTileset.preloadDefinition(scene)` queues the `.tsj` JSON during `preload`.
- `PixelDungeonTileset.applyDefinition(scene)` parses it during `create` (idempotent via a module flag).
- `parseTilesetMapping` inverts the tile-keyed `.tsj` (id → role(s) + probability) into the role-keyed
  `NPTilesetMappingNew`. A tile may carry several roles via a comma-separated `roles` property; a role
  backed by several tiles becomes a **weighted set** (placed with `weightedRandomize` for variety),
  a single-tile role becomes a **bare index** (placed with `putTileAt`).
- It throws if `PixelDungeon.tsj` is missing any required role. `pixel-dungeon-tileset.spec.ts` covers
  this parsing against the real asset.

---

## 8. The turn engine (`engine/`) — the heart of the mode

`PixelDungeonEngine extends StateManager` (rex). It owns the player, the mob list (player is
`mobs[0]`), the level, and the pathfinder, and runs a three-state machine:

```
StartGame ──▶ HandleAction ──▶ (EndGame)
                  ▲   │
                  └───┘  loops on itself while an action is mid-animation
```

`StartGameState` and `EndGameState` are currently near-stubs; **`HandleActionState` is where the game
actually lives**. Its `next()` implements the energy economy:

### Energy economy

- Every mob has an energy pool (`MobAction`, `traits/mob-action.ts`) starting at 0.
- Each "pump", a mob gains `options.energyGain` (player 100, enemy 50, default 25).
- A mob `canAct()` once energy ≥ `FULL_ENERGY` (100); performing an action `drainEnergy(costs)`
  (default `costs = 100`).

So a player (gain 100) acts every pump; an enemy (gain 50) acts every other pump → the player moves at
roughly 2× enemy speed. Tuning these gains is the per-mob speed knob.

### The `HandleActionState.next()` loop

```
loop forever:
  # 1. pump energy until at least one mob can act
  while no mob is ready:
      engine.gainEnergy()                  # add energyGain to every mob
      ready = mobs.filter(canAct)
      if the player just became ready: engine.startTurn()   # opens doors under mobs

  # 2. drain the ready set, one action at a time
  while ready is non-empty:
      mob = ready.shift()
      action = mob.action ?? waitForInput  # player with no queued action blocks here
      if action.perform():                 # true = finished (instant, or animation done)
          action.finish()                  # drain energy, clear the queued action; take next mob
      else:                                 # false = still animating
          ready.unshift(mob)               # put it back
          return HandleAction               # YIELD this frame; resume next update
```

The key idea: **`perform()` is polled every frame and returns `false` until its animation completes**.
When a mob is mid-move/mid-attack, the state returns `HandleAction`, the StateManager re-enters
`next()` next frame, and the same mob is re-polled — so one animated action holds the turn until it
finishes, then the loop continues draining the rest of the ready mobs before pumping again.

> Caveat: the inner "pump until someone is ready" loop has no yield. If every mob's `energyGain` were
> 0 it would spin forever. With the current values it always terminates, but it's a latent footgun.

### The action contract (`engine/states/handle-action.state.ts`)

```ts
interface PixelDungeonAction { mob; costs; perform(): boolean; finish(): void; }
```

| Action | `perform()` returns | What it does |
|---|---|---|
| `WalkToAction` | `true` once `!mob.movement.isMoving` | rex `MoveTo` to one adjacent tile (one tween) |
| `WarpAction` | `true` immediately | teleport (used by off-screen enemies; no tween) |
| `AttackMobAction` | `true` on tween `onComplete` | lunge tween (yoyo) toward target; shows `"3"` text |
| `RestAction` | `true` immediately | no-op (skip turn) |
| `WaitForInputAction` | always `false` | blocks the player's slot until input queues a real action |

`finish()` (base) drains `costs` energy and clears the mob's queued action.

---

## 9. Mobs and traits (`sprites/`)

`PixelDungeonMob extends PixelDungeonLPCSprite` and composes **three orthogonal traits**, created in
`mob.create()`:

- **`MobMovement` (`traits/mob-movement.ts`)** — `extends` rex board `MoveTo`. Grid-step movement,
  a queued path (`setPath`/`nextMove`/`hasMoves`), `warp`, and `moveToTile` (which also kicks the walk
  animation, faces the move direction, and triggers a FOV refresh). Its `update` override completes the
  move early when the sprite reaches the target pixel.
- **`MobVision` (`traits/mob-vision.ts`)** — `extends` rex `FieldOfView`. Maintains `currentView`
  (visible tiles incl. self), `canSee(tile)`, and `faceDirection`. Runs with `blockerTest: true`
  (walls block) and a configurable cone.
- **`MobAction` (`traits/mob-action.ts`)** — the energy pool + the single queued "next action".

`mob.action` is a getter that returns the queued action; subclasses override it to *decide* an action
lazily when polled:

- **`PixelDungeonPlayer`** — on poll, if it has a queued path it pops the next step into a
  `WalkToAction`. Clicking a tile (handled in the scene) either pathfinds there (`movePlayer` →
  `pathfinder.findPath` → `movement.moveOnPath`) or, if the clicked tile holds a mob, queues an
  `AttackMobAction` when adjacent.
- **`PixelDungeonEnemy`** — on poll, `#aiAction` decides: attack the player if adjacent; else pick a
  random adjacent empty tile and `WalkToAction` toward it (or `WarpAction` if neither the enemy's
  current nor target tile is in the player's view); else `RestAction`.

### Vision flow

`engine.updateFoV()` is the single entry point: lose vision on the old `currentView`, recompute the
player's FOV (`player.lookAround()`), gain vision on the new view, and set each mob's alpha by whether
the player `canSee` it. Tile visibility is shown by **alpha** (1 = lit, 0.5 = dimmed/remembered), not
by hiding tiles. It's called on scene create and after every mob move.

---

## 10. App integration

The app never imports engine internals — it builds a `PixelDungeonScene` with an `onResult` callback
and hands it to the stage:

```ts
// RunConductorService#showDungeon
const scene = new PixelDungeonScene({ onResult: result => this.#onModeResult(result) });
this.#stage.startScene({ key: PixelDungeonScene.key, scene });
```

`onResult` reports a typed `DungeonResult` (`@shared/np-state`) back to the run FSM, which then
transitions back to the `sector` (map) phase. Today the only exit is the **`M` key**, which reports a
stubbed `{ kind: 'dungeon', outcome: 'failed' }` — the real objective-driven exit is a later phase.

---

## 11. Testing

- `pixel-dungeon.factory.spec.ts` — generation invariants (odd-size, frame, determinism, single
  connected walkable area, no dead ends). Pure, headless, fast.
- `pixel-dungeon-tileset.spec.ts` — `parseTilesetMapping` against the real `PixelDungeon.tsj`.

Run with `npx nx test np-pixel-dungeon`. The simulation layer (energy loop, actions, pathfinding,
spawn placement) is **not** yet covered.

---

## 12. Known gaps

Honest list of what's stubbed or fragile, for anyone polishing the mode. (Field-of-view/PoV is
working in the current build and is intentionally **not** listed here.)

- **No health/damage/death model.** `AttackMobAction` only tweens and prints `"3"`; mobs have no HP,
  nothing dies, the `die` animation never plays. Combat is currently cosmetic.
- **No win/lose condition.** `EndGameState` loops on itself; the only exit is the debug `M` key, which
  always reports `failed`.
- **The dungeon seed is hard-coded** (`PixelDungeonEngine.#setup` uses `seed: '<#.#>'`), so every run
  generates the *identical* layout. Difficulty/size/spawns are also hard-coded and ignore the central
  `@shared/np-state` `Balance` curve other modes feed from.
- **Spawn placement is unchecked.** Mobs are placed in a vertical line up from one room corner
  (`start.y - i`) with no walkability/occupancy guard.
- **Enemy AI is placeholder** — adjacent-attack or random-walk/warp; never hunts or paths toward the
  player (the pathfinder is used only for player clicks).
- **Engine is hard-wired** — mobs and the level are constructed directly in the engine; there's no
  spawn/factory seam and no event bus for death / level-complete / player-spotted.
- **Debug noise** — `console.log`s across the scene, engine, traits, and dungeon; floating `"mov"`/`"!"`
  texts on movement; a broken cursor-anchored wheel-zoom (`// TODO not working`).

See the code review notes that accompany this doc for the line-level findings.
