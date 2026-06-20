# Backlog

Issues for [game-design.md §7](game-design.md). Numbering continues the `Leet-<n>` commit convention.

**Active phase: Phase 1 — The Map Run.** Phase 0 (The Spine) is complete (Leet-26…31 below, plus
Leet-32 "no rxjs"). Much of Phase 1 also landed ahead of this tracker: the route graph with real
adjacency (`np-space-map.ts`), fire-and-forget two-tap travel + jump preview + camera-follow, the
normality front (per-jump advance, color-drain veil, node swallowing — `normality-front.ts` / `reality.ts`),
the event system v1 (HTML dialog, three answers, resource outcomes; five sector pools + a core pool),
and the map HUD (`space-ui.scene.ts`). The four issues below are what's left to make a map-only run
*genuinely* playable and to settle the canonical exit model.

---

# Phase 1 — The Map Run *(active)*

Goal (GDD §7): *a map-only run is genuinely playable — reach the exit before the front; text endings.*
Recommended order: **~~Leet-33~~ → 34 → 35 → 36** (33 ✅ closed the literal exit criterion; **34 is next** —
the central design payoff; 35/36 add teeth).

## Leet-33: Run-end & text endings — ✅ done

**Context:** the front catching the ship currently only flashes the camera and shows a map banner —
`NPSpaceMap.#onSnapback` emits `REALITY_SNAPBACK` but **nothing drives the FSM to an ending**. The
conductor only listens for `SECTOR_EXIT` (`run-conductor.service.ts:42`), and the ending screen is a stub
placeholder ("text endings — Phase 1"). This issue makes the run actually *end*.

**Outcome**
- [x] Conductor now subscribes to `REALITY_SNAPBACK` (alongside `SECTOR_EXIT`) and drives the FSM to `ending`
      (`#onSnapback`, guarded by `can('ending')`). The 1000 ms stage fade-out lets the snapback flash + the
      "REALITY SNAPPED BACK" banner play before the ending screen.
- [x] New pure `describeEnding(kind, ctx)` in np-state (`run/ending.ts`, + `ending.spec.ts`) maps the exit
      taken plus carried run state (sector reached, rescued crew, marbles) to a headline + epilogue.
      `#showEnding` renders it. Three exits recorded on `#endingKind`: **snapback** (front), **bail** (rim sun
      past the final sector), **wiped** (guardian/boarding placeholders). Bittersweet framing per GDD §2/§3.
- [x] Dropped the stale `// TODO(Leet-27)` handoff comments in `np-space-map.ts`; refreshed the
      `REALITY_SNAPBACK`/`SECTOR_EXIT` doc comments in `space.events.ts` (no longer "stubs").
- [x] build + lint + all unit tests green (incl. the new `ending.spec.ts` and the app bootstrap smoke test).
      *e2e not run here:* port 4200 was held by an unrelated dev server and Playwright reused it
      (`reuseExistingServer`); rerun once :4200 is free.

**Exit:** the literal Phase 1 exit criterion — reach the exit before the front; text endings.

## Leet-34: Guardian gate node — the rewarding exit — ☐ todo

**Context:** the graph today has only **bail-suns** (no-reward rim exits — `StarmapFactory` rim `outerSpace`
nodes). GDD §3/§8: rim suns stay no-reward bail-exits and the **guardian becomes the *rewarding* exit**
(rescue + advance). §8 parked this "until the duel and run-state machine land" — they have, so this is the
moment to settle it. The real guardian *fight* is Phase 4; here the guardian is a graph node that gates the
rewarding exit and hands off to the existing guardian placeholder scene.

**Decide first (GDD §8, before coding):**
- Does bailing via a rim sun still bank partial rescues, or is bailing strictly "leave poor"?
- Is there a cost to bail beyond the lost rim loot, or is "leave empty-handed" cost enough?

