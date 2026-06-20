# Backlog

Issues for [game-design.md §7](game-design.md). Numbering continues the `Leet-<n>` commit convention.

**Phase 1 (The Map Run) is complete** (Leet-33…36 below), on top of Phase 0 — The Spine (Leet-26…31, plus
Leet-32 "no rxjs"). Much of Phase 1 had landed ahead of this tracker: the route graph with real adjacency
(`np-space-map.ts`), fire-and-forget two-tap travel + jump preview + camera-follow, the normality front
(per-jump advance, color-drain veil, node swallowing — `normality-front.ts` / `reality.ts`), the event
system v1 (HTML dialog, three answers, resource outcomes; five sector pools + a core pool), and the map HUD
(`space-ui.scene.ts`). The four issues below closed it out: run-end + text endings, the two-exit core loop,
en-route intercepts, and the distortion-battery pushback. **Next: Phase 2** (see game-design.md §7).

---

# Phase 1 — The Map Run ✅ complete

Goal (GDD §7): *a map-only run is genuinely playable — reach the exit before the front; text endings.* — met.
Order delivered: **~~Leet-33~~ → ~~34~~ → ~~35~~ → ~~36~~** (33 closed the literal exit criterion; 34 settled
the two-exit core loop — the central design payoff; 35 added en-route intercepts; 36 added the distortion-
battery pushback — the last of the teeth).

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

## Leet-34: Guardian gate node — the rewarding exit — ✅ done

**Context:** the graph had only **bail-suns** (no-reward rim exits — `StarmapFactory` rim `outerSpace`
nodes). GDD §3/§8: rim suns stay no-reward bail-exits and the **guardian becomes the *rewarding* exit**
(rescue + advance). The real guardian *fight* is Phase 4; here the guardian is a graph node that gates the
rewarding exit and hands off to the existing guardian placeholder scene.

**Decided (GDD §3/§5):**
- **Bailing keeps prior rescues.** A rim sun forfeits only *this* sector's captive + rim loot; crew already
  won back stays aboard (consistent with GDD §3 "a partial rescue is still a rescue"). Run state already
  persisted crew across sectors — only the bail ending copy needed reframing.
- **No extra bail cost.** Walking away empty-handed (no new captive) is cost enough — bail stays a clean,
  low-punishment escape valve, matching the bittersweet tone.

**Outcome**
- [x] `StarmapFactory` generates one guardian node out past the farthest inner planet along the front's
      *safe* axis (`guardianDir`), deep on the far side the grey never normalises. It's also explicitly kept
      out of the front bounds and the swallow set, so the front can't strand the rewarding exit.
- [x] Distinct guardian node: dedicated `planetPurpleTwo` texture (reserved from the random inner pool — gives
      the just-added asset a purpose) + biggest display size; `Planet.guardian` flag. Reaching it fires the
      new `GUARDIAN_REACHED` bus event → conductor drives the FSM to `guardian` (placeholder scene stays).
- [x] Guardian win (`#winGuardian`) records the sector's captive via `Balance.rescueForSector(n)` (sibling
      always sector 5 per GDD §5; mom/dad/grandma/grandpa across 1–4, per-run shuffle deferred to Phase 4) and
      advances to the next sector. Beating the **final** guardian wins the sibling and ends the run on the new
      **`'rescued'`** text ending — the way to the Hush opens (GDD §2 full rescue / true-final, Phase 4).
- [x] Rim suns stay no-reward bail; the pull between the two exits is the core loop (GDD §3).
- [x] *Fixed a latent integration bug:* `#showSpace`'s "advanced to a new sector" path assumed the space
      scenes were awake (only ever hit via rim-sun bail). A guardian win advances while those scenes are
      *slept* off-stage — now it rebuilds their content while hidden, then wakes + fades them back in.
- [x] *(Folded-in polish)* the hardcoded "3 nearest" route linkage is now a `linkDegree` knob in np-state
      `Balance` (4 in sector 1, easing to 3; floor 2 to stay connectable).
