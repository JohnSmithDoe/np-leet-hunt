# np-pixel-dungeon — Review & RPG Roadmap

A definitive review of the `@shared/np-pixel-dungeon` mode and the path to grow it into a "Shattered Pixel Dungeon light." The good news up front: the **boundaries are clean and the seams are real** — trait composition, a polymorphic action contract, a Phaser-free generation model, and a typed mode contract are all in place. The bad news: **almost nothing RPG-shaped is filled in** — there is no HP, no items, no death, no events, no spawn data, and the launch/result round-trip is half-wired. The work ahead is mostly _new internal structure hung off existing stubs_, not rewrites.

---

## How it works

End-to-end, a dungeon excursion flows through six stages.

**1. Launch (app → scene).** `RunConductorService` is the sole composition root and the only caller of `StageService.startScene` (`apps/np-leet-hunt/src/app/run/run-conductor.service.ts`). When the FSM enters `dungeon`, `#showDungeon` (`:227-235`) builds a `PixelDungeonScene` with a plain `TPixelDungeonSceneConfig { petClass?, onResult? }` and starts it **without** `persistent: true`, so `StageService` rebuilds the scene fresh on every entry (the space scenes, by contrast, are slept/woken). Critically, `#showDungeon` **ignores `#pendingLaunch`** — so `DungeonLaunch.objective` (`retrieve|sabotage|hunt`, `libs/np-state/src/lib/mode/mode-contract.ts`) never reaches the scene. `#showDuel` (`:201-224`) _does_ read its launch; the dungeon path was never finished.

**2. Boot (scene → engine).** `PixelDungeonScene extends NPScene` but bypasses the `NPScene` component model: `setupComponents()` just news up a `PixelDungeonEngine(this)` and forwards `preload()`/`create()` to it (`pixel-dungeon.scene.ts:35-51`). The engine owns everything. `src/index.ts` re-exports only the scene — the app codes purely against the config + `DungeonResult`.

**3. Generation (Phaser-free).** `PixelDungeonEngine.#setup()` hard-codes `{ height: 25, width: 25, seed: '<#.#>' }` (`pixel-dungeon.engine.ts:27-36`), so **every run is the identical layout**. `PixelDungeonFactory.generate()` runs a faithful Bob-Nystrom rooms-and-mazes carve over a solid-wall `TDungeonTile[][]`: `#addRooms → #addHallways → #addJunctions → #removeDeadEnds → #removeFullWalls → #addEmptyFrame` (`pixel-dungeon.factory.ts:64-74`), seeded deterministically via `NPRng`. `new PixelDungeon(options)` then runs `#mapDungeon()` (buckets each tile into `PixelDungeonRoom`/`Hallway`/`Wall`/`Junction`/`Floor` part objects) and `#addStructure()` (wires junctions to rooms, auto-opens single-door rooms) in its constructor (`pixel-dungeon.ts:34-48`).

**4. Binding (model → render → sim).** `PixelDungeonLevel` is the single façade the engine talks to. In `create()` it iterates `dungeon.all` calling each part's `addToLevel(map, board)` (`pixel-dungeon.level.ts:45-50`), which both paints a Phaser tilemap layer **and** registers the part on a rex `Board`. The board uses three concurrent representations: the pure grid, four flat tilemap layers (`floors`/`walls`/`objects`/`stitches`, `pixel-dungeon.map.ts:50-61`), and a rex `Board` overlay. The board's `z` axis is overloaded as a **category discriminator** — walls at `z='walls'`, doors at `z='objects'`, all mobs at `z=1` — not a height. The role→tile-index map is parsed at runtime from a Tiled export (`PixelDungeon.tsj`), so re-skinning is a pure asset edit.

**5. Turn loop (the heart).** `PixelDungeonEngine extends rex StateManager` and runs a three-state FSM: `StartGame → HandleAction → EndGame` (`engine/states/`). Essentially all logic is in one method, `HandleActionState.next()` (`handle-action.state.ts:125-162`), a classic energy economy:

