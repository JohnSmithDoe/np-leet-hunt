# Paradroid duel — how it works

Technical notes on `@shared/np-paradroid`, the takeover mini-game. Written while scoping
**Leet-38** (sector curve + mini-duel). Covers the board model, the tile "constellations",
the match loop, the difficulty axes, and a concrete mini-duel design. File references are
`path:line` into this lib unless noted.

## Lineage — the C64 original

This is a re-make of the **transfer/takeover game** from _Paradroid_ (Andrew Braybrook,
Hewson, 1985, Commodore 64). In the original you pilot an "Influence Device" around a
freighter and seize enemy robots; to take one over you play a circuit duel on a board split
into **your half** and **the droid's half**, feeding pulses across logic tiles to win control
of the **central column** of connection points before the clock runs out. Droids carry a
**class number 001–999** — higher = stronger duel position and a better robot once absorbed.

Our game keeps all of that: the mirrored board, the contested middle column, the pulse/charge
budget, the timed match, and the **001→999 class** (`DuelLaunch.droidClass`, the robo-pet of
Leet-39). Open-source descendants of the same idea: _Freedroid_, _Paradroid 90_.

## The board model

A duel board is two **mirrored halves** with a shared **middle column** between them — player
on the left, droid on the right (`paradroid.game.ts#create`, the droid containers are drawn
with `setScale(-1, 1)`).

```
 buttons │ player half (flows →) │ MIDDLE │ (← flows) droid half │ buttons
   12    │  columns × rows tiles  │  rows  │  columns × rows tiles │   12
 charges │   each tile → subtiles │ nodes  │                       │ charges
```

- **Geometry** is fixed in `DUEL_DIMS` (`core/paradroid.factory.ts:41`): `rows: 8`,
  `columns: 8`, `tileWidth/Height: 48`, `stretchFactor: 0`. **`columns` must be even** — the
  factory generates the left half and mirrors it, iterating only to `columns/2`
  (`#generateColumns`).
- Each **tile** (`EParadroidTileType`) expands into **sub-tiles**: a tile at grid `col` writes
  sub-tile columns `col*2` and `col*2+1` (`#generateSubTile`), so the rendered grid is
  `2*columns` sub-tile columns wide. Sub-tiles hold the actual **flow paths**.
- The **middle column** has one node per row (`#generateMiddleRow`) plus an aggregate total
  tile at row `-1`. Each node is owned by `middle-player`, `middle-droid`, `middle-both`, or
  neutral.

### Win condition

When the **30 s** clock (`MATCH_DURATION_MS`, `paradroid.game.ts:17`) expires and all in-flight
flows settle (`#allSettled`), the side owning **more middle nodes wins** (`#finish` /
`#tallyMiddle`). A `both` node counts for both sides; equal counts = draw. **The number of
contested middle nodes equals `rows`** — this is the single most important lever for a
mini-duel (see below).

### Charges (pulses)

Each side has **12 shots**, hardcoded in `#generateShots` (`for i < 12`). Clicking a
first-column **button** spends one shot and injects a flow that propagates rightward through
the circuit toward the middle. When shots run out, that side's buttons disable. The droid side
is driven by the AI, which also presses buttons and holds each for `DROID_HOLD_MS` (3 s).

## The tile constellations ("grid constellations possible")

The shapes a board can be built from are the `EParadroidTileType` palette
(`@types/paradroid.consts.ts:51`), each defined as an incoming/outgoing flow constellation in
`CParadroidTileInfo`. Grouped by what they do to flow:

| Family      | Tiles                                                        | Flow behaviour                         | Rows occupied |
| ----------- | ------------------------------------------------------------ | -------------------------------------- | ------------- |
| **Pass**    | `Empty`, `Single`, `Deadend`                                 | nothing / straight through / dead stop | 1             |
| **Double**  | `DoubleTop/BottomExpand`, `…Combine` (+ `DeadEnds` variants) | split 1→2 / merge 2→1                  | 2             |
| **UpDown**  | `UpDownExpand`, `UpDownCombine` (+ `DeadEnds`)               | split/merge across an Empty centre     | 3             |
| **Tripple** | `TrippleExpand` (1→3), `TrippleCombine` (3→1)                | the big fan-out / fan-in               | 3             |

**Expand** constellations multiply a flow into more middle nodes (offensive — claim more
territory); **Combine** constellations funnel several into one (defensive / concentration).
The split/merge geometry is what makes the board a _puzzle_ rather than a race.

Which constellations appear is set per board **level** by `CParadroidTileSets`
(`paradroid.consts.ts:402`):

- **easy** — Empty, Single, UpDown only. Gentle, mostly straight.
- **normal** — easy + Tripple.
- **hard / brutal** — the full palette incl. all Double variants.

> **Key constraint for board size:** `UpDown*` and `Tripple*` occupy **3 rows**. The placement
> check `row + rows <= col.length` (`#getRandomTileType` → `isFitting`) means on a board with
> **fewer than 3 rows none of them can ever be placed** — it degenerates to Single + Double.
> So 4 rows is the practical floor to keep branching alive.

### Generation & validation

`ParadroidFactory.generateGrid` (`core/paradroid.factory.ts:91`) fills column-by-column from a
seeded RNG (`NPRng`), retrying up to 100× until valid. **Valid** = at least half the final
sub-tile column carries a flow reaching the right edge (`#validateGrid`) — i.e. enough of your
flows can reach the middle. This threshold scales with `rows` automatically.

Two FX are sprinkled on straight paths by rate (`#adjustPathFx`):