- [x] build + lint + all unit tests green (np-state 41 incl. new `rescueForSector` + `'rescued'` ending tests,
      np-space-map 20, app bootstrap smoke 1). *UI not exercised here* — user verifies the map visually.

**Exit:** a sector has two real exits — bail (poor) and guardian (rescue + advance).

## Leet-35: En-route intercepts — ✅ done

**Context:** a jump went straight from `JUMP_COMMITTED` to arrival; GDD §3 wants jumps interceptable (an
enemy ship flies toward yours → choice event / fight / boarding). This wires the mechanic; ship fights /
boarding stay Phase 2/3.

**Outcome**
- [x] Intercept roll on jump commit — chance is a new `interceptChance` sector knob in np-state `Balance`
      (climbs 10→30% with depth, so ambushes stay rare early and common near the Hush). Seeded by
      sector + jump count so a jump's roll is reproducible (`NPSpaceMap.#rollIntercept`).
- [x] Visual: a Grey Fleet ship (the rocket texture, greyed + flipped — no new asset) sweeps in toward the
      intercept point as a transient `NPMovableSprite` (`#spawnEnemy` / `#despawnEnemy`).
- [x] Resolves through the **existing** event dialog: an intercepted jump flies in two legs — to a midpoint
      where it raises a choice event from a new pool-agnostic **en-route pool** (`en-route.events.ts`,
      `resolveEnRouteEvent`; three Grey Fleet events: thief drone / escort fighter / picket field, one with
      a stake), then on to the real destination after the event resolves. The destination's own arrival
      event still fires on landing.
- [x] The front advances exactly **once** per jump (at commit, unchanged) — the intercept only interrupts
      the flight, never re-advances it; en-route outcomes deliberately carry no `front` effects.
- [x] build + lint + unit tests green (np-state 42, np-space-map 22 incl. new `resolveEnRouteEvent` +
      `interceptChance` tests, app smoke 1). *UI not exercised here* — user verifies the intercept visually.

**Two-leg flight reused the slept-scene insight from Leet-34:** the intercept never sleeps the space scenes
(the dialog is an HTML overlay over the live map), so no scene-wake juggling was needed.

**Exit:** some jumps get intercepted and resolve through a choice event before arrival.

## Leet-36: Distortion-battery pushback — ✅ done

**Context:** `NPSpaceMap.pushFront()` and the `front` effect with negative `advance` existed but nothing fed
them (`// TODO(Leet-29): wire to event/loot rewards`) — and the negative `front` path was subtly broken.

**Outcome**
- [x] A **distortion battery** is a loot item (`DISTORTION_BATTERY`, shared const) granted by an event
      outcome. The map consumes it on grant — it isn't carried — and calls `pushFront()` to ease the grey
      back one node (`#applyEffects`). This wires the public `pushFront()` (the stale TODO is gone); the
      Sabotage dungeon drop becomes the same code path in Phase 3.
- [x] New core-pool reward event `distortion-cache` (a derelict cradling a live charge): the good branch
      feeds it to the grey (grants the battery → pushback); neutral strips it for marbles; bad overloads.
- [x] *Fixed a latent bug:* the negative `front` effect pushed back by a raw position **unit**, not a node
      (`pushFront(-steps)` passed a count as the amount). It now loops `pushFront()` one node at a time,
      symmetric with the forward shove — so `front: { advance: -1 }` eases the grey by exactly one jump.
- [x] Surfaced on the HUD: the front bar already retreats via `FRONT_ADVANCED`; added a new `FRONT_PUSHED`
      bus event + a green "DISTORTION BATTERY — THE GREY PULLS BACK" banner (matching the snapback /
      sector-exit banners) so the rare reprieve reads as a clear positive beat. `Reality.sweepTo` eases the veil.
- [x] build + lint + unit tests green (np-space-map 23 incl. a new test asserting a battery source exists,
      app smoke 1). *UI not exercised here* — user verifies the bar retreat visually.

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
