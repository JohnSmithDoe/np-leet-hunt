# Leet Hunt — Game Design Document

> Built section by section with the `/game-designer` skill. All sections are designed;
> §8 Open questions is the living parking lot.

## 1. Overview

**Elevator pitch.** Leet Hunt is a whimsical space roguelite about a little kid who has been
robbed of the five things that matter most. Reality has been distorted — which means
_everything is possible_ — and it is closing in. With a loyal crew and a trusty spaceship, the
kid jumps planet to planet across five sectors to take back what was stolen, before reality
catches up.

**Genre.** 2D mode-mixing space roguelite: star-map travel with narrative events, roguelike
planet/ship exploration, and Paradroid-style circuit duels as the encounter mechanic.

**Structure.** Run-based. One run is the attempt to clear all five sectors before the timer
(reality) catches up; death or timeout ends the run. Selected progress persists between runs
(robo-pet evolution, unlocked events, story pieces — specifics in §4 Systems). Alongside the run
sits a **clockless companion game** — a turn-based grey-fight where you take turns beating back the
grey that has crept aboard, freeing a cat per location and coloring the ship room by room (§4); its upgrades
stay walled inside it, so the only thing it changes elsewhere is your ship's look.

**Platform.** Web first; iOS/Android via Capacitor. Mouse and touch.

**Audience.** Roguelite/indie enthusiasts — players who know FTL and Pixel Dungeon and expect
depth, build variety, and meaningful failure. Sessions respect adult time budgets: a sector in
a sitting, a run in an evening or two.

**Tone.** Warm with a melancholy core. The surface is playful, mystical, and pop-culture-flavored;
underneath, the stolen things and the closing reality carry real emotional weight (Inside Out,
Spiritfarer). Funny moments are allowed to sit next to quiet ones.

**Comparables.** FTL: Faster Than Light (overworld, events, run pressure) · Shattered Pixel
Dungeon (exploration depth) · Paradroid, C64 (the circuit duel) · Inside Out (emotional frame).

**Design pillars.** Every later design decision must serve these four; when two conflict, the
conflict gets resolved here first:

1. **Everything is possible** — "it's not real" is the creative license. Any planet, creature,
   or pop-culture mashup is allowed; variety beats consistency.
2. **Choices have weight** — the good/neutral/bad event trees are the heart. Decisions visibly
   change the run, the crew, and the ending.
3. **Three games in one** — travel, crawl, duel. Each mode stays simple on its own; the mix
   keeps a run fresh. _(A fourth — the turn-based grey-fight, §4 — sits deliberately_ outside _the
   run: clockless, its upgrades walled inside it so it grants no run power. Where a run_ flees _the
   grey under the clock, this is the one place you_ attack _it — a counterpoint that complements the
   three without diluting them. The pillar holds inside a run; the colony is the off-ramp.)_
4. **The clock is always ticking** — reality closing in shapes every decision: one more detour,
   or push on? Tension is a constant companion, not a panic switch.

## 2. Story & world

**Premise.** An ordinary house, an ordinary family: the kid, their sibling, mom and dad,
grandma and grandpa. One evening a **grey veil** washes over the house — not a storm but a
_tide_ of pure ordinariness that drains color, play, time, and memory as it rolls. Everything it
touches goes quiet and grey; and as the tide pulls back out it **drags the family with it**,
their greyed shapes dwindling away into the dark. The kid should have gone too — but the kid was
mid-play, and **play is the one thing the grey can't take** (the _gift of play_, like the gift of
gab). The kid and the robo-pet are left in a greyed-silent house, the last color in the world.

Where the grey meets that stubborn play it doesn't flatten — it **refracts**. The garage warps
into a hangar (bigger on the inside); the toy ship on the shelf is suddenly a real one; and a
bright channel of **distorted, everything-is-possible space** tears open along the exact heading
the tide took the family. The kid guns the ship up that channel after them — the channel is the
star map, and the hunt is on. The distortion isn't a second thing that happened to the house: it
is **play bending the grey**, and it lasts exactly as long as the kid can hold it.

**Why the kid was spared.** The gift of play — concretely, the kid was mid-play when the grey
came, beneath its notice and immune to its drain. This is the spine of the premise, not a
mystery: play is what the grey can't normalize, so the one player in the house is the one
survivor. _(Formerly a §8 open question; now canon — what stays open is only how much of that
night gets dramatized through unlockable story pieces, §4.)_

**The protagonist.** Brother or sister — chosen at run start. The unchosen sibling becomes the
fifth captive, so the family roster is always five. The choice is identity plus a small
mechanical start difference (robo-pet temperament — specified in §4); world and story are
otherwise identical.

