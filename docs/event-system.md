# Leet Hunt — Event System Spec

> Companion to `game-design.md` (the GDD). The GDD §4 _Events_ / §6 _UX_ hold the **what and why**;
> this doc holds the **shape and wiring** — the data model, content pools, planet-arrival flow, and
> the dialog UI. Implementation-aware: it names the existing code it builds on. It is the structured
> destination for the raw `AI.md` brainstorm, which is consumed into it event by event (§10).
>
> Maps to GDD §7 **Phase 1** ("Event system v1"); a future `Leet-<n>` will track the build.

## 1. Purpose & scope

When the ship lands on a (non-rim) planet, an **event** fires: a short, illustrated decision tree
that touches the run's state and occasionally hands off to a game (dungeon/duel). This spec covers
the **full vertical slice**:

- the **data model** events are authored in (§3) and the rules for authoring them (§4);
- how events are **pooled and selected** on arrival (§5);
- the **arrival → dialog → choice → outcome → effects** flow (§6) and its UI (§7);
- how outcome **effects** apply and hand off to other systems (§8), including what is real now vs. stubbed;
- a fully-worked example transformed from `AI.md` (§9) and the migration plan for the rest (§10).

Out of scope (shares the model, specced elsewhere): **en-route** events (intercepts in empty space),
**boarding**, and **shops**. The `AI.md` pirate/station pieces are en-route/boarding seeds — §10 tags them.

## 2. Where it sits (architecture)

Events fire from the star map, so the system lives in `np-space-map`, mirroring the patterns the
planet-info feature already established. Move the data/resolver into `np-phaser` only when a second
consumer appears (per GDD §7 backlog).

```
libs/np-space-map/src/lib/
  events/
    event.model.ts          # the types in §3 (PlanetEvent, Question, Answer, Outcome, Effect, Requirement)
    event.validate.ts       # the invariant checks in §4 (pure; unit-tested)
    event.pool.ts           # core pool + per-sector pools (content as typed data)
    event.resolve.ts        # resolvePlanetEvent(...) — seeded pick from eligible pool (§5)
    content/                # one file per event as it migrates out of AI.md (§10)
      grass-alien-encounter.event.ts
      ...
  ui/event-dialog/          # mirrors ui/planet-info/ — the HTML overlay (§7)
    event-dialog.component.ts|html|scss
  space.events.ts           # + PLANET_ARRIVED, EVENT_RESOLVED (§6)
```