```
loop forever:
  while no mob is ready:                       # pump
      engine.gainEnergy()                       # +energyGain to every mob
      ready = mobs where activity.canAct()      # energy ≥ FULL_ENERGY (100)
      if player just became ready: startTurn()  # opens doors under mobs
  mob = ready.shift()                            # drain one mob
  action = mob.action ?? waitForInputAction      # lazy, polymorphic getter
  if action.perform():                           # true = instant / tween done
      action.finish()                            # drain energy, clear queued action
      continue
  else:
      ready.unshift(mob); return HandleAction    # yield the frame, resume next tick
```

Player speed is pure data: player `energyGain: 100` acts every pump, enemy `50` every other pump (`player.ts:37`, `enemy.ts:22`). A 10,000-iteration guard throws on a misconfigured `energyGain: 0`. **`EndGameState` is dead code** — it self-loops (`next = States.EndGame`) and nothing ever calls `goto(States.EndGame)`; the only exit is the scene's debug `M` key calling `onResult({ kind:'dungeon', outcome:'failed' })` directly, bypassing the FSM (`pixel-dungeon.scene.ts:114`).

**6. Actors & AI.** A shallow hierarchy `NPSprite → PixelDungeonLPCSprite → PixelDungeonMob → {Player, Enemy}`. A mob is a composition of three orthogonal traits built in `create()` (not the constructor, because they need the mob on the board first): `MobMovement` (rex `MoveTo`), `MobVision` (rex `FieldOfView`, per-mob cone), `MobAction` (energy pool + one queued action). Decision-making lives in the polymorphic `action` getter: the **player** getter pops the next path step into a `WalkToAction` (`player.ts:47-53`); the **enemy** getter runs `#aiAction()` as a _side effect of a property read_ (`enemy.ts:33-60`) — attack-if-adjacent, else random adjacent step, else rest. Enemies never use the pathfinder (it's hard-bound to `engine.player`, `pixel-dungeon.pathfinder.ts:14`) and borrow the _player's_ vision, not their own (`enemy.ts:54`).

**Combat is cosmetic.** `AttackMobAction` tweens a lunge and on contact calls `target.info('3', LoseHealth)` — a literal `'3'` floating text (`handle-action.state.ts:53-54`). There is **no HP, no damage math, no death** anywhere in the lib (grep-confirmed). The `die` LPC animation exists but is unreachable.

---

## What's good

**Clean layering, enforced by types.** np-state depends only on np-config; the `GameState` interface and `ModeLaunch`/`ModeResult` contract keep modes Angular/RxJS-free while the conductor is the single FSM↔Phaser coupling point. State flows _down_ by injection, control flows _up_ via the FSM. This is exactly the layering an RPG wants (rules→lib, data→np-config, state→np-state, glue→app).

**The standout seams** (these are where features attach with little friction):

| Seam                                     | Where                                                                                                  | Why it's good                                                                                                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Action contract**                      | `PixelDungeonBaseAction { mob, costs, perform(): boolean, finish() }` (`handle-action.state.ts:12-32`) | New verbs (PickUp, UseItem, OpenChest, Throw, Cast, Descend) are one subclass each, **zero turn-loop changes**. Handles instant _and_ multi-frame-animated actions via one poll protocol. The best seam in the codebase. |
| **Trait composition**                    | `MobMovement`/`MobVision`/`MobAction` built in `mob.create()`, exposed via getters (`mob.ts:54-97`)    | A 4th concern (`MobHealth`, `MobCombat`, `MobBrain`) follows an obvious, established pattern.                                                                                                                            |
| **Lazy `action` getter**                 | overridden per subclass (`player.ts:47`, `enemy.ts:33`)                                                | Scheduler stays dumb; each mob computes its next move against the freshest world state. Richer AI is a getter override, not a loop edit.                                                                                 |
| **`PixelDungeonLevel` façade**           | `pixel-dungeon.level.ts:73-126`                                                                        | The engine never touches rex internals or `tileXYZToChess` directly. New board queries (`getItemAt`, `getFeatureAt`) attach here without leaking rex.                                                                    |
| **Polymorphic `addToLevel(map, board)`** | `pixel-dungeon.tile.ts:19`                                                                             | A new visual tile category is "subclass `PixelDungeonTile`, implement `addToLevel`" + one `case` in `#mapDungeon`. Self-registers on both render and board.                                                              |
| **Energy economy**                       | `mob-action.ts`, per-mob `energyGain` + per-action `costs`                                             | Haste/slow/fast/slow mobs are _data_, not control flow — the genre-correct foundation.                                                                                                                                   |

**Phaser-free, deterministic, testable generation.** `PixelDungeonFactory` + the `TDungeonTile` grid have zero rendering coupling, so `factory.spec.ts` runs headless and fast, and a given seed reproduces an identical dungeon (proven by test). Connectivity is provably correct (union-find merge → single component) and tunable (`extraConnectorChance` adds loops). This is the single most valuable property for adding and testing generated content.

**Structurally rich part objects.** `PixelDungeonRoom` already knows its `region`, `junctions`, corners, and sorted `tiles`; single-door rooms are already detected (`pixel-dungeon.ts:44`) — the seed of "dead-end room ⇒ treasure room." `PixelDungeonJunction` already has a `setOpen` state machine and knows the `regions` it connects.

**Data-driven art + a ready feedback channel.** The role→index map is parsed from `PixelDungeon.tsj` with weighted variety and a fail-loud required-role check; re-skinning needs no code. `EMobInfoType` (`GainHealth/LoseHealth/Blocked/Doged`) and `PixelDungeonInfoText` are a finished floating-combat-text channel anticipating heal/block/dodge the moment real combat exists.

**The mode boundary is symmetric and forward-looking.** `(config in) → (typed result out)`, identical to the duel. `DungeonResult.loot?`, `DungeonObjective`, `isModeSuccess`, and the `RunStateStore` (`items: string[]`, `flags`, `crew`, clamped `resources {hull,heart,marbles}`, versioned `SaveFile` with `migrate()`) all already model the _shape_ of RPG run state. The FSM table already permits `dungeon → ending` (lethal path) and entry from both `sector` and `event`.

---

## What's weak / risky

Ordered by how much each blocks RPG growth.

1. **No domain model for combat/HP/death — the single biggest blocker.** Mobs have no HP, attack, defense, level, or status. `AttackMobAction` prints `'3'` and `finish()` never touches a hit point. There is no `Combat.resolve()`, no death, no removal from `engine.mobs`. Everything downstream (mini-bosses, traps that hurt, fleeing AI, loot-on-death) starts from zero.

2. **The engine is hard-wired with no spawn/data seam.** `#setup()` constructs a literal seed + 1 brawler + 3 skeletons inline (`engine.ts:27-36`); there is no mob factory, no bestiary, no item registry, no `Balance.dungeon*()` input. Mobs/items/rooms have **nowhere to be defined**. You'd be editing `#setup` for every monster.

3. **No event bus.** The `StateManager` is built with `eventEmitter: false` (`engine.ts:23`). Death, player-spotted, pickup, tile-entered, level-complete, trap-triggered all have nowhere to fire. The only cross-cutting signal is the hard-coded `engine.onMobMoved(mob)` call buried inside `MobMovement.moveToTile`. HUD/quest/objective tracking and alert propagation will be bolted on ad hoc without one.

4. **The launch/result round-trip is half-wired and the FSM doesn't own game-over.** `#showDungeon` drops `#pendingLaunch`; `petClass` is carried but never read; `#onModeResult`'s dungeon branch is a no-op return-to-map; `loot` is never populated; the only exit is the `M`-key stub that always reports `failed`. `EndGameState` is dead code.

5. **No item/entity layer on the board.** All mobs share `z=1`; floor tiles aren't registered as chess at all. Dropped loot, chests, keys-in-locks, traps, stairs have no representation, and the z-band literals (`'walls'`/`'objects'`/`1`) are scattered across five files with no central registry — a coordination hazard the moment a new layer lands.

6. **Walkability is implicit, and `getTile` is a latent trap.** "Is this tile floor?" is answered by _absence of a rex blocker flag_, not a query. `PixelDungeonBoard.getTile` reads only `z='objects'`, so it **silently never returns walls** (`pixel-dungeon-board.ts:36`) — any future "what's at this tile" lookup that trusts it will miss walls and items. The method name oversells it.

7. **Enemy AI is a placeholder with three structural flaws.** It (a) never pathfinds (the rex `PathFinder` is hard-bound to the player), (b) borrows the _player's_ vision instead of its own, and (c) **mutates state inside a property-read getter** (`enemy.action → #aiAction`), which only works because the loop polls it exactly once per turn. There's no behaviour state (sleep/wander/hunt/flee), no memory, and no `Balance.dungeonAiParams` analogue to the existing `DuelAiParams`.

8. **No tile metadata / room-role channel.** `TDungeonTile` is `{type, x, y, region}` and `ETileType` is a closed 5-value enum. No per-tile contents, trap, lighting, or "discovered" flag; no room _kind_. Spawn/start is `rooms[0]` (insertion order, nothing semantic). The carve discards its own region-graph (`merged` map is method-local in `#addJunctions`), so solvable key/lock placement must reconstruct it.

9. **Death-during-animation desync (latent, will bite the moment combat lands).** `HandleActionState.#mobs` (the ready set, drained by `shift`) is a _separate array_ from `engine.mobs`. A target killed mid-lunge, or a dead mob still in the ready set, will NPE — killing a mob must scrub _both_ lists and null-guard the action target.

10. **No tests over the simulation.** ARCHITECTURE.md §11/§12 confirm the energy loop, actions, pathfinding, and spawn placement are untested — the exact code RPG features will pile onto has no regression net. Plus minor debt: `EMobInfoType.Doged` typo, the dual world↔tile conversion (tilemap in `level`, board in pathfinder), the global single tileset mapping + `definitionApplied` module flag (blocks multi-biome), and `pathfinder occupiedTest:true` vs `movement occupiedTest:false`.

---

## Foundations to lay first

Five cross-cutting pieces unlock _multiple_ features each. Land these (or at least their slices) before feature work, roughly in this order.

### F1 — Finish the launch/result round-trip & make the FSM own game-over `[S]`

**Why first:** it's small, it's the prerequisite for _every_ feature that needs to be parameterised by depth/objective or that returns rewards, and it removes the dead-code/debug-exit liability.

- Read `#pendingLaunch` in `#showDungeon` (mirror `#showDuel`); widen `TPixelDungeonSceneConfig` to carry `objective`/`seed`/`depth` and pass them into the engine ctor so `#setup` stops using literals.
- Wire `EndGameState` to actually call `onResult` with `completed/failed/loot`; drive `goto(States.EndGame)` from inside the loop. Demote the `M` key to a fallback.
- Make `#onModeResult`'s dungeon branch consume `loot` (`run.grantItem`) and apply the legal `dungeon → ending` transition on lethal failure.

### F2 — A minimal `MobHealth`/`MobCombat` trait + pure `resolveDamage()` `[M]`

**Why:** combat, death, mini-bosses, traps-that-hurt, and flee-AI all read HP. Add the **4th trait** following the existing three; put the pure damage formula (`attack − defense, min 1`) in `libs/np-pixel-dungeon/src/lib/engine/combat.ts` (mode rules, headless-testable like `factory.spec.ts`), and the _numbers_ in np-config. Route `AttackMobAction.onContact` through it; add `engine.killMob()` (scrub **both** `engine.mobs` and the ready set, play `die`) + `level.removeMob()`. This is the precedent every other system reuses.

### F3 — A spawn factory + declarative content tables in np-config `[M]`

**Why:** kills the hard-wired roster (blocker #2) and gives mobs/items/rooms a _place to be defined_. Add `MobFactory.spawn(engine, archetype, def)` replacing the inline loop; add `BESTIARY`, `ITEMS`, and `Balance.dungeon*(sectorNumber)` resolvers to np-config (mirroring `DUEL_*` tables + `duelRows`/`duelAiParams`, which return fresh copies). This is the "balance is central / data in np-config" rule applied — and it's what makes floors scale by depth.

### F4 — Centralise the board z-layer convention + a single authoritative tile-query API `[S]`

**Why:** unblocks items, traps, and features without the scattered-literal collision hazard. Land a `ChessLayer` const/enum in `@types/pixel-dungeon.types.ts` (`walls|objects|items|features|mob=1`), migrate the existing literals to it, and add **distinct** `level.getItemAt`/`getFeatureAt` methods (do _not_ overload the already-broken `getTile`). Generalise `getTile` into explicit `getObjectAt`/`getFeatureAt` keyed by z-band.

### F5 — A lightweight engine event bus + an explicit `decide()` `[S]`

**Why:** traps, pickups, special-room triggers, spotted-player stings, objective tracking, and AI alert-propagation all need to _observe_ in-dungeon events; today only `onResult` (terminal) and the buried `onMobMoved` exist. Add a minimal emitter on the engine. Simultaneously, move enemy decision-making out of the side-effecting `action` getter into an explicit `enemy.decide()` the engine calls in `startTurn()` — removes the mutation-on-read trap and is a prerequisite for any non-trivial AI. Also add a per-step `engine.onMobEntered(mob, tile)` hook (sibling to `onMobMoved`) that asks the level for a feature and fires its `onEnter` — the trigger mechanism for traps, stairs, and auto-pickup.

> **Note on overlap:** F2's `MobHealth` is _the_ shared dependency between Combat, NPCs/mini-bosses, and Flee-AI. F3's content tables are shared by Items, Combat, NPCs, and AI variety. Build them once, here, not per-cluster.

---

## RPG feature roadmap

Five clusters. Each reuses the foundations above; overlaps are reconciled so a type/seam is built once.

### A. Items, inventory, keys & potions — `[M]`

**Approach.** Three layers on existing seams, with a shippable thin slice (gather a marble → leave → marble count rises).

- **DATA (np-config):** `ITEMS: Record<string, ItemDef>` with `EItemKind` (`coin|potion|scroll|key|food`), a `tilesetRole`, a _primitive_ `ItemEffect` (`{ resources?: ResourceDelta, heal?: number }` — no engine deps), and `Balance.dungeonLoot(sectorNumber)`.
- **RULES + transient entities (np-pixel-dungeon):** `PixelDungeonItem extends NPSprite` on a new `z='items'` band (non-blocker), `PickUpAction`/`UseItemAction`/`ThrowItemAction` as new verbs, `level.getItemAt/removeItem`. Floor items are scene-scoped and never leak into np-state.
- **STATE (np-state):** kept loot rides the _existing_ inventory (`grantItem`/`takeItem`, marbles via `adjustResources`). A richer in-dungeon `Inventory` class (quantities/slots/charges) is deliberate phase-2 — do **not** fatten the flat `string[]` for keys/flags.

**Key new types:** `item.model.ts` (`EItemKind`, `ItemDef`, `ItemEffect`), `items.ts` (`ITEMS`), `pixel-dungeon.item.ts`, `PickUpAction`, `ChessLayer` const (= F4).
**Touch-points:** `engine.#setup` (item-spawn pass via `spawnTiles`), `MobMovement.moveToTile`/`onMobEntered` (auto-pickup trigger, F5), `#onModeResult` (sum coin values → `adjustResources({marbles})`).
**Thin slice → full:** (1) catalog + `COIN` role in `.tsj`/`REQUIRED_ROLES`; (2) item entity + z-band + level queries; (3) spawn N coins on room floors; (4) auto-pickup-on-enter + floater; (5) report `loot` on exit, grant in `#onModeResult` _(slice done — marbles visibly rise)_; (6) replace hard count with `Balance.dungeonLoot`; (7) `UseItemAction` (HEART/HULL effects via injected `GameState`) + key/locked-junction; (8) optional in-dungeon `Inventory`.
**Risks:** z-literal collision (mitigated by F4); items must be transient (handed back via `DungeonResult` before the scene dies); potions that heal a _mob's HP_ depend on F2 — scope phase-1 potions to resource meters only.

### B. Equipment & combat stats — `[L]`

**Approach.** Make combat real by extending F2's trait with equipment and resolving damage at `AttackMobAction.onContact`. Numbers declarative; math in the mode lib.

- **np-config:** `MobStatBlock`, `DungeonCombatParams`, `EItemSlot` (`weapon|armor|trinket`), `ItemDef.mods`/`upgrade`; tables `MOB_STATS`/`ITEMS`/`DUNGEON_COMBAT`; resolvers `Balance.mobStats(archetype, depth)`/`item(id)`/`dungeonCombatParams(depth)`.
- **np-pixel-dungeon:** extend `MobCombat` to hold `equipped: Partial<Record<EItemSlot, ItemDef>>` and fold base + mods + enchant in the `attack`/`defense`/`maxHp` getters; `resolveDamage()` reads the folded getters so the formula never changes as equipment grows.
- **np-state:** carried/equipped item _ids_ on the existing inventory; `DungeonLaunch` gains `depth?`/`equippedItemIds?`.

**Thin slice → full:** (1) HP + flat attack/defense + `resolveDamage` + a death that removes from both lists _(combat is now real)_; (2) player death → `EndGame`, all-enemies-dead → `completed`; (3) `EItemSlot` + the modifier fold + `startingEquipment`; (4) inject equipped ids from the run via `#showDungeon`; (5) depth-scaling + an enchant hook.
**Risks (highest in the roadmap):** the **death-during-animation / ready-set desync** (blocker #9) — `killMob` must scrub `engine.mobs` _and_ `HandleActionState.#mobs` and guard `perform()`/`finish()` against a dead target; `level.removeMob` must clear the `z=1` chess or the corpse's tile stays blocked for A*; reaching `EndGame` before the next pump (10k guard); keep combat *math\* in the mode lib, numbers in np-config — mirror the `ParadroidAi`-vs-`DuelAiParams` split exactly.

### C. World content & traps (rooms, stairs, special spaces) — `[L]`

**Approach.** A **post-carve decorator**, not a 6th carve pass. Keep `TDungeonTile` at 5 types; tag rooms and place features _after_ `#mapDungeon`, where `#addStructure` already iterates rooms. Model traps/chests/stairs/keys as **feature entities** on a `z='features'` band (rendered on the existing `objects` layer via `addToLevel`), each choosing its own blocker. Make the **junction** the home for the locked-door state machine: `#open:boolean` → `EDoorState (open|closed|locked)` + `keyId`, with `setBlocker(state===locked)` so rex A\* routes around it automatically. Trigger-on-step reuses F5's `onMobEntered`.

- **np-pixel-dungeon:** `PixelDungeonFeature` base + `Stairs/Trap/Chest/Key` subclasses; `PixelDungeonDecorator.decorate(dungeon, plan, rng)` (deterministic, seeded from the dungeon seed, headless-testable); `dungeon-graph.ts` reconstructing room-adjacency from `junction.regions` (the data the factory discards) so a locked door's key is placed _solvably_ (reachable without crossing its own door); enums `ERoomKind`/`EDoorState`/`EFeatureKind` as rule vocabulary in `@types`.
- **np-config:** `DungeonPlan` (room-archetype budget, trap density, lock count, size/seed per depth), `TrapDef`, `ChestDef`/loot table, `Balance.dungeonPlan(sectorNumber)`.

**Thin slice → full:** (0) entrance/exit stairs + a real objective-driven exit (one `STAIRS_DOWN` role, no combat dependency) — proves the decorator, the feature z-layer, `onMobEntered`, and the launch/result round-trip end to end, _and kills dead `EndGameState`_; (1) traps as non-damaging features (reveal/displace) — ship before combat; (2) special rooms (treasure/shop/vault/boss) via the adjacency graph; (3) locked doors + solvable keys; (4) descend-to-deeper-floor + objective payoff.
**Risks:** the autotiler **throws** on unmatched neighbour patterns — _features on a separate layer over unchanged floor_ avoid teaching every `wallTo/floorTo` predicate (the whole reason not to extend `ETileType`); a locked door makes the player pathfinder report "no path" — `movePlayer` must surface "locked" rather than silently no-op; the decorator **must** draw from the factory's seed or the reproducibility invariant breaks; `REQUIRED_ROLES` throws on missing art, so `.tsj` + code land together.

### D. NPCs & economy (traders, blacksmiths, mini-bosses) — `[L]`

**Approach.** Friendly/boss actors are just `PixelDungeonMob` subclasses with a different `action` getter — no new trait. A merchant's getter always returns `RestAction` (stationary). The trade/upgrade flow **reuses the existing in-Phaser `PlaceholderScene` shape** (title + lines + action buttons + `onSelect`) — **no Angular HUD for v1** — launched _parallel and paused over_ the dungeon (NOT via `startScene`, which would remove the non-persistent dungeon). Gold is `resources.marbles` (already clamped). Mini-bosses are a high-HP `PixelDungeonEnemy` config in a decorator-tagged boss room — they depend on **F2**.

- **np-config:** `MerchantDef`/`ShopItemDef`/`BossDef` tables; `Balance.dungeonParams(sectorNumber)` (bossHp, reward marbles, costs).
- **np-pixel-dungeon:** `PixelDungeonMerchant`, `PixelDungeonBoss`, `TalkToMerchantAction`; room-role tagging in `#addStructure` (farthest room = boss, single-door dead-end = shop); `level.bossSpot()/merchantSpots()`; `movePlayer` disambiguation (merchant tile → talk, not attack).
- **np-state:** `DungeonResult.rewardMarbles?`; apply via `grantItem`/`adjustResources`/`setFlag`.

**Thin slice → full:** (0) one stationary merchant + an in-Phaser trade dialog wired to the injected `GameState` (buy = spend marbles, gain item/heal) — proves the friendly-actor seam + economy with _zero combat code_; (1) make gold round-trip via `DungeonResult.rewardMarbles`; (2) thread launch config; (3) **F2** HP/death; (4) room roles + boss (objective `hunt` completes on boss death); (5) blacksmith/quest-giver as _data_ variants of the same merchant; (6) optional Angular overlay if richer layout needed.
**Risks:** the dialog must genuinely **halt the turn loop** (pause the scene / gate `next()`), not just overlay — the dungeon stays up unlike duel/event modes; camera/input contention — launch as a paused-over scene or in-scene container, never via `startScene`; model v1 upgrades as run **flags**, not structured items, to avoid prematurely inventing an item-instance model; keep reward/cost numbers in `Balance.dungeonParams` (shared `marbles` economy).

### E. Mob AI & enemy variety — `[L]`

**Approach.** Mirror the proven `ParadroidAi` architecture exactly. A **4th trait `MobBrain`** owns behaviour state (`EBehaviourState: Sleeping/Wandering/Hunting/Fleeing` + `#lastSeenPlayerTile`, `#turnsSinceSeen`) and a pure `decide(observation): TAiIntent` core seeded by `NPRng` (headless-testable, the `ParadroidAi.decide` analogue). The enemy translates intents into existing actions + a new `RangedAttackAction`. Reuse mechanisms, don't rewrite: query the mob's **own** vision; reuse the single rex `PathFinder` by **re-rooting** (`level.findPathFor(mob, target)` → `setChess(mob)` then `findPath`) so enemies _hunt_ via `movement.moveOnPath`.

- **np-config:** `BESTIARY` (sheet key, energyGain, vision, attackRange, behaviour tag, spawnWeight/maxPerFloor), `DungeonAiParams` (sightRange, wakeOnSpotRadius, loseTargetAfterTurns, wanderChance, fleeBelowHpPct, alertRadius), `Balance.dungeonAiParams/dungeonRoster(sectorNumber)`.
- **np-pixel-dungeon:** `MobBrain`, `dungeon-ai.types.ts` (`TDungeonAiObservation`/`TAiIntent`), `RangedAttackAction`, `MobFactory` (= F3), `level.findPathFor`.

**Thin slice → full:** (1) hunting on the _existing_ roster — `findPathFor` + a 2-state `MobBrain` (Wander↔Hunt) using own vision _(skeletons chase the player)_; (2) move decision into explicit `decide()` (= F5) + first AI unit spec; (3) full state machine (sleep→wake, hunt→give-up; flee guarded behind F2's `mob.health?.fraction ?? 1` so it's inert until combat ships); (4) bestiary + roster data + factory; (5) ranged/caster archetype + `RangedAttackAction`; (6) optional alert propagation + `Doged`→`Dodged` fix.
**Risks:** pathfinder re-rooting mutates shared rex state — always re-root immediately before `findPath`, never cache across the player query, reset to player after each enemy; `occupiedTest` mismatch means two hunters can step onto the same cell — mitigate by taking **one** path step per turn and re-pathing; the `decide()` migration must run in `startTurn` _before_ the drain loop reads `mob.action`; `MobBrain` must take a seed _derived from the dungeon seed_, not the global RNG, or reproducibility/tests break; keep "caster" to a ranged _attack_ until F2 lands.

---

## Suggested build order

A single pragmatic sequence — each line is a candidate `Leet-<n>` issue. Dependencies in brackets.

| #   | Work                                                                                                                                          | Cluster / Foundation | Effort | Depends on |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------ | ---------- |
| 1   | Finish launch/result round-trip; widen `TPixelDungeonSceneConfig` (objective/seed/depth); engine reads config not literals                    | **F1**               | S      | —          |
| 2   | Wire `EndGameState` + `goto(EndGame)` from the loop; demote `M` key; `#onModeResult` consumes `loot` + lethal `dungeon→ending`                | **F1**               | S      | 1          |
| 3   | `ChessLayer` const; migrate z-literals; distinct `getItemAt`/`getFeatureAt`; stop pretending `getTile` is general                             | **F4**               | S      | —          |
| 4   | Engine event bus; `onMobEntered` per-step hook; move enemy decision into explicit `decide()`                                                  | **F5**               | S      | —          |
| 5   | **Items vertical slice:** `ITEMS` catalog + `COIN` role, item entity on `z='items'`, auto-pickup, loot→marbles                                | **A**                | M      | 1, 3, 4    |
| 6   | `Balance.dungeonLoot` + thread launch/depth; loot scales by floor                                                                             | **A**                | S      | 5          |
| 7   | **World slice:** `PixelDungeonDecorator` + `PixelDungeonFeature` + entrance/exit stairs + objective exit (kills dead `EndGameState` for real) | **C**                | M      | 1, 2, 3, 4 |
| 8   | `MobHealth`/`MobCombat` trait + pure `resolveDamage` + `killMob`/`removeMob` (scrub both mob lists) — **combat becomes real**                 | **F2 / B**           | M      | 4          |
| 9   | Player death → `EndGame`; all-enemies-dead → `completed`; damage via `EMobInfoType` floaters                                                  | **B**                | S      | 8          |
| 10  | `MobFactory` + `BESTIARY`/`MOB_STATS` tables + `Balance.dungeon*` resolvers; replace inline `#setup` roster                                   | **F3**               | M      | 8          |
| 11  | **AI slice:** `level.findPathFor` re-root + 2-state `MobBrain` (Wander↔Hunt) on own vision — enemies chase                                    | **E**                | M      | 4, 8(soft) |
| 12  | Full `EBehaviourState` (sleep/wake, give-up, flee guarded by HP) + `DungeonAiParams` + AI unit spec                                           | **E**                | M      | 10, 11     |
| 13  | Equipment slots + modifier fold + inject equipped ids from the run; depth scaling                                                             | **B**                | M      | 8, 10      |
| 14  | World step 2–4: traps (non-damaging→damaging via #8's `applyDamage` seam), special rooms, locked doors + solvable keys, descend-deeper        | **C**                | L      | 7, 5, 8    |
| 15  | **NPC slice:** stationary merchant + in-Phaser paused trade dialog; gold round-trip                                                           | **D**                | M      | 1, 2       |
| 16  | Boss rooms + `PixelDungeonBoss` + objective `hunt`; blacksmith/quest-giver as data variants; ranged/caster archetype                          | **D / E**            | L      | 8, 10, 14  |
| 17  | Optional: in-dungeon `Inventory` (quantities/slots); Angular trade overlay; consumable potions that heal HP                                   | **A / D**            | M      | 8, 13      |

**Critical path:** 1 → 2 → (3, 4 in parallel) → 8 (combat) is the spine; items (5–6) and the world slice (7) can proceed in parallel against the foundations before combat lands, since both are deliberately combat-independent in their first increments. Throughout, keep the pure pieces — `resolveDamage`, `MobBrain.decide`, the `Balance` resolvers, the decorator's room selection, the np-config catalogs — behind small headless specs in the style of `factory.spec.ts`/`balance.spec.ts`; they're the only parts testable without Phaser, and they're exactly the parts a regression net is currently missing.