**Scope**
- [ ] `StarmapFactory` generates a guardian node on the far (distorted) side of the graph, **always reachable**
      from the inner graph (the front shouldn't be able to strand it).
- [ ] Distinct map marker + state for the guardian node; reaching it → `guardian` phase (placeholder scene stays).
- [ ] Guardian win → advance to the next sector **with a rescue recorded** (crew abilities are Phase 4 — just
      flag the rescue in run state for now).
- [ ] Rim suns stay no-reward bail; the pull between the two exits is the core loop (GDD §3).
- [ ] *(Folded-in polish)* make the hardcoded "3 nearest" route linkage (`#initConnections`) a sector density
      knob in np-state `Balance`.

**Exit:** a sector has two real exits — bail (poor) and guardian (rescue + advance).

## Leet-35: En-route intercepts — ☐ todo

**Context:** a jump goes straight from `JUMP_COMMITTED` to arrival; GDD §3 wants jumps interceptable (an
enemy ship flies toward yours → choice event / fight / boarding). Event content already carries en-route
flavor; this wires the mechanic.

**Scope**
- [ ] Intercept roll on jump commit, chance = a sector knob in np-state `Balance`.
- [ ] Visual: an enemy ship flies toward the rocket mid-flight (np-phaser movable sprite).
- [ ] Resolve through the existing event dialog (a choice-tree event from an en-route pool). Ship fights /
      boarding (duel + dungeon launch) are deferred to Phase 2/3.
- [ ] The front still advances exactly **once** for the jump — an intercept must not double-count it.

**Exit:** some jumps get intercepted and resolve through a choice event before arrival.

## Leet-36: Distortion-battery pushback — ☐ todo

**Context:** `NPSpaceMap.pushFront()` and the `front` effect with negative `advance` both work, but nothing
feeds them (`// TODO(Leet-29): wire to event/loot rewards`). The pushback mechanic exists; it just has no source.

**Scope**
- [ ] A **distortion battery** reward — an event outcome / loot item that pushes the front back one node
      (`pushFront`). The canonical source is the Sabotage dungeon drop (Phase 3); for Phase 1 it comes from an
      event/loot reward.
- [ ] Surface it on the HUD — the front bar visibly retreats (`Reality.sweepTo` already animates the veil).

**Exit:** the player can buy back a little room against the front.

---

# Phase 0 — The Spine ✅ complete

`nx run-many -t build lint test` and the Playwright e2e are green, and a full fake run flows
hangar → sector → (map ⇄ event/duel/dungeon/boarding/guardian) → ending → hangar through every run phase.
Much of the spine (the FSM, run store, save skeleton) was built across commits Claude-16…26 ahead of this
tracker; the closing work was the mode-result contract and the placeholder scenes that make the run
traversable end-to-end.

## Leet-26: Strict TypeScript baseline — ✅ done

**Context:** big-bang switch to strict before the spine is built.

**Outcome**
- [x] `strict` was already on in `tsconfig.base.json` (since Claude-4) with no weakening per-project
      overrides; verified the whole workspace builds/tests/lints green under it.
- [x] Added the strict-adjacent flags `strict` doesn't cover: `noImplicitOverride`, `noImplicitReturns`,
      `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames` — fixed the fallout (~50 `override`
      modifiers on the Phaser-extending classes; one not-all-paths-return).
- [x] Added Angular `strictTemplates` / `strictInjectionParameters` / `strictInputAccessModifiers` to the
      app (zero fallout — the shell has minimal templates).
- [x] Re-evaluated the disabled `no-unsafe-*` ESLint rules: Phaser 4 is TS-native, so only **6** violations
      workspace-wide → re-enabled all five (`no-unsafe-call/assignment/argument/member-access/return`).
      Typed the dead `ReversePipe`; one documented local disable at the rex-plugin `MoveTo.update` boundary.

---

## Leet-27: Run state machine — ✅ done (mostly pre-built)

`RunFsm` (typed phases + `RUN_TRANSITIONS` table + observable `current$`; illegal moves throw),
`RunContext`/`RunStateStore`, and the `GameStateService` facade all live in `@shared/np-state` and are
wired into the app via `RunConductorService`. The home-page debug toolbar (Map/Event/Duel/Dungeon/
Board/Guardian) is the dev "force a transition" UI. Transition table covered by `run.fsm.spec.ts`.

---

## Leet-28: Scene transition cleanup — ✅ done

`StageService` is the sole scene authority (`startScene(...entries)` with a `#switching` guard +
`#isCurrent` dedupe; persistent scenes sleep, transient ones are removed) and `RunConductorService` is its
only caller — the old `home.page#goToSpace` bypass is gone. The space map's three scenes start/stop/fade
as one group. Added `StageService.clear()` to tear down all scenes (incl. slept persistent ones) on a run
end so the next run builds fresh. No scene stacking; e2e green.

---

## Leet-29: Mode result contract — ✅ done

`@shared/np-state` `mode/mode-contract.ts` defines `ModeLaunch` (`DuelLaunch | DungeonLaunch`),
`ModeResult` (`DuelResult | DungeonResult`), `ModeResultHandler`, and `isModeSuccess` (+ spec). The duel
(`ParadroidScene`) maps its match result to a typed `DuelResult` and reports it via a "↩ Map" control; the
dungeon reports a stub `DungeonResult` (press M — real objective exit is Phase 3). `RunConductorService`
injects `onResult` into both and advances the FSM back to `sector` on report. The event model's
`spawnGame` effect now carries `reason` + an optional real `ModeLaunch` (was a `unknown` placeholder).

---

## Leet-30: Save-file skeleton — ✅ done (pre-built)

Versioned `SaveFile` (`version`, `meta { petEvolution, unlocks[], storyPieces[] }`, `settings`),
`PersistencePort` (in-memory default + the app's Capacitor adapter), and `SaveStore` with `load`/`save`/
`migrate` (the v0→v1 migration is unit-tested in `save.store.spec.ts`).

---

## Leet-31: Phase 0 exit — the fake run — ✅ done

A domain-free `PlaceholderScene` (np-phaser: title + lines + action buttons) backs every phase without a
real scene (hangar, guardian, boarding, ending); each action wires a legal FSM transition. From a fresh
start the run reaches an ending screen through every phase and loops back to the hangar. `sectorExit` stays
a scene-less routing phase (driven by the rim-sun `SECTOR_EXIT` bus event) so it doesn't fight the async
`StageService` swap. build/test/lint/e2e all green.
