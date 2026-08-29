# Grey-Fight — implementation reference

> **Turn-based, round-based model — IMPLEMENTED 2026-06-28** (engine + scene + tests + wiring; reviewed by
> design-fidelity / correctness / Phaser-runtime passes; `nx test` 31 ✓, `nx lint`, `nx build np-leet-hunt`
> all green). The upgrade system is **one connected skill tree** that unfolds as you play, with the six cats
> woven in as auto-acquiring gate nodes (rework 2026-06-28; was six separate columns). UI is **debug-grade**;
> art, resize, and save persistence are deferred (see [backlog.md](backlog.md)). Canonical design:
> [design.md](design.md) / `../game-design.md` §4.

## Library layout (`libs/np-grey-fight`)

```
src/lib/core/grey-fight.model.ts   # pure data: types, tuning, UPGRADE_NODES, cat roster, formatNumber()
src/lib/core/grey-fight.ts         # GreyFight — the engine (no Phaser, deterministic apart from injected rng)
src/lib/core/grey-fight.spec.ts    # 18 unit tests
src/lib/grey-fight.scene.ts        # GreyFightScene — the Phaser view (fight + cultivation + draggable tree)
```

The engine is **Phaser-free and deterministic** (apart from an injected `rng`), so the whole loop/economy is
unit-tested headlessly and could later drive a different view or a save file.

## Engine API (`GreyFight`) — the contract the scene binds to

```ts
new GreyFight(tuning?: Partial<GreyFightTuning>, rng: () => number = Math.random)  // default-constructible

// per-turn stats (getters)
get tapDamage / critChance / critMult / catStrike / regenPerTurn / maxStamina / stamina: number
get isRoundOver: boolean

// round + turn
startRound(): void               // refill stamina; reset the active location's FIGHT only (bay→openerBay,
                                 //   grey full, roundDamage 0); meta untouched
takeTurn(): TurnResult           // resolve ONE turn at the active location, spend 1 stamina; no-op if over

// locations
setActiveLocation(index): boolean   // switch to a reclaimed home / the frontier; ends round accounting (roundDamage→0)

// cat evolution (resource-funded)
catEvoLevel(catId) / evolveCost(catId) / canEvolve(catId): ... ; evolveCat(catId): boolean

// skill tree (one connected tree; light-funded upgrades + auto-acquiring cat gate nodes)
nodeLevel/costFor/isRevealed/isMaxed/canAfford/canBuy/buy(id): ...
//   isRevealed(id) — true if the node's parent is acquired (root always); the tree unfolds by this rule.
//   buy/canBuy — UPGRADE nodes only (cat nodes never buyable); revealed, not maxed, affordable.
//   cat gate nodes auto-acquire when the cat is freed in combat (no buy needed); #sum/#regenReduction
//   skip them (no stat). costFor → ∞ for a cat node.

// events + snapshot
drainEvents(): GreyFightEvent[]  // 'enteredBoss'|'freedCat'|'reclaimedLocation'|'openedLocation'|'colorTierUp'|'catEvolved'|'roundOver'
snapshot(): GreyFightSnapshot
```

`TurnResult` is a union by `.kind`: `combat` `{tapDamage,crit,catStrike,regen,damage,light}` (`damage` = **net**
HP lost = (you+cats) − the heal it managed, ≥0; `light`/`roundDamage` bank the full output) · `cultivate`
`{resourceGained,colorTierUp}` · `none` (round over). `GreyFightSnapshot` carries the active location +
`locations[]`, the contested fight (`bay/phase/greyHp/greyMax`, meaningful when `activePhase==='contested'`),
the round budget (`stamina/maxStamina/isRoundOver/roundDamage/bestRoundDamage`), `light`, `cats[]`
(`{id,name,color,strike,evoLevel}`), the per-turn stats, `netPerTurn`, and the next-cat gate
(`nextCatThreshold/nextCatName`).

## Turn resolution (the rules)

