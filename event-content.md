# Leet Hunt — Event Content Catalog & Plan

> Companion to `event-system.md` (the data model & wiring) and `game-design.md` §5 (the pool budget).
> This is the **content** doc: every event lives here first as a code-ready outline, then graduates to a
> typed file in `libs/np-space-map/src/lib/events/content/`. It replaces the raw `AI.md` brainstorm
> (now retired). The runtime pipeline is live and **sector-aware**: each sector now has a typed pool of
> ~10 events in `content/sectors/<sector-id>.events.ts`, selected on arrival by `resolvePlanetEvent(sector,
> seed)` from that sector's pool plus the small core pool. Planet/core events graduate straight to those
> files; the remaining seeds (en-route, boarding) stay catalogued here until their triggers land (see
> **Implementation plan**).

## How to read an outline

Each event is the `PlanetEvent` shape from `event-system.md` §3, compressed:

- **Pool / Kind** — which pool it joins (`core`, a sector id, `en-route`, or `boarding`) and the mode.
- **Q:** a question; its three answers are tagged **good / neutral / bad** (internal — never shown, and
  displayed shuffled, §4). An answer either **→ Q:** (a follow-up) or **⇒** resolves to an outcome.
- **⇒** outcome: a one-line gist (becomes `resultText`) followed by an **effect sketch** in `[...]`.
  Effects use the §3 kinds; **numbers are deferred to code time** (tune against the economy).

**Effect key:** `marbles±` `heart±` `hull±` `item:grant/take` `flag:x` `openRoute:x`
`front±` (− = distortion-battery pushback) `spawnGame:duel|dungeon`.

**Answer `cost` (the stake):** an answer may carry a `cost` — effects (normally negative `resource`
deltas) spent the *moment it's chosen*, before its follow-up/outcome (`event-system.md` §4/§8). Models
a risk/commitment trade: pay to take a branch, then its outcome decides the payoff (ram for hull, then
gain marbles). Many sector events now use it for "play safe vs. gamble" choices.

---

## Status legend

- ✅ **Coded** — typed file exists and is pooled.
- 📝 **Catalogued** — outline below, not yet typed (blocked or not-yet-scheduled; see plan).

| Event | Pool | Kind | Status |
|-------|------|------|--------|
| Alien Encounter (grass) | `home-reach` | planet | ✅ `grass-alien-encounter.event.ts` |
| Space Whale | core | planet | ✅ `space-whale.event.ts` |
| Zeebo the guide | core | planet | ✅ `zeebo-guide.event.ts` |
| **Per-sector pools (~25 each)** | all 5 sectors | planet | ✅ `content/sectors/<sector-id>.events.ts` |
| Enchanted Nebula | `veiled-nebula` | planet | ✅ in `veiled-nebula.events.ts` |
| Celestial Dance-Off | `veiled-nebula` | planet | ✅ in `veiled-nebula.events.ts` |
| Cosmic Carnival | `veiled-nebula` | planet | ✅ in `veiled-nebula.events.ts` |
| Black Hole Dilemma | core | space/en-route | 📝 |
| Space Pirates (attack) | en-route | space | 📝 |
| Distress Signal | en-route | space | 📝 |
| Abandoned Station | en-route | space | 📝 |
| Cargo-Ship Boarding | boarding | boarding | 📝 |

The five sector pools are typed and live (`home-reach`, `frozen-drift`, `ember-belt`, `veiled-nebula`,
`long-quiet` — ~25 events each, validated by `event.pool.spec.ts`). The three veiled-nebula outlines below
were graduated into `veiled-nebula.events.ts`; the rest of each sector's events were authored straight to
their typed file (with the `/story-teller` skill) and aren't re-catalogued here. What remains catalogued
below is the **en-route / boarding** material, still gated on its trigger.

---

## Planet & core events

### enchanted-nebula — Enchanted Nebula
- **Pool:** `veiled-nebula` · **Kind:** planet
- **Intro:** A nebula that hums with colour and intent — the kind of place that is clearly *more* than gas.
- **Q: How do you approach the Enchanted Nebula?**
  - **good** "Sail right in to explore" → **Q: A sentient cloud of energy drifts up. What do you do?**
    - good "Hail it with the ship's tech" ⇒ it shares ancient knowledge, a ship upgrade `[item:grant, flag:nebula-friend]`
    - neutral "Watch and analyse it" ⇒ you harness its energy to tune the ship `[marbles+]`
    - bad "Try to bottle a sample" ⇒ it recoils, lashing the hull `[hull−]`
  - **neutral** "Hold off and just survey it" → **Q: The data resolves into…**
    - good "Rare cosmic phenomena, logged" ⇒ valuable records `[marbles+]`
    - neutral "Traces of an old civilisation" ⇒ a lead worth following `[flag:nebula-ruins]`
    - bad "Changes you can't explain" ⇒ unsettling, inconclusive `[flag:nebula-unease]`
  - **bad** "Steer well clear" ⇒ you give the nebula a wide berth; nothing gained, nothing lost `[]`

