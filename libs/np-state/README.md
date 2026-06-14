# np-state

Game-state library: the run's carried state (resources, inventory, flags, crew, sector), the run-phase state machine, and the versioned meta save. **Domain, not engine** — it has no Phaser dependency and never imports `np-phaser`, so the engine bridge stays free of game logic.

Imported via the `@shared/np-state` path alias defined in `tsconfig.base.json`. Depends only on `rxjs` and (for the one Angular facade) `@angular/core`.

## What's inside

**Pure core** (plain TypeScript, unit-tested directly — no Angular, no Phaser):

- **`model/`** — the shared vocabulary that used to be stranded in `np-space-map`'s event model: `Resources` (`hull`/`heart`/`marbles`) + `ResourceDelta` + `STARTING_RESOURCES`, and `RunContext` with `SectorId` / `CrewMember`.
- **`run/run-state.store.ts`** — `RunStateStore implements GameState` (Leet-27 run state): clamped resource math, item/flag/crew mutators, a detached `snapshot()`, and a `changes$` that publishes on every mutation. `reset()` starts a fresh (optionally seeded) run.
- **`run/game-state.ts`** — `GameState`, the narrow interface a game mode codes against. Modes depend on this, never on the Angular facade.
- **`run/run.fsm.ts`** — `RunFsm` + the `RUN_TRANSITIONS` table for the spine `hangar → sector → (event|dungeon|duel|boarding|guardian) → sectorExit → … → ending`. Illegal transitions throw.
- **`save/`** — `SaveFile` (versioned, Leet-30), `migrate` (lifts older/garbage files to the current shape), `PersistencePort` + `InMemoryPersistence`, and `SaveStore` (load/save through a port).

**Angular facade** (the only Angular-touching file):

- **`game-state.service.ts`** — `GameStateService` (`providedIn: 'root'`) owns the single `RunStateStore`, `RunFsm`, and `SaveStore`, and mirrors the run snapshot into a `signal`. The `PERSISTENCE_PORT` `InjectionToken` defaults to in-memory; the app overrides it with a Capacitor/localStorage adapter.

## How it's wired (the rule)

- **Pure rules → this lib; Angular/Capacitor/composition glue → the app.** Modes always depend on an interface (`GameState`), the app provides the concretion.
- The **app** is the composition root: it `inject(GameStateService)` and hands `run` (typed `GameState`) into Phaser scene constructors, which thread it down to game objects. **No Phaser registry, no `game.events` for state ownership** — the store's `changes$` / the service's `signal` are the single source of truth.
- `np-phaser` never imports `np-state`. When the run FSM drives scene transitions (Leet-28), the FSM emits *intents* and an app-side wrapper turns them into `StageService.startScene`; the FSM never touches Phaser.

## Running unit tests

Run `npx nx test np-state` to execute the unit tests (Vitest). The FSM transition table and the save migration are covered (Leet-27 / Leet-30 acceptance).