- **`fx-changer`** (`changerRate`) — flips a path's owner downstream (`#applyFxChanger`): the
  "transfer" tile that steals a flow. This is the brutal-board pressure.
- **`fx-autofire`** (`autoFireRate`) — a charge/booster tile.

Generation is **reproducible per seed** but **varied on re-roll** (a fresh seed → new layout),
which is exactly what the Leet-40 timed grid-selection re-roll uses (`factory.ts:86`).

## Difficulty axes

Difficulty is **not one number** — it's several independent axes the app resolves from
`Balance` and pairs with this lib's content:

| Axis                                               | Lives in                            | Set by                                                     |
| -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| **Tile palette** (`CParadroidTileSets[level]`)     | np-paradroid (mode content)         | `DuelLaunch.boardLevel`                                    |
| **changerRate / autoFireRate** (`DuelBoardParams`) | np-config `Balance.duelBoardParams` | `boardLevel`                                               |
| **AI params** (`DuelAiParams`)                     | np-config `Balance.duelAiParams`    | `DuelLaunch.aiLevel`                                       |
| **Pet easing**                                     | np-config `Balance.duelAiForPet`    | run's `petClass` softens the AI a notch per tier (Leet-39) |
| **Geometry** (`rows/columns/tile size`)            | `DUEL_DIMS`                         | **fixed today — this is the mini-duel seam**               |

The app assembles these in `run-conductor.service.ts#showDuel` (~`:185`):
`paradroidFactoryOptions(Balance.duelBoardParams(level), CParadroidTileSets[level])` → into the
`ParadroidScene` config, plus `Balance.duelAiParams(duelAiForPet(aiLevel, petClass))`.

## The launch / result contract

`np-state/mode/mode-contract.ts` is the typed, Phaser-free boundary:

- **`DuelLaunch`** `{ kind, boardLevel, aiLevel, droidClass? }` — what the conductor hands the
  duel. Encounters set it: stray-droid (class 3), escort-fighter (class 5).
- **`DuelResult`** `{ kind, outcome, absorbedClass?, timeLeftMs? }` — what the scene reports
  back via `onResult`. On a win, `droidClass` is echoed as `absorbedClass` → the takeover offer
  (Leet-39). A loss is **non-lethal** — costs resources, never ends the run.

## Mini-duel / board-size curve (Leet-38) — implemented

**Goal:** the board grows with sector depth — a small, fast **mini-duel** early, scaling up to
the full guardian-scale board near the Hush. More rows = more contested middle nodes = a bigger,
longer fight.

### The insight

The whole "size" of a duel was already parameterized in `TParadroidFactoryOptions`
(`rows/columns/tileWidth/tileHeight`) — but the **only** values ever passed were the fixed
`DUEL_DIMS`. So the curve is mostly **threading a smaller `rows` through the existing seam**.
Because the board **auto-fits the camera view** during selection/fight (Leet-40, `#viewRect` /
`#fitBoardToViewport`), a smaller grid simply renders larger and centred — no layout work.

### What ships

| Sector                              | 1     | 2   | 3   | 4   | 5      |
| ----------------------------------- | ----- | --- | --- | --- | ------ |
| **rows** (= contested middle nodes) | **4** | 6   | 8   | 10  | **12** |
| **shots / charges** (per side)      | 6     | 9   | 12  | 15  | 18     |

- **`Balance.duelRows(sector)`** (np-config) is the curve: linear from `DUEL_MIN_ROWS` (4) in
  sector 1 to `DUEL_MAX_ROWS` (12) in the last sector. Endpoints stay fixed even if
  `SECTOR_COUNT` changes. This is _difficulty tuning_, so it lives in `Balance`.
- **Shots scale with the board** via `DUEL_SHOTS_PER_ROW = 1.5` in `paradroid.factory.ts`:
  `paradroidFactoryOptions` derives `shots` from the final `rows`, so a 4-row mini isn't
  trivially spammable and a 12-row board isn't starved. At the 8-row default this is the
  original fixed 12 shots, so existing behaviour is unchanged. An explicit `shots` override
  still wins. `#generateShots` now reads `this.#options.shots` (was a hardcoded `12`).
- **`#showDuel`** (run-conductor) computes `rows = Balance.duelRows(currentSector)` and passes
  `{ rows }` as the `paradroidFactoryOptions` override. Columns stay 8 (only rows scale).
- **Debug toolbar:** `S3` / `S5` buttons jump straight to sectors 3 and 5
  (`RunConductorService.debugJumpToSector` → `RunStateStore.setSector`) to eyeball the larger
  boards without playing through.

4 rows is the floor by design — `UpDown*`/`Tripple*` tiles need 3 rows, so a 2-row board would
degenerate to a trivial funnel (see the row-count constraint above). Each step adds 2 rows,
keeping the full constellation palette legal at every size.

### Not yet done (rest of Leet-38)

- **Difficulty curve for the _other_ axes.** `#showDuel` still hardcodes `boardLevel`/`aiLevel`
  to `'normal'`. A `Balance` curve keyed by **sector (+ encounter type)** that scales the tile
  palette + changer/autofire rates + AI skill would harden duels with depth beyond just size,
  mirroring `Balance.sector(n)` / `interceptChance`. Size (rows) and skill (palette/AI) are
  **orthogonal** — a deep sector can throw a _hard_ board _and_ more rows.
- **Per-encounter sizing.** Today every duel in a sector is the same size. If en-route
  skirmishes should be smaller than planet takeovers _within_ a sector, add a `scale` to
  `DuelLaunch` that biases the row count down — and decide whether a mini caps class absorption.