### celestial-dance-off — Celestial Dance-Off
- **Pool:** `veiled-nebula` · **Kind:** planet
- **Intro:** A drifting stage of light where a hundred species are mid-competition. A judge beckons your crew up.
- **Q: Do you join the Celestial Dance-Off?**
  - **good** "Sign up, all in" → **Q: What's your style?**
    - good "Old-Earth moves" ⇒ a showstopper; the crowd showers you with prizes `[marbles+, item:grant]`
    - neutral "Alien fusion" ⇒ new friends from three galaxies `[flag:dance-allies]`
    - bad "Invent something cosmic" ⇒ a glorious mess; mild embarrassment, small tip `[marbles+ (small)]`
  - **neutral** "Watch from the floor" ⇒ a fun night, a few marbles tossed your way `[marbles+ (small)]`
  - **bad** "Heckle and bail" ⇒ you sour the room; the welcome here cools `[flag:dance-snub]`

### cosmic-carnival — Cosmic Carnival
- **Pool:** `veiled-nebula` · **Kind:** planet
- **Intro:** A carnival strung across the void — barkers, rides, and a midway that goes on too far to see.
- **Q: How do you take the Cosmic Carnival?**
  - **good** "Dive into the fun" → **Q: First stop?**
    - good "The Warp Whirl ride" ⇒ a thrill and a winner's token `[marbles+]`
    - neutral "The Mirror Maze" ⇒ you find the centre, and a small prize `[item:grant]`
    - bad "The Plush Parade games" ⇒ rigged; you drop a few marbles before quitting `[marbles−]`
  - **neutral** "Walk it warily, seek a guide" → **Q: Who do you trust?**
    - good "The Fortune Teller" ⇒ a hint that opens a route `[openRoute:carnival-tip]`
    - neutral "Stick with the crew" ⇒ an uneventful, pleasant loop `[marbles+ (small)]`
    - bad "The Wheel of Secrets" ⇒ a secret with a sting `[flag:carnival-debt]`
  - **bad** "Treat it as a trap" → **Q: How do you guard the crew?**
    - good "Hire the Cosmic Guardian" ⇒ paid protection, safe exit `[marbles−, flag:guarded]`
    - neutral "Keep your distance" ⇒ you leave with nothing, lose nothing `[]`
    - bad "March everyone straight out" ⇒ you miss the one real prize here `[flag:carnival-missed]`

### black-hole-dilemma — Black Hole Dilemma
- **Pool:** core · **Kind:** space (fires in deep-space; en-route once that trigger exists)
- **Intro:** A black hole sits dead ahead, swallowing light and patience alike.
- **Q: What do you do with it?**
  - **good** "Investigate carefully" → **Q: Scans turn up…**
    - good "A faint signal — a wormhole?" ⇒ a shortcut opens `[openRoute:wormhole]`
    - neutral "Nothing at all" ⇒ disappointing, but safe `[]`
    - bad "Hostile guardians" ⇒ they swarm you `[spawnGame:duel]`
  - **neutral** "Skirt around it" → **Q: Off to the side you find…**
    - good "A habitable planet" ⇒ a worthwhile detour `[openRoute:hidden-planet]`
    - neutral "Empty space" ⇒ wasted time, nothing more `[]`
    - bad "A rogue asteroid on your line" ⇒ a glancing hit `[hull−]`
  - **bad** "Use it as a shortcut" → **Q: You come out the other side…**
    - good "Intact, somewhere new" ⇒ a long jump for free `[openRoute:far-sector]`
    - neutral "Battered but alive" ⇒ heavy strain on the ship `[hull−− ]`
    - bad "Somewhere worse" ⇒ flung into trouble, the grey gains on you `[front+, spawnGame:duel]`

*(Softened from the AI.md original, which had instant-death leaves — GDD prefers consequence over game-over.)*

## En-route events *(belong to the en-route spec; captured here for content)*

### pirates-attack — Space Pirates Attack
- **Pool:** en-route · **Kind:** ship encounter
- **Intro:** A pirate ship swings into your path, weapons hot, demanding your cargo.
- **Q: Fight, talk, or run?**
  - **good** "Fight" → **Q: Aim for their…** weapons ⇒ disarm + loot `[marbles+, item:grant]` · engines ⇒ stalemate, they let you go `[]` · hull ⇒ you cripple them but it costs you `[hull−]`
  - **neutral** "Negotiate" → **Q: Offer…** money ⇒ bought off `[marbles−]` · goods ⇒ a trade `[item:take, marbles+]` · information ⇒ they refuse and press `[spawnGame:duel]`
  - **bad** "Run" → **Q: Warp to…** a planet ⇒ you hide, shaken `[]` · a star ⇒ clean escape `[]` · random ⇒ lost; the grey closes `[front+]`