**The antagonist — the Hush.** A grey, quiet figure you forget the instant you look away. He
doesn't collect, gloat, or hate — he _tidies_: where the Hush passes, color, play, time, and
memory drain back to grey ordinary. He **is** the normality closing in (the timer — below).
The distorted reality is a bright wound in the grey, and **play is what keeps the wound open** —
the one thing the Hush cannot normalize. That is the loophole the whole game turns on: something
as vivid and beloved as a family can't be cleanly greyed in an instant — caught between the tide
and the kid's refusing play, the family are left as **stakes on the table**. By play's own rule,
_what the grey takes through play can be won back through play._
So every dungeon, duel, and guardian fight is the kid forcing the Hush onto the one ground where
he's beatable. Dungeons are pockets where play still rules and the grey only seeps in at the
edges; the circuit duel is the kid's takeover verb; the five guardians are play-champions the
Hush has greyed and bound to hold the gates.
_(Reference DNA: Momo's Men in Grey — stolen time, drab efficiency — crossed with Doctor Who's
The Silence — forgotten the moment you look away. The Weeping-Angel "only-moves-unseen" flavor
stays in the toolbox for his servants.)_

**The forgetting.** The world forgets the Hush the instant it looks away — which is why no one
has ever stopped him, and why every run is a fresh _telling_. The robo-pet is the one memory
immune to it: it alone remembers the other tellings (§4) **and keeps the bearing the family were
taken on**, holding the thread the world itself would drop. The kid hunts a foe nobody else can
hold in mind, guided by the one companion who can.

**The five captives.** Mom, dad, grandma, grandpa, and the sibling — swept out on the grey tide
and scattered down the channel, one held behind each of the five sector guardians. They aren't
gone: the grey hadn't finished them when play tore the channel open, so their not-yet-faded color
leaves **faint markers** along the route — the trail the kid follows, the robo-pet reads. Each
rescued member joins the ship as crew with a gameplay role (abilities specified in §4): grandpa
tinkers upgrades, grandma heals after dungeons, mom opens routes, dad boosts the ship, the
sibling assists in duels. The rescue order the map allows shapes the run.

**The hunt — up the grey toward its source.** The channel runs _downstream of the tide_: deeper
means greyer, older, sadder, and closer to the Hush's own still quarter, where the most-prized
captive is kept (§5). You sail toward the source of the grey to win the family out of it — while
the channel collapses behind you, the same grey closing back in.

**The Hush closes in (the timer — one clock, made personal).** He doesn't chase; he _seeps_ —
greying the channel behind the ship one layer at a time (the _normality front_ — mechanics in
§4). There is no separate countdown: **the front is the grey reaching the kid himself.** The gift
of play bought a buffer, not immunity — a head start up the channel, not safety. Where the front
has passed, the distortion's color and possibility are gone: events, routes, and loot, normalized
away. When it reaches the ship, the distortion's whole infrastructure — hangar, channel,
sectors — was never there, and the run ends: whoever was won back is home and safe; whoever
wasn't is lost _in this telling_. By the next telling the Hush has forgotten the kid too, and it
begins again.

**Endings.**

- **Partial rescue** — the Hush reaches the ship first: a bittersweet epilogue with the won-back
  members home; empty chairs for the rest.
- **Full rescue** — all five won back before the grey arrives: the way to the Hush himself opens.
  The bonus/true final fight, with the whole family aboard (their combined help is the mechanical
  payoff — §4).
- **True ending** — beat the Hush at the one game he can't rig. The hook ties to the forgetting:
  he can only be reached by being _remembered_ — named, given a face. Whether that unmakes him or
  redeems a thing that starved on being forgotten is a writing decision, parked in §8.