- **Combat** (`contested` active): heal first (regen works against you), then you strike (crit if `rng() <
critChance` → `×critMult`) + cats strike; `light`/`roundDamage` bank the full output. Clearing `greyHp`
  advances the in-round wall (`bay`→`boss`→ next `bay`, escalating; **no** cat-freeing here). **Cats free by
  single-round record:** a `while` loop frees every cat whose threshold (`catThresholdBase ×
catThresholdGrowth^index`) `roundDamage` has crossed this turn — each reclaims its location, opens the next,
  and switches the active frontier mid-round.
- **Cultivation** (`reclaimed` active): a friendly play-beat yields `resourceGained = (tap+cat) ×
resourceFactor` into the location and advances its colour tier via a dedicated forward-only `#colorProgress`
  ledger (separate from spendable `resource`, so evolving never rewinds a tier).
- **`startRound`** resets only the active fight; **`setActiveLocation`** zeroes `roundDamage` (a round belongs
  to one location — leaving abandons it). **Evolution** raises strike only; colour depth is driven solely by
  cultivation (the two color drivers are intentionally independent).

## Model (`grey-fight.model.ts`)

- **`TreeId`** (6): `dmg · crit · cats · endurance · economy · openers`. **`StatKind`** (10): the old eight plus
  `staminaFlat` (Endurance) and `openerBay` (Openers).
- **`DEFAULT_TUNING`** — SKETCH values (balance is a playtest job): `baseHp 30, hpGrowth 1.75, baseRegen 2,
regenGrowth 1.8, bossHpMult 5, bossRegenMult 1.5, tapBase 6, catStrike 1.5, lightPerDamage 0.5,
critMultBase 2, critChanceCap 0.6, baseStamina 20, catThresholdBase 250, catThresholdGrowth 4,
resourceFactor 0.5, colorTierCost 30, colorTierGrowth 1.6, evoCostBase 25, evoCostGrowth 1.7,
evoStrikePerLevel 1`.
- **`UPGRADE_NODES`** — ONE connected skill tree of **26 nodes** (rework 2026-06-28; was 6 separate columns).
  Two `kind`s of `TreeNode` (a discriminated union `StatNode | CatNode`): **20 `upgrade` nodes** (light-funded,
  geometric cost, feeding a stat — `tree` still drives the card accent colour) and **6 `cat` gate nodes**
  (`scuff/nona/glimmer/blink/comet/tinker`) that are **NOT buyable** — they auto-acquire when the cat is freed
  in combat. Each node has exactly one `requires` parent reachable from the root `d1`, so the whole thing is a
  single tree. The six cats sit on the **central spine** `d1 → scuff → nona → glimmer → blink → comet → tinker`
  (x = 1000), with upgrade branches hanging off each cat — so deeper upgrades (e.g. `e1` Endurance behind
  Blink, `o1` Openers behind Tinker) are gated on freeing that cat. **Reveal rule (progressive unfold):** a
  node is shown only once its parent is _acquired_ — an upgrade bought to level ≥ 1, or a cat freed in combat
  (the root, with no parent, is always revealed). Layout is a vertical tree, root at top, `y = 120 + depth ×
200`; `baseCost` trends up with depth (deeper = later-game). All ten `StatKind`s are covered. Per-cat "lines"
  remain the resource-funded **evolution** (not light nodes), so they are still deliberately absent. (~100
  nodes is a later tuning job.) `NODE_BY_ID` indexes the whole tree, cat nodes included.
- **`formatNumber(n)`** — sign-aware ~3 sig figs: `k/m/b/t/qa/Qi/Sx/Sp/Oc/No/Dc` (1e3…1e33) then scientific;
  promotes the tier on near-boundary rounding (999999 → `1m`, not `1000k`); sub-unit values keep 2 sig figs.

## Cat abilities (per-cat specialists)

Each freed specialist has a distinct ability scaling with `level = evoLevel + 1` (robo-cat + kittens are
plain `strike`). The passive abilities are folded into the stat getters so the HUD reflects them
automatically; Comet is the one dynamic per-turn proc. `CatDef` carries an `ability: CatAbility` + a display
`blurb`.