### distress-signal — Distress Signal
- **Pool:** en-route · **Kind:** ship encounter
- **Intro:** A distress call: a small ship pinned down by raiders, begging for help.
- **Q: Answer it?**
  - **good** "Wade in to help" ⇒ outcomes scale with the fight — rescue + reward / costly retreat / disaster `[marbles+,item | hull− | hull−−]` *(→ duel when staged: `spawnGame:duel`)*
  - **neutral** "Hang back and watch" ⇒ the raiders break off / drag on / finish the victim `[marbles+ | [] | flag:witnessed-loss]`
  - **bad** "Ignore it and go" ⇒ safe but haunted `[flag:ignored-distress]`

### abandoned-station — Abandoned Station
- **Pool:** en-route · **Kind:** site (reads like a short dungeon when staged)
- **Intro:** A derelict station turns slowly in the dark, airlocks gaping.
- **Q: How do you explore it?**
  - **good** "Search for clues & salvage" ⇒ hidden vault / armed leftovers / nothing but an alarm `[marbles++,item | item, hull− | spawnGame:duel]`
  - **neutral** "Hack the mainframe" ⇒ data trove / firewalls & agents / self-destruct `[item:grant,flag | flag, hull− | hull−−]`
  - **bad** "Leave, look elsewhere" ⇒ a friendly miner / a hostile patrol / empty space `[openRoute:miner | spawnGame:duel | []]`

## Boarding events *(belong to the boarding spec)*

### cargo-boarding — Cargo-Ship Boarding
- **Pool:** boarding · **Kind:** boarding (a ship dungeon; this is the "what do you do once aboard" event)
- **Intro:** You're through the airlock of a Federation freighter. The corridors are quiet — for now.
- **Q: Make for the…**
  - **good** "Computer core" ⇒ download intel / wipe their records / trip an alarm `[item:grant | flag | spawnGame:duel]`
  - **neutral** "Cargo bay" ⇒ scan & take the good stuff / open crates blind / spring a trap `[item,marbles+ | item (random) | heart−]`
  - **bad** "Wander the ship" ⇒ the bridge (take it) / the engine room (break it) / get lost `[spawnGame:duel | hull−(theirs)/flag | heart−]`

---

## Implementation plan (future)

The pipeline is done; what's left is **content volume** and **three prerequisites** that gate when each
catalogued event can actually fire. Migrate an outline → typed file only once its prerequisite is met.

### Prerequisites (what unblocks what)
1. ~~**Sector context**~~ — **MET.** Sector generation now exists: `Balance.sector(n)` (np-state) resolves
   each sector's params, the conductor regenerates the map on sector-exit, and `resolvePlanetEvent(sector,
   seed)` draws from `core ∪ sector(current)`. So the five sector pools are live and sector-tagged events fire.
2. **En-route trigger** (Phase 1 "en-route intercepts: enemy flies in") — needed before Space Pirates,
   Distress Signal, Black Hole, Abandoned Station fire. They share the §3 model but hang off the
   *intercept* hook, not `#onArrived`.
3. **Boarding mode** (Phase 4 ship dungeons) — needed before Cargo-Ship Boarding.

### Resolver work — **done for arrival events**
- `resolvePlanetEvent(sector, seed)` picks the eligible set as `core ∪ sector(current)`, seeded per planet.
  Still open (deferred): subtract already-fired-this-run and filter by each event's `gate` (needs the run to
  track fired ids / richer context — event-system.md §5).

### Effect gaps to close (so catalogued effects do something)
- `openRoute` — needs hidden-route infrastructure on the map (reveal a connection / spawn a node).
- `spawnGame` — needs the mode-launch contract (Leet-29) + `StageService` hand-off and return.
- `resource` / `item` / `flag` persistence — currently a stub in `NPSpaceMap`; moves to the run state
  machine (Leet-27). `front` is already wired.

### Definition of done (per event)
Typed against §3 · effect numbers tuned against the economy · passes the `event.pool.spec` validator ·
added to the correct pool · (sector/en-route/boarding events) wired to the right trigger.

### Cadence & volume
- **Core planet events:** code anytime; they go live immediately.
- **Sector events:** each sector now ships a typed pool of ~25, authored straight to its file with the
  `/story-teller` skill — many using the answer-level `cost` stake (cost→gain "gamble" events).
- **Target (GDD §5):** ~10 core + ~5 per sector was the v1 floor; content has grown well past it. Live now:
  **127** — 2 core (space whale, Zeebo) + grass, plus ~25 per sector across all five (home-reach,
  frozen-drift, ember-belt, veiled-nebula, long-quiet). Remaining catalogued seeds (en-route / boarding)
  are gated on their triggers.
