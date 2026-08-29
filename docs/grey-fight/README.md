# Grey-Fight Colony — feature dossier

"**Holding the Grey**" is np-leet-hunt's **4th mode**: a self-contained, clockless **turn-based
incremental** that lives in a bay of the ship. Each tap is a **turn** — you and your freed cats strike the
grey, it heals back a little — and a **round** is a run of turns bounded by your **stamina**. Between
rounds you spend **light** on a deep upgrade web; cats free permanently when a single round's damage
crosses a threshold, each bringing color back to the ship. It grants **no run power** — its whole payoff
is cosmetic — so it can be as deep as it likes without touching the run's "skill stays king" pillar.

This folder is the working reference for picking the feature back up.

| Doc                                    | What's in it                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [design.md](design.md)                 | Concept, the **load-bearing invariants**, the turn/round loop, the decision log (+ why), the upgrade web toward ~100, cats, scaling/number math               |
| [implementation.md](implementation.md) | Code layout, engine API, turn resolution, tuning + node tables, scene/views, wiring, verification, known limits — **matches the implemented turn-based code** |
| [backlog.md](backlog.md)               | Prioritized **follow-up work** (the spine is done; what's left + the review's deferrals)                                                                      |

## Status (2026-06-28)

**Turn-based round model + locations/cultivation/evolution — IMPLEMENTED, reviewed, building & tested.**

- ✅ Design rewritten around the turn/round loop + locations in `../game-design.md` §4 + this dossier.
- ✅ **Engine** (`libs/np-grey-fight`, pure TS) — turn-based `takeTurn()`/`startRound()`, stamina/rounds,
  locations (contested frontier → reclaimed home), cultivation, per-location resources, cat evolution,
  single-round-record cat-freeing, the 6-tree light web, `formatNumber`. **28 unit tests** green.
- ✅ **Per-cat specialist abilities** — Scuff multi-hit, Nona ×whole-crew, Glimmer ×light, Blink −regen,
  Comet periodic burst, Tinker boosts your most-leveled tree; scale with `evoLevel`.
- ✅ **Scene** — fight + cultivation + draggable six-tree page; location chip switcher; per-cat ability
  blurbs on the ship strip; Comet burst flash; debug-grade HUD.
- ✅ Built by coding agents (engine → scene → abilities), each followed by a review pass; review fixes
  applied (an `update()`-before-`create()` crash guard, multi-cat free in one turn, round-damage reset on
  switch, net `damage` field, `formatNumber` boundary promotion, Nona whole-crew wording). `nx test` /
  `lint` / `build np-leet-hunt` all green.
- ⬜ **Deferred** (see backlog): ~100-node tuning pass, resize-safe layout, save-file persistence, real ship
  recolor / art, real (non-debug) entry point.

## Run / test it

```bash
npm start                         # then: Enter the Hush → "Colony" (toolbar) → "▶ Start round", tap the grey
npx nx test np-grey-fight         # 18 engine tests
npx nx lint np-grey-fight
npx nx build np-leet-hunt         # full app build
```

## Where everything lives

- **Code:** `libs/np-grey-fight/` — `src/lib/core/grey-fight.ts` (engine), `grey-fight.model.ts` (data/tuning),
  `grey-fight.spec.ts` (tests), `src/lib/grey-fight.scene.ts` (Phaser scene).
- **Wiring:** `tsconfig.base.json` (`@shared/np-grey-fight` alias) · `apps/np-leet-hunt/src/app/run/run-conductor.service.ts`
  (`#greyFight`, `beginColony()`) · `apps/np-leet-hunt/src/app/home/home.page.ts` + `home.page.html` (the "Colony" button).
- **Canonical design:** `../game-design.md` §4 ("Holding the Grey") with ripples in §1/§3/§6/§7/§8.
- **Cat names + codex memories:** `cat-codex.md` (the narrative; this dossier covers the mechanics).