| cat     | kind            | effect                                                                                                       |
| ------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| Scuff   | `multiHit`      | ×`tapDamage` by `1 + scuffSwipe×level`                                                                       |
| Nona    | `crewMult`      | ×`catStrike` by `1 + nonaPerCat×level×(catCount−1)` (whole crew, scales with roster)                         |
| Glimmer | `lightMult`     | ×light-per-damage by `1 + glimmerLight×level`                                                                |
| Blink   | `regenSuppress` | ×`regenPerTurn` by `max(blinkFloor, 1 − blinkSuppress×level)`                                                |
| Comet   | `burst`         | every `cometPeriod`-th combat turn of a round, +`tapDamage×cometBurst×level` (sets `CombatTurnResult.burst`) |
| Tinker  | `wildcard`      | ×both `tapDamage` & `catStrike` by `1 + tinkerBonus×level×maxTreeLevels` (your most-leveled tree)            |

Tuning: `scuffSwipe 0.4, nonaPerCat 0.06, glimmerLight 0.5, blinkSuppress 0.12, blinkFloor 0.15,
cometPeriod 5, cometBurst 3, tinkerBonus 0.01`. Comet uses a per-round `#roundTurns` counter (combat turns
only; reset in `startRound`). Because yield is output-based, the strike-boosting abilities (Scuff/Nona/Tinker)
also speed cultivation — intended (a stronger colony cultivates faster).

## Scene (`GreyFightScene`)

Key `'grey-fight-scene'`. Config `{ engine, onExit? }` (unchanged — the conductor wiring needed no edits).
Turn-based: **a turn happens only on a tap/button; `update()` runs NO engine logic** — it just drains
celebration events and keeps the light readout live. Two views: **Fight** (the active location — a tappable
grey-mass for combat or a cultivation target for a reclaimed home; a chip row switches location, a "Start
round" button when over, an "Evolve {cat}" button at a home; legible per-turn breakdown + cat gate) and
**Upgrades** (the draggable **single skill tree** that **unfolds** as you play — every `#refreshTree` sets each
node's `setVisible(engine.isRevealed(id))`, so hidden subtrees appear only as their parent is acquired. Links
are redrawn each refresh and a parent→child line is drawn only when **both** endpoints are revealed, so no line
dangles into a hidden branch. Upgrade nodes buy-on-tap with light; the six **cat gate nodes** render
distinctly — stroked/tinted in the cat's colour, reading `✓ freed` / `🔒 free it in combat` — and are
non-buyable (a tap is a no-op). One "Skill Tree" title replaces the old per-column headings; the page starts
panned so the root is visible top-centre, drag bounds recomputed from the node positions). `create()` sets a
`#built` flag and discards stale engine events; `update()` early-returns until `#built` (Phaser can step a
scene before `create()` finishes). Drag-vs-tap uses straight-line distance from the press origin. `shutdown`
removes the scene's input listeners.

## Wiring (unchanged)

`tsconfig.base.json` alias · `run-conductor.service.ts` (`#greyFight = new GreyFight()`, `beginColony()`) ·
`home.page.ts/html` debug **"Colony"** button · `index.ts` re-exports. All compile against the new API as-is.

## Verification

`npx nx test np-grey-fight` (**31 ✓**: start state, combat turn + net `damage`, crit, bay→boss, round-over
no-op, startRound keeps meta, cat freed by record, multi-cat free in one turn, roundDamage reset on switch,
cultivation + forward-only tier, evolution, **skill tree** (root buy + reveal of children, cat gate not
buyable + branch hidden, freeing Scuff reveals its branch, Endurance gated behind Blink, Openers behind
Tinker, max-level, cat nodes never maxed + stat sums hold with cat nodes present), formatNumber, **the six
cat abilities** + robo-only neutrality, Nona whole-crew formula, Blink floor clamp) · `npx nx lint
np-grey-fight` · `npx nx build np-leet-hunt` — all green.

## Known limitations / deferred (see backlog.md)

- **No resize handling** — laid out once at `create()` from `gameSize`; can clip/drift after a window/rotation
  resize (siblings wire `Scale.RESIZE`).
- **No save persistence** — engine state is in-memory on the conductor for the session.
- **Visuals are primitives** — no art; "ship recolor" is a colored strip + a tint stub.
- **By design:** `light`/`roundDamage` bank the full per-turn output (overkill counts); the cultivation
  breakdown text hardcodes `resourceFactor` (display only).