**Flavor guideline — Momo's grey meets Doctor Who's Silence.** The house style is stolen-time
drabness (Momo's Men in Grey) crossed with forget-when-unseen dread (the Silence), kept inside
the wider Doctor Who palette the game already loves: bigger-on-the-inside spaces, don't-blink
statues, timey-wimey event flavor, the grey-tide and tractor-steal gags. Pop-culture mashups beyond that are
welcome (pillar 1).

## 3. Core gameplay

**The run loop.**

1. **Hangar** — pick sibling, ship, and loadout (meta-unlocks apply, §4). Launch into sector 1.
2. **Star map** (`np-space-map`) — a sector is a stretch of the channel: a route graph of planets. Travel is
   fire-and-forget: click an adjacent planet to jump; no manual flying. Each jump advances the
   **normality front**, which swallows map nodes behind you — visited or not.
3. **En-route events** — a jump can be intercepted (visualized: an enemy ship flies toward
   yours): a choice-tree event, a ship fight, or a boarding opportunity.
4. **Planet arrival** — the planet's event fires: gain / lose / shop / or one of the
   games — a planet dungeon or a duel.
5. **Sector guardian** — at the sector exit, a game-master stages a set-piece (guardian lair →
   staged duel). Win → family member freed, joins the crew (ability unlocks, §4) → exit gate →
   next, larger and meaner sector.
6. **Run end** — all five rescued before the Hush arrives → the Hush fight (true final).
   Front catches the ship → snap-back ending: rescued members are home safe, the rest are lost
   in this telling. Ship destroyed → run over.

**Two ways out.** The sector's rim is dotted with _boundary suns_ — out-of-the-way exit gates.
Jumping to any surviving sun **bails** the sector at once: you escape the Hush but leave
empty-handed (no rescue, no rim loot). The **guardian** is the _rewarding_ exit — beat its
set-piece to free a family member and advance properly. A run is then a constant pull between
bailing early (safe, poor) and pushing for the guardian while the grey closes (rich, risky).
The suns ring the map's edge and the Hush burns its near-side ones first, so the set of open
exits shrinks the longer you linger. _(Prototype status: bail-suns are in — any rim sun ends the
sector with no reward; the guardian gate is deferred, §7/§8.)_

**The time rule.** The front advances **only on jumps**. Inside the games — dungeons and
duels — the Hush has no purchase: play holds him off, so no front progress. Pressure there is
local instead (dungeon hazards, the duel countdown). All run-level pressure lives in one
readable place: the map. _(The grey-fight colony, §4, sits entirely outside this — a clockless bay
openable any time, mid-run or between tellings; it never touches the front, and nothing happens in
it while you're away.)_

**The duel (`np-paradroid`) is the takeover verb.** Whenever the kid takes something over,
it's a circuit duel — play turned into a weapon:

- Boarding a ship → duel for the bridge.
- Hacking a dungeon door, turret, droid, or locked chest → mini-duel (small grid, short timer).
- Guardian and Hush fights → staged multi-round duels.
  Scale knobs: grid columns/rows, countdown, fx-tile mix, opposing AI strength.

**Dungeons (`np-pixel-dungeon`), scaled by type.**

- **Planet dungeon** — short bite: one objective, 3–7 minutes, optional deeper floors for
  greedy players (more loot, more risk).
- **Boarded ship** — medium: layout reads as a ship; two win conditions — take the bridge
  (duel) or break enough systems to force surrender.
- **Guardian lair** — long set-piece per sector, themed to its game-master, ending in the
  guardian duel.

**Fail states.**

- **Kid downed in a dungeon** → the robo-pet drags them back to the ship: the dungeon's loot is
  lost and the front lurches one node forward. Costly, not fatal.
- **Ship destroyed** → run over.
- **Front reaches the ship** → snap-back ending (partial rescue stands).

**Mode handoff.** `hangar → starmap ⇄ (event | dungeon | duel) → guardian → next sector → … →
the Hush → ending` — matching the existing architecture: the map scenes persist, game modes are
pushed on top and return a result.

## 4. Systems

### Resources

Three meters, one currency, deliberately no fuel (the front already owns travel pressure):

- **Hull** — the ship's health. Damaged by ship fights and bad event outcomes; repaired by
  events, shops, dad, and grandpa. Hull 0 = run over.
- **Heart** — the kid's health inside dungeons. Restored by grandma after dungeons, items, and
  rest events. Heart 0 = downed → robo-pet drags the kid out (§3 fail states).
- **Marbles** — the currency. The distorted world runs on play, and play's tokens are marbles;
  the kid gathers them in a world the Hush is draining — a world steadily losing its marbles.
  Earned from events, dungeons, won duels; spent on shops, upgrades (grandpa), bribes, and duel
  stakes.

### The robo-pet

The kid's companion and the run's emotional anchor — a battered **toy cat** that weathered the grey
beside the kid, woken into its real form (a **robo-cat**) in the hangar on the first run. It is the
literal eldest of the colony's cats: the first scrap of play, patched and scarred by every telling
(its coat shows that history — see Meta-evolution below). The colony's cats are small, new, and
vivid; the robo-cat is the battered original that leads them.

- **Duel avatar.** The pet is what jacks into circuits; every duel is played "through" it.
- **Class absorption (run-scoped).** Beating a stronger droid in a duel offers its class for
  absorption — Paradroid's 001→999 fantasy. Higher class = stronger duel position and better
  dungeon-companion perks. Lost at run end.
- **Dungeon companion.** Scouts, assists, and drags the kid back to the ship when downed.
- **Meta-evolution (the only carried power).** The pet's base form grows slowly across runs,
  small and capped. Each run is a new telling — **the robo-pet is the only one who remembers
  the other tellings.** This is meta-progression and melancholy in one mechanic; the pet's
  appearance shows its history.
- **Sibling difference (resolves §2):** brother and sister start with different pet
  temperaments — one leans protective (faster rescues, defensive duel perks), one leans bold
  (offensive duel perks, braver scouting). Same world, different feel.
- **Keeper of the colony.** The robo-pet is the eldest and leads the grey-fight colony (below) —
  the colony's anchor as it is the run's, and your first permanent helper there.

### The normality front

_Framing (§2): the front is the channel collapsing behind the ship — the grey reaching the kid
himself. The mechanics:_

- **Per-sector.** Each sector is its own map; the front starts fresh at the sector entry and
  advances a tunable number of node-layers per jump. Sectors grow, so the margin shrinks.
- **Swallowed is gone.** Nodes behind the front — visited or not — are normalized: their
  events, loot, and routes cease to exist.
- **Rare pushback.** _Distortion batteries_ (rare loot/event rewards) push the front back one
  node — the distortion is what keeps the adventure alive, and it can be fed.
- **Exits at the rim.** Boundary suns ring the sector edge as bail-exits (leave now, no reward);
  the **guardian gates the _rewarding_ exit** — beating its set-piece opens the gate, frees the
  captive, and advances. Lingering afterwards is allowed but the front keeps advancing per jump,
  burning the near-side rim suns first and thinning the available bail-exits.

### Crew abilities (one per rescued family member)

- **Grandpa — the tinkerer.** Opens a between-jumps upgrade bench: spend marbles on ship/pet
  upgrades without needing a shop planet.
- **Grandma — the healer.** Fully restores Heart after each dungeon; occasionally cooks a meal
  that buffs the next dungeon.
- **Mom — the navigator.** Reveals more of the route graph and uncovers hidden routes
  (shortcuts past the front's reach).
- **Dad — the engineer.** Passive hull regeneration per jump and a damage bonus in ship fights.
- **The sibling — the duel partner.** One assist per duel (e.g. freeze the countdown briefly or
  re-roll a grid row — exact verb tuned in playtesting).
- **Whole-family bonus (the Hush fight).** With all five aboard, all abilities are active and
  the family interferes in the final staged duel on the kid's behalf — the mechanical payoff of
  the true-ending route.

### Events

- **Shape.** Intro → question → exactly three answers; each answer either resolves to an outcome
  or branches to a follow-up question (usually one level, deeper where a tree earns it). Answers are
  internally tagged good/neutral/bad (AI.md trees) — the player never sees the labels, only
  consequences. Full data model, pools, arrival flow, and dialog UI: **`event-system.md`**.
- **Outcomes.** Touch resources (Hull/Heart/Marbles), grant items, spawn one of the
  games (dungeon/duel/fight), open routes, or set story flags.
- **Gated answers.** Crew aboard, pet class, and items unlock extra answer options ("Mom reads
  the star chart…") — systems feeding pillar 2.

### Meta-progression (between runs)

- **Carried power:** the robo-pet's base evolution only — small, capped.
- **Unlocks, not power:** new ships/loadouts in the hangar, new events entering the pool,
  **ship cosmetics** (earned in the grey-fight, below), and **story pieces** — fragments
  revealing the night the grey came (the core reason the kid was spared — the gift of play — is
  canon in §2; its texture and the family's last moments unspool across runs).
- Skill stays king; a fresh player with game knowledge can win run one.

### Holding the Grey — the ship's grey-fight (working title)

A self-contained, **turn-based incremental** living in the ship's bays. A tendril of grey has crept
_aboard_; the kid, robo-pet, and freed cats push it back, bay by bay, in **rounds**. It is **open any
time** (mid-run between jumps, or from the hangar), **clockless**, and its upgrades are **walled inside
it** — the only thing that ever leaves is _cosmetic color on the ship_, so it never touches run balance
or "skill stays king". Where a _run_ flees the grey under the clock, this is the one place you go on the
**offensive** against it: the satisfying-grind counterpoint to the run's tension.

- **The turn.** Each tap is a **turn**, resolved in order: **you strike** the grey filling a bay (tap
  damage, can _crit_) → **your cats strike** alongside you (each freed cat adds its per-turn hit) → **the
  grey regenerates** a little. Net = (your hit + cats' hits) − regen. Damage dealt streams **light** (the
  soft currency). Empty a bay and a denser one condenses; every few bays a **boss-mass** (a hard regen
  wall) gates the next. _All_ damage is gated on a turn — so **waiting does nothing**, which is what makes
  the clockless, anti-Hush promise airtight (below).
- **The round.** A round is a run of turns bounded by your **stamina** (a turn budget). Spend the last
  turn and the round ends; the grey creeps back to bay 1, but everything you _earned_ stays. Between
  rounds you spend **light** on the permanent upgrade web, then start the next round — instantly, stronger,
  deeper. The round is the heartbeat: _push as far as this build allows, bank light, come back harder._
- **Free a cat — beat your record.** A cat is freed not at a boss but when a **single round's total
  damage** crosses its threshold (Scuff early, then escalating). Freeing one is permanent and does
  **both**: the cat **strikes every turn** alongside you _and_ **brings its color to the ship**. So the
  cosmetic payoff — the whole point — is chained directly to getting stronger, i.e. to playing rounds.
  Freeing the frontier cat also **opens the next location** and turns the one you cleared into a
  **reclaimed home** (see Locations). The robo-pet is the eldest and your first striker (§ The robo-pet).
- **Endless rounds, persistent meta (the no-reset rule, reworded).** There is no hard prestige/wipe: the
  **fight** resets each round (bay, grey, stamina), but **upgrades, freed cats, color and light persist**.
  The round reset _is_ the soft-prestige rhythm; the scaling grey is the treadmill. Uncapped on purpose —
  the one uncapped system in a game otherwise strict about caps, safe because it grants no power.
- **Active, never idle (airtight now).** Every point of damage is gated on a turn you take. Nothing ticks
  on a clock, nothing generates while you're away — leave, and the grey simply _waits_. There is no idle
  strategy to discover because there is no time axis to exploit; an autoclicker only burns a round faster.
- **Currencies.** _light_ — streams from fighting, feeds the core upgrade web, cheap and flowing;
  per-location **colored resources** — earned by cultivating a reclaimed home, spent on its depth and its
  cat's evolution; _cats_ — rare, freed at single-round records, permanent strikers, each the key to a
  location.
- **Persists as cosmetics + cats + upgrades.** Saved with the meta, run-independent: ship color (in
  **tiers**), freed + **evolved** cats, upgrade levels, light and per-location resources. This is
  "unlocks, not power" (above) turned into a place you fight for.

**Locations — a colony you build.** The colony isn't one arena; it's a **growing row of locations**, one
per cat, unlocked in order. At any moment there is a single **contested frontier** — the newest location,
where the real turn-based fight happens — and behind it the **reclaimed homes** you've already won. Freeing
the frontier cat (its single-round record) **opens the next location** and flips the one you just cleared
from battlefield to home. The grey is gone there _for good_ — color stays, it never creeps back; that's the
emotional win, and it keeps cosmetic progress forward-only.

A **reclaimed home** changes the verb from _fight_ to _play_: return and the same turn-based loop runs
friendly — each turn a **play-beat** that yields the location's **signature resource** (its color's
essence) and **deepens its color one tier** (a forward-only cosmetic treadmill, never decay). It stays
**active, never idle** — nothing accrues while you're away; resource comes only from visiting and playing.

**Resources are a pull, not a push.** Universal _light_ still funds the core upgrade web, so you're never
blocked; a location's resource funds _that place's_ depth and, above all, **evolving its cat** — richer
coat, more color, a stronger per-turn strike back on the frontier. So "come back later" is a reason to love
a place, not a chore: cultivate your homes → evolve your cats → they hit harder on the frontier → free the
next cat → a new home opens. This is **prestige, reframed**: the cat _evolves_ forever; the location never
_resets_.

**The skill tree — one connected tree that unfolds.** A single tree with **one root** (a basic tap
upgrade); buying a node **reveals its children**, so the tree unfolds as you spend (nothing visible until you
earn it). Nodes level on a geometric cost (≈ ×1.18–1.25/level). Branches by stat family:

- **Damage** — tap strike (flat + %); folds in the regen-cut ("Overwhelm", the old _Hold_ lever).
- **Crit** — _chance × multiplier_ (the active-play thrill: occasional big hits).
- **Cats** — per-turn cat strike (flat + %).
- **Economy** — +light per damage ("Bright Coats", the old _Prism_ lever).
- **Endurance** — +max stamina (more turns per round).
- **Openers** — start deeper (bay _N_).

**The six cats are gate nodes on the central spine.** They are _not_ bought — they **light up automatically
when freed** in combat, and freeing one **reveals its branch** (Scuff→damage, Nona→cats, Glimmer→light,
Blink→regen/endurance, Comet→crit, Tinker→openers/capstone). Since cats free in that order, the spine
unfolds in lockstep: the tree's progression _is_ the game's progression. _(Deepening toward ~100 nodes is a
later tuning job; the spine + branches are the structure.)_

_(Prototype renders the tree as an in-scene draggable Phaser page; the eventual HTML/Ionic catalog intent in
§6 still stands.)_

**The scaling (the heartbeat).** The signature mechanic carries it: the grey _regenerates_, so net per
turn = (your hit + cats' hits) − regen. Per bay _n_, clear-threshold HP grows ≈ ×1.7 and regen ≈ ×1.8, so
your per-turn output periodically falls behind → a **wall** → the round stalls there → spend on the web →
next round breaks through. That gap is the "one more upgrade" pull. **Stage-scaling only** — no
rubber-banding; each new bay is simply tougher, which keeps it tunable. A bay ends in a condensed-grey
**boss** (≈ 8–12× a bay's threshold, a hard regen you must out-hit per turn) → next, fiercer bay.
_(Constants are starting points for playtest, §8.)_ Numbers stay in plain JS doubles — good past 1e300,
far beyond reach — with a suffix formatter (1k / 1m / 1b / 1t / 1sx …) for display; `break_infinity.js`
is held in reserve only if a literally-endless number aesthetic is ever wanted.

**Cats are specialists — each the key to a location.** Each freed cat is a _distinct_ striker, not just
more damage — and each is a scrap of a kind of _play_ the grey couldn't tidy, restoring its own color to
**its location** (its corner of the ship). Collecting them is build variety, paced by single-round damage
records; a freed cat then **evolves** — deeper strike, richer coat, more color — by spending its location's
resource (see Locations). Once the core roster is freed, later records give kittens. Starter roster (names
placeholder):

- **Scuff** — _Force (the Brawler)._ Each turn lands a bonus swipe (multi-hit). Scrappy alley play →
  bold reds/oranges to the hull.
- **Nona** — _Crew (the Matron)._ Multiplies the **whole crew's** per-turn strike, scaling with roster size.
  Herd-the-litter togetherness → warm hearth-gold to the common bay.
- **Glimmer** — _Prism._ ×light gained per clear. Curious, shiny-loving wonder → spectrum sheen on
  the viewports.
- **Blink** — _Hold (the Sentinel)._ Stares the grey down so it heals less: suppresses regen each turn
  (a wink to the Hush's Silence DNA, §2). Still focus → steady teal in the corridors.
- **Comet** — _Burst._ Naps, then erupts: every \_N_th turn lands a massive hit (the boss-breaker).
  Sudden-burst play → flashing accents on the engines.
- **Tinker** — _Wildcard._ Boosts whichever branch you've leveled most (rewards a committed build).
  Inventive builder play → the color you choose, anywhere.

These are play-types, **not** tied to the run's sectors — the colony is its own game, never gated
on run progress. Names + a codex memory each (the robo-pet's record of the scrap of play each cat
is) live in `cat-codex.md`.

**Pacing — slow & deep, in rounds.** Tuned for a long climb across many rounds, not a quick toy: early
rounds are short (few turns, shallow bays); Endurance + Damage + Cats lengthen and deepen them; new
specialist cats and single-round records are the breakthroughs you work toward. The depth lives in _build
and strategy_ (specialist synergies, branch order, how you spend a round's turns), **not** in idle-waiting
— there's no offline generation (above), so "deep" means meaningful breakthroughs, not numbers you wait
out. Cats carry the per-turn output so it never becomes a finger marathon. Still stoppable any time;
nothing decays.

### Difficulty knobs (per sector, rising)

Map size and route density · front speed (layers per jump) · dungeon depth and mob strength ·
duel grid size, fx-tile mix, countdown, and AI · guardian set-piece complexity.

## 5. Content plan

### The five sectors — classic space, increasingly greyed

Classic space biomes carry the run, but the Hush's drain deepens the closer you get to his core
(the _grey gradient_): sector 1 is the most vivid and barely touched — a garden gnome floating
where no gnome should be — while by sector 5 the color is nearly gone, play has all but died, and
the grey is everywhere. The tone curves from familiar to uncanny to old-and-sad.

1. **Home Reach** — green worlds and a suburban nebula; the space right behind the garage.
   Familiar things made strange. Tutorial energy, small map.
2. **Frozen Drift** — ice worlds and still, glittering space. Terrible stillness; the
   don't-blink statues live here.
3. **Ember Belt** — asteroid fields, lava worlds, forge-light. The loud, dangerous middle.
4. **Veiled Nebula** — deep nebula, half-lit, eerie; pop-culture ghosts drift here (the AI.md
   carnival and whale events live in this pool).
5. **The Long Quiet** — the greyest, oldest space: clocks run down, color all but gone, planets
   the Hush has nearly finished tidying away. His own still, grey quarter — where the world's
   stolen time is hoarded and the most-prized captive is kept — lies beyond the last gate. The
   melancholy floor of the game.

### Captive placement

Mom, dad, grandma, grandpa shuffle across sectors 1–4 each run (crew-ability build variety);
**the sibling is always the Hush's most prized piece, held in sector 5** — your duel
partner arrives right before the final duel. Reunion scenes are written order-agnostic.

### The five game-masters (guardians)

Play-champions the Hush has greyed and bound to hold the gates; each lair is a pocket where
their game still rules, and each fight is a staged multi-round duel with a lair gimmick. Beating
one frees the captive — and, for a moment, the champion too:

1. **The Gnome King** (Home Reach) — a garden-gnome general; hide-and-seek rules in his lair.
2. **The Porcelain Matron** (Frozen Drift) — queen of the Angel statues; her court only moves
   when you don't look.
3. **The Dicekeeper** (Ember Belt) — a forge golem casting loaded dice from molten glass; the
   house always wins, until you steal the dice.
4. **The High Scorer** (Veiled Nebula) — a ghost champion haunting a derelict arcade; beat his
   high score, win his stage.
5. **The Unwound** (The Long Quiet) — a run-down clockwork knight, the first thing the Hush ever
   stopped. The saddest fight in the game; his winding key is the gate key.

### Dungeon objectives ("house rules" card on entry)

v1 ships three, each mechanically distinct:

- **Retrieve** — grab the prize, get out (optional deeper floors for greed).
- **Sabotage** — break the distortion siphon; always drops a **distortion battery** (§4).
- **Hunt** — a named mini-boss mob with teeth and loot.

Post-v1 pool: **Rescue** (free a trapped NPC → follow-up events) and **Escape** (collapsing
playroom, shifting exit).

### Enemy roster

- **Map — the Grey Fleet.** The Hush's wardens are a core enemy behavior, not just fights:
  thief drones **tractor-steal an item or marble stash and flee** to feed it to the grey; chase
  and board to reclaim it (plus their cargo). Every boarding is a small mirror of the taking.
  Escort fighters protect them in later sectors.
- **Dungeons.** Wind-up soldiers (slow, relentless) · Angel statues (move only when unseen —
  drives the FoV system) · dice mimics (chests that gamble) · porcelain dolls · arcade ghosts ·
  **stray droids** — duel-able in place: win to absorb their class (§4 pet growth inside
  dungeons). Biome reskins stretch the roster across sectors.

### Event pools

- **Core pool** (any sector): seeded from AI.md — the space whale, the Enchanted Nebula, the
  distress signal, plus new everyday-distortion pieces (the confused farm tractor returns).
- **Sector pools**: a handful per sector matching its biome and distortion level; the Cosmic
  Carnival and Dance-Off belong to the Veiled Nebula.
- **Rough v1 budget:** ~10 core + 5 per sector (35 events), each with three answers and at most
  one follow-up level — sized to be writable by one person.

## 6. UX & presentation

### UI architecture — two worlds, clean split

- **Out-of-run = Ionic/Angular.** Main menu, hangar (sibling, ship, loadout), settings, the
  codex (collected story pieces, robo-pet album/history), run summaries and endings.
- **In-run HUD = Phaser UI scenes** (the established `SpaceUiScene` pattern, one paired UI
  scene per mode): map HUD (hull, marbles, pet class, crew portraits, sector progress, front
  indicator), dungeon HUD (heart, pet, objective), duel HUD (countdown, stakes).
- **Text-heavy surfaces = HTML/Ionic overlays** above the canvas: event dialogs (question +
  three answers, gated answers shown with their requirement — "Mom reads the star chart…"),
  shops, and the dungeon "house rules" card. HTML does text best; Phaser does space best.
- **The grey-fight = a dedicated Phaser scene** (each tap a turn — you and your cats strike, the grey
  heals back; the ship recolors room by room as you reclaim each location) — the purest expression of the color-vs-grey language.
  Reachable any time from the ship hub; the upgrade tree and cosmetics catalog ride on an
  HTML/Ionic overlay like the shops.

### Map UX — a bright channel closing behind you

- Tap a connected planet → jump preview (front advance, visible risks) → tap again to commit.
  Fire-and-forget; no manual flying.
- **The map is the channel.** Distorted space is colorful — the bright wound play tore into the
  grey; everything outside it is desaturated, ordinary night sky. The normality front is the Hush
  himself, the channel **collapsing behind the ship** — a creeping wall of mundane grey eating the
  color, the grey reaching the kid (§2). So the timer is visible poetry, no clock widget needed:
  swallowed nodes turn into boring stars.
- **The family trail.** The captives' not-yet-faded color leaves faint motes strung ahead down the
  channel, brightest toward the next family member (the robo-pet reads them). They point the hunt
  without a quest marker — warm where the front is cold, and they wink out as the grey gains.

### Art direction — an intentional collage

Mixed styles are diegetic: the distortion lets every toy box, era, and genre collide (pillar 1)
— and the Hush is its opposite, a grey that flattens all of it to the same drab. Color and clash
read as alive; grey uniformity is the Hush winning. Rules: one consistent style _within_ each
mode (painted space on the map, pixel art in dungeons, clean tiles in duels); collage _between_
modes is a feature. The grey gradient (§5) reads as rising desaturation and stillness; normality
always reads as drained color. Existing assets stay valid.

### Audio — ambient space score

Atmospheric synth space music with a distinct mood per sector: warm and homely (Home Reach) →
still and glassy (Frozen Drift) → driving (Ember Belt) → eerie and veiled (Veiled Nebula) →
sparse, slow, clockwork-textured (The Long Quiet). Stingers for events, intercepts, and duel
starts; a signature greying SFX — color and sound draining out — for the Hush's intrusions.

### Controls — one-finger playable everywhere

Every interaction works with a single tap or drag: tap-to-jump on the map, tap-to-move on the
dungeon path, tap rows/cells in duels. Desktop adds conveniences, never requirements (WASD in
dungeons, hover previews, hotkeys). Landscape-first on mobile; touch targets sized accordingly.
Accessibility basics from day one: the duel fx colors get color-blind-safe shapes, and HTML
dialogs inherit system text scaling.

## 7. Production phases

No release pressure — this is a private hobby build; phases exist for momentum, and every
phase ends in something playable. Issues keep the `Leet-<n>` convention. Current code state:
the run **spine is in place** (Phase 0 done) — a run FSM, run store, save skeleton, and a fake run that
flows through every phase to an ending and back to the hangar; space-map has travel/zoom/transitions;
paradroid is playable and returns a typed result; pixel-dungeon has generation but open FoV/movement bugs.

### Phase 0 — The Spine ✅ done

Goal: the skeleton every later phase hangs on.

- [x] Workspace on TypeScript strict (+ `noImplicitOverride`/`noImplicitReturns`/strict templates; the
      `no-unsafe-*` lint rules re-enabled now Phaser 4 is TS-native).
- [x] Run state machine (`@shared/np-state`): hangar → sector → (map ⇄ modes) → ending; illegal moves throw.
- [x] Mode-result contract: modes launch with config and report a typed `ModeResult`; the conductor consumes it.
- [x] `StageService` is the sole scene authority (scene groups, sleep/wake/clear) — the scene-stacking quirk is gone.
- [x] Versioned save-file skeleton with a tested migration path.
- [x] _Exit met: a fake run flows end-to-end through placeholder scenes (build/test/lint/e2e green)._

Note: most of the spine landed across commits Claude-16…26 ahead of the tracker; the closing work was
the mode-result contract (Leet-29) and the placeholder scenes wiring the run together (Leet-31).

### Phase 1 — The Map Run _(the old v0.1, with teeth)_

- Sector graph generation: start, exit, guardian node, route density knob.
- Fire-and-forget travel with jump preview; en-route intercepts (enemy flies in).
- The normality front: per-jump advance, color-drain visual, node swallowing,
  distortion-battery pushback.
- Event system v1: HTML dialog, three answers, outcomes touching Hull/Marbles; ~10 events.
- Map HUD (Phaser UI scene): hull, marbles, sector progress, front indicator.
- _Exit: a map-only run is genuinely playable — reach the exit before the front; text endings._

### Phase 2 — The Duel Loop

- Paradroid opposing AI; intro → play → result staging; mini-duel variant (small grid).
- Duel-as-takeover wiring: map encounters and events can open duels and consume results.
- Robo-pet v1: duel avatar, run-scoped class absorption, dungeon-rescue hook (stub).
- _Exit: duels fire from the map; winning grows the pet within a run._

### Phase 3 — The Dungeon Loop _(the old v0.2)_

- Fix FoV (edge detection, diagonal artifacts) and move-on-path.
- Three v1 objectives (Retrieve / Sabotage / Hunt) + the house-rules card.
- Heart, loot, mob behaviors (wait-until-seen → attack), downed → pet drags you out.
- Stray droids in dungeons (mini-duels in place); planet dungeons launched from map events.
- _Exit: the full three-mode loop plays in a one-sector run._

### Phase 4 — The Family Run

- Five sectors with the difficulty knobs (§4) and the grey gradient (§5).
- The five guardians (staged duels + lair gimmicks); captive shuffle, sibling in sector 5.
- Crew abilities per rescued member; whole-family bonus.
- Boarding + ship dungeons (bridge or surrender); Grey Fleet thief drones.
- Hangar with sibling choice; all three endings incl. the Hush fight.
- _Exit: a complete run from garage to true ending._

### Phase 5 — The Telling

- Meta persistence: pet memory (capped), unlocks, story pieces, the codex.
- Event pool buildout to ~35; reunion scenes; ambient score per sector; collage/desaturation
  art passes; balancing passes.
- _Exit: the game you'd show a friend without apologizing._

### Engineering backlog (no phase, pull when needed)

- Capacitor/store builds (native projects still need their Capacitor 8 migration) — when the
  urge strikes; the one-finger rule (§6) keeps mobile viable.
- Move the map/dungeon generators into `np-phaser` when a second consumer appears.
- **The grey-fight colony** (§4): a standalone turn-based incremental off the run's critical path, its
  upgrades walled inside it. Build it whenever the mood strikes and in slices (turn-based fight + the
  round loop + one upgrade tree + a first cat, then the catalog); nothing in the run depends on it.

## 8. Open questions

- What exactly persists between runs (robo-pet only? event unlocks? story pieces?) — decide in §4.
- The audience (roguelite challenge) and the tone (warm story) pull in different directions on
  difficulty — consider how failure tells story rather than just punishing (§4).
- All four pillars were kept; if event writing (pillar 2) and mode variety (pillar 3) compete
  for production time, that priority call is still open (§7).
- **Why was the kid left behind? — RESOLVED (§2):** the gift of play — the kid was mid-play when
  the grey came, beneath its notice and immune to its drain. What remains open is only how much of
  that night is dramatized through story-piece unlocks (§4).
- **Exit model — bail-suns vs. the guardian gate.** Prototype now: _any_ rim sun is an ungated,
  no-reward exit (a speed-run bail). Canonical intent: rim suns stay no-reward bail-exits and the
  guardian becomes the rewarding exit (rescue + advance). Confirm/tune when the duel and run-state
  machine land — does bailing still bank partial rescues? is there a cost to bail, or is "leave
  poor" cost enough?
- Sibling duel-assist verb (freeze countdown vs. re-roll row vs. something better) — tune in
  playtesting once duels are staged.
- True ending: does _remembering_ the Hush unmake him or redeem him — is the grey hollow
  (entropy, no self) or a thing that starved on being forgotten? Writing decision.
- Ship destroyed: do already-rescued family members still count as saved in that ending, or is
  losing the ship losing everything? (Ending logic, decide with §4 difficulty tuning.)
- Front tuning for §4: nodes per jump, can it ever be slowed or pushed back (rare items/events?),
  what exactly happens on the map when a node is swallowed.
- Grey-gradient tuning (how drained per sector) and guardian lair gimmick details — refine when
  sectors get built (§5/§7).
- §5 content reframe under the Hush: do the guardians and dungeon enemies stay as varied
  play-champions (gnome king, porcelain court, arcade ghost…), or get re-skinned greyer and more
  forgotten the deeper you go? Decide in a dedicated §5 content round — not silently rewritten here.
- Optional audio flourish (post-v1): a subtle stem layered into the ambient score per rescued
  family member — audible reunion progress without changing the ambient direction.
- **Grey-fight colony — open threads (§4):** exact tuning constants (the bay HP/regen ratios, the
  stamina/turn budget and its Endurance curve, per-cat-line costs, and the cost curve are sketched, but
  the real numbers come from playtest); the **in-game codex
  presentation** of the cats (names + a memory each are drafted in `cat-codex.md`; wiring them into
  the codex UI and trimming each to a card is the remaining work); the currency name ("light"?) and
  how a freed cat's "color to a bay" maps to concrete ship cosmetics; and a playtest check that
  "open mid-run" doesn't quietly undercut run tension. _(Robo-pet form — RESOLVED: it's the robo-cat
  eldest of the colony, §4 The robo-pet.)_