**Patterns reused (don't reinvent):**

- _Phaser↔Angular bridge_ — `PlanetInfoComponent` (`ui/planet-info/planet-info.component.ts`):
  subscribe to `StageService.initialized$`, listen on `game.events`, drive an OnPush `signal`.
  The dialog adds the reverse direction (emit the result back on the same `game.events`).
- _Data + pools + seeded pick_ — `generatePlanetInfo(rng)` + `PLANET_INFO_DATA`
  (`planet/planet-info.ts`, `planet/planet-info.data.ts`): typed shape, content in pools, a seeded
  `NPRng` so the same planet yields the same result.
- _Arrival hook_ — `NPSpaceMap.#onArrived(target)` (`space/np-space-map.ts:226`): today it handles
  rim-bail and snapback then refreshes state. The normal-planet branch is the empty slot the event
  fires from (§6).
- _Front pushback_ — `reality.ts` (`sweepTo`) + `NormalityFront.advance()`: the `front` effect (§8)
  drives these; the GDD already foresees distortion-battery pushback (§4).

## 3. Data model

```ts
type SectorId = 'home-reach' | 'frozen-drift' | 'ember-belt' | 'veiled-nebula' | 'long-quiet';
type CrewMember = 'mom' | 'dad' | 'grandma' | 'grandpa' | 'sibling';
type Tone = 'good' | 'neutral' | 'bad';

/** A planet event: a scene-setting intro wrapping a question tree. The unit of authoring & pooling. */
interface PlanetEvent {
    id: string; // stable, kebab-case, unique (also the migration key, §10)
    intro: string; // scene-setter, shown once on arrival
    root: Question; // the first decision
    sector?: SectorId; // pool membership; omit = core pool (eligible in any sector)
    weight?: number; // relative draw weight within its pool (default 1)
    gate?: Requirement; // event only enters the pool if the run meets this (omit = always)
}

/** Exactly three answers, internally ordered good | neutral | bad. */
interface Question {
    prompt: string;
    answers: [Answer, Answer, Answer];
}

interface Answer {
    choice: string; // the button label the player sees
    tone: Tone; // INTERNAL tag — never rendered (GDD §4)
    gate?: Requirement; // gated answer (crew/pet/item/flag) — GDD §4 "gated answers"
    cost?: Effect[]; // stake paid the moment this answer is chosen, before its follow-up/outcome (§4/§8)
    // Exactly one of the next two (invariant, §4):
    followUp?: Question; // branch one level deeper — recursion allowed (flexible depth)
    outcome?: Outcome; // ...or resolve here
}

interface Outcome {
    resultText: string; // narrative shown after the choice
    effects: Effect[]; // [] = pure flavour, no state change
}

/** What an outcome does to the run. Applied in order (§8). */
type Effect =
    | { kind: 'resource'; hull?: number; heart?: number; marbles?: number } // signed deltas
    | { kind: 'item'; grant?: string; take?: string } // inventory ids
    | { kind: 'spawnGame'; game: 'dungeon' | 'duel'; launch: ModeLaunch } // hand-off (Leet-29)
    | { kind: 'openRoute'; to: string } // reveal a map connection
    | { kind: 'front'; advance: number } // <0 = distortion-battery pushback
    | { kind: 'flag'; set: string }; // run-scoped story/state flag

/** Unlock condition for an event entering its pool, or for a gated answer. */
type Requirement =
    | { kind: 'crew'; member: CrewMember } // rescued & aboard
    | { kind: 'item'; id: string } // in inventory
    | { kind: 'petClass'; atLeast: number } // robo-pet class 001..999 (Paradroid)
    | { kind: 'flag'; set: string }; // a flag previously set this run

// `ModeLaunch` is the mode-result contract from BACKLOG Leet-29 (duel grid/AI level, dungeon objective…).
// Imported, not redefined here, so events and the run state machine speak one launch vocabulary.
```

**Notes**

- `followUp` recurses through `Question`, not `PlanetEvent` — a nested node needs no `id`/`intro`/pool
  metadata. This is the tightening of your "fixed-3, flexible depth" pick: always three answers, depth
  driven by recursion, no hard cap.
- `tone` is explicit (not implied by index) so the **presentation order can differ from tone order**
  (§4) — otherwise players learn "the good choice is always first."

## 4. Authoring rules

1. **Exactly three answers** per question. Tones are always one each of good/neutral/bad; the trees in
   `AI.md` already think this way.
2. **Tone is invisible.** Never render it, never colour by it. It exists for authoring balance and
   analytics only.
3. **Presentation order ≠ tone order.** The dialog renders answers in a fixed _non-tonal_ order
   (authored deliberately mixed, or shuffled with a per-event seed). Pick one and keep it consistent
   (recommendation: author mixed; deterministic and reviewable).
4. **Each answer is terminal XOR a branch.** Exactly one of `outcome` / `followUp` is set.
   `event.validate.ts` asserts this (and the 3-answer rule, and `id` uniqueness) — pure, unit-tested
   like `normality-front.spec.ts`.
5. **Depth is flexible but earns its keep.** Most events resolve at depth 2 (root → follow-up →
   outcome). Go deeper only when a branch genuinely wants it; deep trees cost writing and balancing.
6. **Gated answers** carry a `gate` and surface only when unmet-state allows. Default presentation:
   **shown but locked**, with the requirement as the reason ("Mom reads the star chart…") — this
   advertises crew value (GDD §4). A `hidden` variant is an open question (§11).
7. **Effects are signed deltas / explicit ids**, never prose-encoded. The narrative lives in
   `resultText`; the mechanics live in `effects`. (This is the `AI.md` `reward: string` → structured
   transform.)
8. **A `cost` is the answer's _stake_** — `Effect[]` applied the instant the answer is chosen, before its
   follow-up or outcome (§8). It models a risk/commitment trade: spend resources to take a branch, then
   its outcome decides the payoff (e.g. _ram the derelict_ → `cost: [{resource, hull: -2}]`, then the
   branch's outcomes pay out marbles — sometimes big, sometimes a dud, so the spend is a real gamble).
   Costs are normally negative `resource` deltas; keep `front`/`spawnGame` in outcomes, not costs.
   A `cost` is independent of the terminal-XOR-branch rule — an answer may carry a cost _and_ a
   follow-up, or a cost _and_ an outcome.

## 5. Content pools & selection

- **Core pool** — events with no `sector`, eligible anywhere (GDD §5: the space whale, the Enchanted
  Nebula, everyday-distortion pieces). Budget ~10.
- **Sector pools** — events tagged with a `sector`, themed to its biome and grey level (Carnival &
  Dance-Off → `veiled-nebula`). Budget ~5 per sector.
- **Eligible set on arrival** = `core ∪ sector(current)` — **implemented**: `resolvePlanetEvent(sector, seed)`
  (`event.pool.ts`) draws from `CORE_EVENTS` + `SECTOR_EVENT_POOLS[sector]`, keyed by the run's current
  sector (from the np-state balance model). Still deferred: filtering by `gate` against the run context, and
  subtracting events already fired this run (no-immediate-repeats) — both need richer run context first.
- **Selection** = seeded pick: `new NPRng(\`event-${sector}-${seed}\`).item(eligible)`— same seed strategy as`generatePlanetInfo`, so a planet's event is stable if re-surveyed and reproducible for tests. (`weight` is
  not yet applied.) Each planet fires **one** event on arrival.
- Every non-rim planet fires an event; "shop" / "pure gain" planets are just events whose tree is
  shallow (a single question, or outcomes with `item`/`resource` effects). Rim suns bail — no event.

## 6. Arrival flow

Extends `space.events.ts`:

```ts
PLANET_ARRIVED         = 'npPlanetArrived',         // payload: { event: PlanetEvent; planet: string }
EVENT_CHOICE_COMMITTED = 'npEventChoiceCommitted',  // payload: { id: string; cost: Effect[] }
EVENT_RESOLVED         = 'npEventResolved',          // payload: { id: string; path: Tone[]; effects: Effect[] }
```

1. **Trigger.** In `NPSpaceMap.#onArrived(target)`, after the rim-bail and snapback checks, the
   normal-planet branch: set an input lock (`#inEvent = true`, gating jumps/drag like `#frozen` does),
   call `resolvePlanetEvent(target, runContext, rng)` (§5), and `game.events.emit(PLANET_ARRIVED, …)`.
2. **Dialog opens.** `EventDialogComponent` (§7) catches `PLANET_ARRIVED`, shows the intro + root
   question + three answer buttons.
3. **Walk the tree (in the component, no Phaser round-trip per step).** Tap an answer → if it carries a
   `cost`, emit `EVENT_CHOICE_COMMITTED` so the stake applies at once; then if it has a `followUp`,
   render that `Question`; if it has an `outcome`, render `resultText` + a Continue button.
4. **Resolve.** On Continue, the component emits `EVENT_RESOLVED` (the chosen `path` of tones + the
   outcome's `effects`) back on `game.events`.
5. **Apply & resume.** The map (or run-state, §8) applies the effects, clears `#inEvent`, deselects,
   and the run continues.
6. **spawnGame exception.** If an effect is `spawnGame`, the dialog closes and instead of resuming the
   map, the system hands off via `StageService.startScene(dungeon|duel, launch)`; on the returned
   `ModeResult` (Leet-29) the run continues on the map. Remaining effects apply after the mode returns.

Bridge note: `PlanetInfoComponent` listens one way (Phaser→Angular). The dialog adds the **reverse**
(Angular→Phaser) by emitting on the same `game.events` emitter — no new channel, same pattern.

## 7. The dialog UI

`EventDialogComponent` — standalone, OnPush, Ionic (`@ionic/angular/standalone`), in
`ui/event-dialog/`, mounted as an HTML overlay above the canvas (GDD §6: "text-heavy surfaces =
HTML/Ionic overlays").

- **State** (signals): `view: 'idle' | 'question' | 'outcome'`, `current: Question | null`,
  `outcome: Outcome | null`. The intro renders on the first question card (`intro` above the root
  prompt); follow-up questions show prompt only.
- **Layout:** a centred card; the map dims but stays visible behind it (the front is the run's tension
  — keep it on screen). Answer buttons full-width, large tap targets (GDD §6 one-finger rule). Outcome
  view: `resultText` + a single Continue button (label adapts: "Continue", or "Begin" for a
  `spawnGame` outcome).
- **Gated answers** (§4 rule 6): rendered disabled with the requirement as helper text.
- **Accessibility:** inherits system text scaling; no tone-colour cues (there is no tone to cue).
- **Tests:** the resolver and validator are pure → vitest (cf. `planet-info.spec.ts`,
  `normality-front.spec.ts`). The component gets a light render/interaction test.

## 8. Effect application & hand-offs

Effects apply **in array order**. An answer's **`cost`** runs through the exact same applier, just at a
different moment: on `EVENT_CHOICE_COMMITTED` when the branch is chosen, _before_ its outcome's effects
(which apply on `EVENT_RESOLVED`). So a cost→gain answer first spends the stake, then pays out. Ownership
and current readiness:

| Effect      | Applied to                               | Status now                                                                                   |
| ----------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `resource`  | run-state Hull/Heart/Marbles store       | **Stub** — store lands with Leet-27. Emit deltas; a stub service holds them, HUD reads them. |
| `flag`      | run-state flag set                       | **Buildable** — a small `Set<string>` on the stub run-state.                                 |
| `openRoute` | the map graph (reveal a connection)      | **Buildable now** — `np-space-map` can add/reveal a line between nodes.                      |
| `front`     | `NormalityFront` / `reality.sweepTo`     | **Buildable now** — pushback path already foreseen (GDD §4 batteries).                       |
| `item`      | inventory                                | **Stub** — no inventory yet; record grants/takes on the stub run-state.                      |
| `spawnGame` | `StageService.startScene` + `ModeLaunch` | **Deferred hand-off** — wire when Leet-29 lands; until then log + no-op.                     |

So the vertical slice is **end-to-end real** for `flag`/`openRoute`/`front` and **stubbed against a
minimal run-state** for `resource`/`item`, with `spawnGame` a logged hand-off. The stub run-state is a
thin root-provided service (Hull/Heart/Marbles numbers, an item set, a flag set) that Leet-27 later
replaces — events code against its interface, not its implementation.

## 9. Worked example — "Alien Encounter" (from `AI.md`, grass planet → Home Reach)

A faithful transform of the `AI.md` "Alien Encounter" tree: good = with a friend, neutral = whole
crew, bad = alone — each with its own three-way follow-up. Prose → typed; the implied stakes →
`effects`.

```ts
// libs/np-space-map/src/lib/events/content/grass-alien-encounter.event.ts
export const grassAlienEncounter: PlanetEvent = {
    id: 'grass-alien-encounter',
    sector: 'home-reach',
    intro:
        'A green world — actual grass, impossible and yet. Scanners catch faint life. You set down at ' +
        'the edge of a meadow that has no business existing this far out.',
    root: {
        prompt: 'Who heads out with you?',
        answers: [
            {
                choice: 'Take one friend from the crew',
                tone: 'good',
                followUp: {
                    prompt: 'You pick your most adventurous crewmate. The meadow rolls out ahead — which way?',
                    answers: [
                        {
                            choice: 'Follow the worn trail',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'The trail winds through fields thick with creatures neither of you can name. ' +
                                    'You fill a sample case and head back grinning.',
                                effects: [
                                    { kind: 'resource', marbles: 12 },
                                    { kind: 'item', grant: 'xeno-samples' },
                                ],
                            },
                        },
                        {
                            choice: 'Cut off-road into the unknown',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'Caves, a cold river, a scramble over wet rock. Hairy in places, but you both ' +
                                    'make it back with a story and a scrape or two.',
                                effects: [{ kind: 'resource', heart: -1, marbles: 8 }],
                            },
                        },
                        {
                            choice: 'Climb for the summit view',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'Slope turns to cliff, then to ice. You turn back battered, the view unearned.',
                                effects: [{ kind: 'resource', heart: -2 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Bring the whole crew',
                tone: 'neutral',
                followUp: {
                    prompt: 'Everyone spills out and splits to cover ground. How do you run it?',
                    answers: [
                        {
                            choice: 'Keep constant contact',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'Chatter on every channel — finds pooled, dangers called early. A clean, thorough sweep.',
                                effects: [
                                    { kind: 'resource', marbles: 10 },
                                    { kind: 'flag', set: 'grass-surveyed' },
                                ],
                            },
                        },
                        {
                            choice: 'Work as one team, one goal',
                            tone: 'neutral',
                            outcome: {
                                resultText:
                                    'Slower, but solid. You leave with steady hands and a little to show for it.',
                                effects: [{ kind: 'resource', marbles: 6 }],
                            },
                        },
                        {
                            choice: 'Let them compete for the best find',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'It turns into a race. Someone takes a tumble in the bragging, and the haul suffers.',
                                effects: [{ kind: 'resource', heart: -1, marbles: 3 }],
                            },
                        },
                    ],
                },
            },
            {
                choice: 'Go alone',
                tone: 'bad',
                followUp: {
                    prompt: 'Quiet — just you and the grass. Then something shifts at the treeline.',
                    answers: [
                        {
                            choice: 'Approach the creature watching you',
                            tone: 'good',
                            outcome: {
                                resultText:
                                    'Tentacles, too many eyes, a sound like a half-remembered tune. It tilts its head — ' +
                                    'and decides you are a friend.',
                                effects: [
                                    { kind: 'item', grant: 'meadow-charm' },
                                    { kind: 'flag', set: 'met-meadow-thing' },
                                ],
                            },
                        },
                        {
                            choice: 'Dig at the glint in the soil',
                            tone: 'neutral',
                            outcome: {
                                resultText: 'A buried trinket, humming and warm. Worth something to someone.',
                                effects: [{ kind: 'resource', marbles: 9 }],
                            },
                        },
                        {
                            choice: 'Wander further in',
                            tone: 'bad',
                            outcome: {
                                resultText:
                                    'You lose the ship, then the light. By the time the pet finds you, the meadow has ' +
                                    'taken its toll.',
                                effects: [
                                    { kind: 'resource', heart: -2 },
                                    { kind: 'front', advance: 1 },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    },
};
```

## 10. Content & migration

`AI.md` is **fully consumed and retired**. The flow: brainstorm → outline in `event-content.md` → typed
file → `event.pool.ts`. With sector context now live, **planet events graduate straight to a per-sector
typed pool** (`events/content/sectors/<sector-id>.events.ts`); only the en-route/boarding seeds remain
catalogued in `event-content.md`.

| Event                                                  | Pool            | Status                                                    |
| ------------------------------------------------------ | --------------- | --------------------------------------------------------- |
| Alien Encounter (grass)                                | `home-reach`    | ✅ coded · `grass-alien-encounter.event.ts` (§9)          |
| Space Whale, Zeebo the guide                           | core            | ✅ coded · `space-whale.event.ts`, `zeebo-guide.event.ts` |
| Per-sector pools (~25 each)                            | all 5 sectors   | ✅ coded · `content/sectors/<sector-id>.events.ts`        |
| Enchanted Nebula, Celestial Dance-Off, Cosmic Carnival | `veiled-nebula` | ✅ coded · in `veiled-nebula.events.ts`                   |
| Black Hole Dilemma                                     | core/en-route   | 📝 catalogued (en-route trigger)                          |
| Space Pirates, Distress Signal, Abandoned Station      | en-route        | 📝 catalogued (en-route trigger)                          |
| Cargo-Ship Boarding                                    | boarding        | 📝 catalogued (boarding mode)                             |

`event.pool.ts` keys `SECTOR_EVENT_POOLS` by `SectorId` (the np-state balance model) and adds `CORE_EVENTS`;
`resolvePlanetEvent(sector, seed)` picks from `core ∪ sector(current)`. Each of the five sectors has ~25
typed events (validated by `event.pool.spec.ts`), many using the answer-level `cost` stake (§4 rule 8).
En-route/boarding events stay catalogued until their
triggers land — see **`event-content.md` → Implementation plan** for what gates what and the effect work each
still needs.

## 11. Open questions

- **Gated-answer presentation:** shown-locked-with-reason (advertises crew value) vs. hidden until
  eligible. Default = shown-locked (§4 rule 6); revisit when crew abilities exist (GDD §4).
- ~~**Answer order**~~ — **resolved:** answers are stored good/neutral/bad but **displayed shuffled**
  per question (`shuffle.ts` → `EventDialogComponent.#showQuestion`), so tone is never positional.
- **Stub run-state shape:** finalise the minimal Hull/Heart/Marbles/items/flags interface here, or wait
  for Leet-27 and code events against a placeholder? Leaning: define the thin interface in this slice so
  effects have something real to hit; Leet-27 implements it.
- **Repeat policy across runs:** "no repeat this run" is set (§5). Whether fired events are suppressed
  across runs ties to meta-unlocks (GDD §4) — defer.
- **`spawnGame` return semantics:** do post-`spawnGame` effects always apply, or can a lost duel/dungeon
  cancel them? Decide with the Leet-29 result contract.
