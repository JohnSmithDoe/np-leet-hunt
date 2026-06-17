# Backlog — Phase 0: The Spine

Issues for [game-design.md §7, Phase 0](game-design.md). Numbering continues the `Leet-<n>`
commit convention (last used: Leet-25). Ready to paste into GitHub issues; until then this
file is the tracker.

---

## Leet-26: Strict TypeScript baseline

**Context:** Design decision (§7 Phase 0): big-bang switch to strict before the spine is built,
so all new systems are strict from day one.

**Tasks**
- [ ] `"strict": true` in `tsconfig.base.json`; remove weaker per-project overrides.
- [ ] Fix fallout lib by lib (`np-library` → `np-phaser` → game libs → app).
- [ ] Tighten ESLint where strict unlocks it (e.g. re-evaluate disabled `no-unsafe-*` rules).

**Acceptance:** `nx run-many -t build test lint` green with strict on; no `any`-suppression
comments added just to pass.

---

## Leet-27: Run state machine

**Context:** The spine of every run: `hangar → sector → (map ⇄ event|dungeon|duel|boarding) →
guardian → sector exit → … → ending(partial|full|true)`. Today no run state exists at all —
the home page just adds scenes.

**Tasks**
- [ ] Evaluate building blocks: `rexStateManager` (already registered as global plugin),
      the old RxJS sketch (`apps/old/stateMachine.ts`), or a fresh small typed FSM.
- [ ] Typed states + transition table + observable current state; illegal transitions throw.
- [ ] Run context object carried through states (sector no., rescued members, resources — stub).
- [ ] Debug UI (dev-only) to force transitions.

**Acceptance:** a fake run traverses every state via debug controls; transition table covered
by unit tests.

---

## Leet-28: Scene transition cleanup

**Context:** `StageService.startScene` tracks a single current scene, but the space map adds
three scenes directly (`home.page.ts#goToSpace`), bypassing it — switching modes stacks scenes
on top of each other (paradroid currently renders above the still-running space scenes).

**Tasks**
- [ ] `StageService` becomes the only scene authority; no direct `game.scene.add` outside it.
- [ ] Scene *groups*: the space map's three concurrent scenes start/stop/fade as one unit.
- [ ] Unified fade-out → swap → fade-in driven by the run state machine (Leet-27).

**Acceptance:** switching between space map, dungeon, and paradroid never stacks scenes;
transitions fade cleanly; Playwright e2e stays green.

---

## Leet-29: Mode result contract

**Context:** Modes must be launchable with parameters and must report results back (§3 mode
handoff; old paradroid note: "intro → select game → play → end → return result").

**Tasks**
- [ ] Define `ModeLaunch` / `ModeResult` types (per mode: duel config/grid/AI level → outcome
      win/lose, absorbed class, time left; dungeon objective → completed/failed/loot).
- [ ] Scenes receive launch config via the state machine and resolve a result on exit.
- [ ] Paradroid wired as the first real implementer (it already returns to the map).

**Acceptance:** a duel started from a debug map button returns a typed result that the run
state machine logs/consumes.

---

## Leet-30: Save-file skeleton

**Context:** Meta persistence lands in Phase 5, but the format starts now so every phase saves
compatible data (§4 meta: pet evolution, unlocks, story pieces).

**Tasks**
- [ ] Persistence service: versioned JSON schema (`version`, `meta { petEvolution, unlocks[],
      storyPieces[] }`, `settings`), localStorage-backed (Capacitor Preferences later).
- [ ] Load/save/migrate stub with one fake migration test.

**Acceptance:** meta survives a reload; schema-version bump path unit-tested.

---

## Leet-31: Phase 0 exit — the fake run

**Context:** Phase 0's exit criterion (§7): a fake run flows end-to-end through placeholder
scenes.

**Tasks**
- [ ] Placeholder scenes/screens for hangar, sector map, dungeon, duel, ending.
- [ ] Wire Leet-27/28/29/30 together: full fake run from app start to an ending screen and
      back to the hangar.
- [ ] Feed learnings back into game-design.md §7 if the plan needs correcting.

**Acceptance:** from a fresh app start, a complete fake run reaches an ending screen through
every state; build/test/lint/e2e all green.
