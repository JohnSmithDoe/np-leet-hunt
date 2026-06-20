# Backlog — Phase 0: The Spine ✅ COMPLETE

Issues for [game-design.md §7, Phase 0](game-design.md). Numbering continues the `Leet-<n>`
commit convention.

**Status:** Phase 0 is done — `nx run-many -t build lint test` and the Playwright e2e are green, and
a full fake run flows hangar → sector → (map ⇄ event/duel/dungeon/boarding/guardian) → ending → hangar
through every run phase. Much of the spine (the FSM, run store, save skeleton) was actually built across
commits Claude-16…26 ahead of this tracker; the closing work was the mode-result contract and the
placeholder scenes that make the run traversable end-to-end. Next: **Phase 1 — The Map Run**.

---

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
