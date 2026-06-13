# Leet Hunt — Game Design Document

> Built section by section with the `/game-designer` skill. All sections are designed;
> §8 Open questions is the living parking lot.

## 1. Overview

**Elevator pitch.** Leet Hunt is a whimsical space roguelite about a little kid who has been
robbed of the five things that matter most. Reality has been distorted — which means
*everything is possible* — and it is closing in. With a loyal crew and a trusty spaceship, the
kid jumps planet to planet across five sectors to take back what was stolen, before reality
catches up.

**Genre.** 2D mode-mixing space roguelite: star-map travel with narrative events, roguelike
planet/ship exploration, and Paradroid-style circuit duels as the encounter mechanic.

**Structure.** Run-based. One run is the attempt to clear all five sectors before the timer
(reality) catches up; death or timeout ends the run. Selected progress persists between runs
(robo-pet evolution, unlocked events, story pieces — specifics in §4 Systems).

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
   keeps a run fresh.
4. **The clock is always ticking** — reality closing in shapes every decision: one more detour,
   or push on? Tension is a constant companion, not a panic switch.

## 2. Story & world

**Premise.** An ordinary house, an ordinary family: the kid, their sibling, mom and dad,
grandma and grandpa. One evening, reality around the house gets distorted — and in a distorted
reality, UFOs with tractor beams are suddenly possible. A silent grey ship beams up the whole
family (and, briefly, a very confused farm tractor). When the kid gets back, the house is
silent — and the garage is a space hangar now, bigger on the inside. A ship is waiting.

**The protagonist.** Brother or sister — chosen at run start. The unchosen sibling becomes the
fifth captive, so the family roster is always five. The choice is identity plus a small
mechanical start difference (robo-pet temperament — specified in §4);
world and story are otherwise identical. *Why the kid wasn't taken is deliberately still open —
see §8 Open questions.*

**The antagonist — the Hush.** A grey, quiet figure you forget the instant you look away. He
doesn't collect, gloat, or hate — he *tidies*: where the Hush passes, color, play, time, and
memory drain back to grey ordinary. He **is** the normality closing in (the timer — below).
The distorted reality is a bright wound in the grey, and **play is what keeps the wound open** —
the one thing the Hush cannot normalize. That is the loophole the whole game turns on: to take
something as vivid and beloved as a family, he couldn't simply grey them out — he had to step
into the realm of play and **wager** them. By play's own rules, what is wagered can be won back.
So every dungeon, duel, and guardian fight is the kid forcing the Hush onto the one ground where
he's beatable. Dungeons are pockets where play still rules and the grey only seeps in at the
edges; the circuit duel is the kid's takeover verb; the five guardians are play-champions the
Hush has greyed and bound to hold the gates.
*(Reference DNA: Momo's Men in Grey — stolen time, drab efficiency — crossed with Doctor Who's
The Silence — forgotten the moment you look away. The Weeping-Angel "only-moves-unseen" flavor
stays in the toolbox for his servants.)*

**The forgetting.** The world forgets the Hush the instant it looks away — which is why no one
has ever stopped him, and why every run is a fresh *telling*. The robo-pet is the one memory
immune to it (it alone remembers the other tellings — §4): the kid hunts a foe nobody else can
hold in mind. *(This also offers a strong answer to why the kid wasn't taken — overlooked
because he was mid-play, hiding or imagining, and so invisible to the grey. Parked in §8.)*

**The five captives.** Mom, dad, grandma, grandpa, and the sibling — one held behind each of
the five sector guardians. Each rescued member joins the ship as crew with a gameplay role
(abilities specified in §4): grandpa tinkers upgrades, grandma heals after dungeons, mom opens
routes, dad boosts the ship, the sibling assists in duels. The rescue order the map allows
shapes the run.

**The Hush closes in (the timer).** He doesn't chase — he arrives, greying the map behind the
ship one layer at a time (the *normality front* — mechanics in §4). Where he's passed, the
distortion's color and possibility are gone: events, routes, and loot, normalized away. When he
reaches the ship, the distortion's whole infrastructure — hangar, UFOs, sectors — was never
there, and the run ends: whoever was won back is home and safe; whoever wasn't is lost *in this
telling*. By the next telling the Hush has forgotten the kid too, and it begins again.

**Endings.**
- **Partial rescue** — the Hush reaches the ship first: a bittersweet epilogue with the won-back
  members home; empty chairs for the rest.
- **Full rescue** — all five won back before the grey arrives: the way to the Hush himself opens.
  The bonus/true final fight, with the whole family aboard (their combined help is the mechanical
  payoff — §4).
- **True ending** — beat the Hush at the one game he can't rig. The hook ties to the forgetting:
  he can only be reached by being *remembered* — named, given a face. Whether that unmakes him or
  redeems a thing that starved on being forgotten is a writing decision, parked in §8.

**Flavor guideline — Momo's grey meets Doctor Who's Silence.** The house style is stolen-time
drabness (Momo's Men in Grey) crossed with forget-when-unseen dread (the Silence), kept inside
the wider Doctor Who palette the game already loves: bigger-on-the-inside spaces, don't-blink
statues, timey-wimey event flavor, the tractor-beam gag. Pop-culture mashups beyond that are
welcome (pillar 1).

## 3. Core gameplay

**The run loop.**

1. **Hangar** — pick sibling, ship, and loadout (meta-unlocks apply, §4). Launch into sector 1.
2. **Star map** (`np-space-map`) — a sector is a route graph of planets. Travel is
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

**Two ways out.** The sector's rim is dotted with *boundary suns* — out-of-the-way exit gates.
Jumping to any surviving sun **bails** the sector at once: you escape the Hush but leave
empty-handed (no rescue, no rim loot). The **guardian** is the *rewarding* exit — beat its
set-piece to free a family member and advance properly. A run is then a constant pull between
bailing early (safe, poor) and pushing for the guardian while the grey closes (rich, risky).
The suns ring the map's edge and the Hush burns its near-side ones first, so the set of open
exits shrinks the longer you linger. *(Prototype status: bail-suns are in — any rim sun ends the
sector with no reward; the guardian gate is deferred, §7/§8.)*

**The time rule.** The front advances **only on jumps**. Inside the games — dungeons and
duels — the Hush has no purchase: play holds him off, so no front progress. Pressure there is
local instead (dungeon hazards, the duel countdown). All run-level pressure lives in one
readable place: the map.

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

The kid's companion and the run's emotional anchor — found in the hangar in the first run.

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

### The normality front

- **Per-sector.** Each sector is its own map; the front starts fresh at the sector entry and
  advances a tunable number of node-layers per jump. Sectors grow, so the margin shrinks.
- **Swallowed is gone.** Nodes behind the front — visited or not — are normalized: their
  events, loot, and routes cease to exist.
- **Rare pushback.** *Distortion batteries* (rare loot/event rewards) push the front back one
  node — the distortion is what keeps the adventure alive, and it can be fed.
- **Exits at the rim.** Boundary suns ring the sector edge as bail-exits (leave now, no reward);
  the **guardian gates the *rewarding* exit** — beating its set-piece opens the gate, frees the
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
- **Unlocks, not power:** new ships/loadouts in the hangar, new events entering the pool, and
  **story pieces** — fragments revealing the night of the abduction (including, eventually, why
  the kid was left behind — the §8 question can stay open in-fiction and be answered across
  runs).
- Skill stays king; a fresh player with game knowledge can win run one.

### Difficulty knobs (per sector, rising)

Map size and route density · front speed (layers per jump) · dungeon depth and mob strength ·
duel grid size, fx-tile mix, countdown, and AI · guardian set-piece complexity.

## 5. Content plan

### The five sectors — classic space, increasingly greyed

Classic space biomes carry the run, but the Hush's drain deepens the closer you get to his core
(the *grey gradient*): sector 1 is the most vivid and barely touched — a garden gnome floating
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
  and board to reclaim it (plus their cargo). Every boarding is a small mirror of the abduction.
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

### Map UX — the front is where the color drains

- Tap a connected planet → jump preview (front advance, visible risks) → tap again to commit.
  Fire-and-forget; no manual flying.
- **Distorted space is colorful; normal space is a desaturated, ordinary night sky.** The
  normality front is the Hush himself — a creeping wall of mundane grey sky eating the color
  behind you — so the timer is visible poetry, no clock widget needed. Swallowed nodes turn into
  boring stars.

### Art direction — an intentional collage

Mixed styles are diegetic: the distortion lets every toy box, era, and genre collide (pillar 1)
— and the Hush is its opposite, a grey that flattens all of it to the same drab. Color and clash
read as alive; grey uniformity is the Hush winning. Rules: one consistent style *within* each
mode (painted space on the map, pixel art in dungeons, clean tiles in duels); collage *between*
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
space-map has travel/zoom/transitions; paradroid is playable (needs AI + result flow);
pixel-dungeon has generation but open FoV/movement bugs; the run spine doesn't exist yet.

### Phase 0 — The Spine

Goal: the skeleton every later phase hangs on.
- Switch the workspace to TypeScript strict (big bang, clean baseline).
- Run state machine: hangar → sector → (map ⇄ modes) → ending; modes return results.
- Scene transition cleanup in `StageService` (today's scene-stacking quirk dies here).
- Save-file skeleton (meta persistence comes later, the format starts now).
- *Exit: a fake run flows end-to-end through placeholder scenes.*

### Phase 1 — The Map Run *(the old v0.1, with teeth)*

- Sector graph generation: start, exit, guardian node, route density knob.
- Fire-and-forget travel with jump preview; en-route intercepts (enemy flies in).
- The normality front: per-jump advance, color-drain visual, node swallowing,
  distortion-battery pushback.
- Event system v1: HTML dialog, three answers, outcomes touching Hull/Marbles; ~10 events.
- Map HUD (Phaser UI scene): hull, marbles, sector progress, front indicator.
- *Exit: a map-only run is genuinely playable — reach the exit before the front; text endings.*

### Phase 2 — The Duel Loop

- Paradroid opposing AI; intro → play → result staging; mini-duel variant (small grid).
- Duel-as-takeover wiring: map encounters and events can open duels and consume results.
- Robo-pet v1: duel avatar, run-scoped class absorption, dungeon-rescue hook (stub).
- *Exit: duels fire from the map; winning grows the pet within a run.*

### Phase 3 — The Dungeon Loop *(the old v0.2)*

- Fix FoV (edge detection, diagonal artifacts) and move-on-path.
- Three v1 objectives (Retrieve / Sabotage / Hunt) + the house-rules card.
- Heart, loot, mob behaviors (wait-until-seen → attack), downed → pet drags you out.
- Stray droids in dungeons (mini-duels in place); planet dungeons launched from map events.
- *Exit: the full three-mode loop plays in a one-sector run.*

### Phase 4 — The Family Run

- Five sectors with the difficulty knobs (§4) and the grey gradient (§5).
- The five guardians (staged duels + lair gimmicks); captive shuffle, sibling in sector 5.
- Crew abilities per rescued member; whole-family bonus.
- Boarding + ship dungeons (bridge or surrender); Grey Fleet thief drones.
- Hangar with sibling choice; all three endings incl. the Hush fight.
- *Exit: a complete run from garage to true ending.*

### Phase 5 — The Telling

- Meta persistence: pet memory (capped), unlocks, story pieces, the codex.
- Event pool buildout to ~35; reunion scenes; ambient score per sector; collage/desaturation
  art passes; balancing passes.
- *Exit: the game you'd show a friend without apologizing.*

### Engineering backlog (no phase, pull when needed)

- Capacitor/store builds (native projects still need their Capacitor 8 migration) — when the
  urge strikes; the one-finger rule (§6) keeps mobile viable.
- Move the map/dungeon generators into `np-phaser` when a second consumer appears.

## 8. Open questions

- What exactly persists between runs (robo-pet only? event unlocks? story pieces?) — decide in §4.
- The audience (roguelite challenge) and the tone (warm story) pull in different directions on
  difficulty — consider how failure tells story rather than just punishing (§4).
- All four pillars were kept; if event writing (pillar 2) and mode variety (pillar 3) compete
  for production time, that priority call is still open (§7).
- **Why was the kid left behind?** Deliberately open. Candidates: invisible to the grey — mid-play,
  hiding or imagining, so the Hush never saw him (ties the hero's origin to the antagonist's
  nature — the front-runner now) · sulking after a fight (guilt/reunion payoff) · hiding in the
  garage (tidy, lighter) · slipped the beam by accident (max whimsy, tractor swap gag). Decide
  before writing the intro sequence.
- **Exit model — bail-suns vs. the guardian gate.** Prototype now: *any* rim sun is an ungated,
  no-reward exit (a speed-run bail). Canonical intent: rim suns stay no-reward bail-exits and the
  guardian becomes the rewarding exit (rescue + advance). Confirm/tune when the duel and run-state
  machine land — does bailing still bank partial rescues? is there a cost to bail, or is "leave
  poor" cost enough?
- Sibling duel-assist verb (freeze countdown vs. re-roll row vs. something better) — tune in
  playtesting once duels are staged.
- True ending: does *remembering* the Hush unmake him or redeem him — is the grey hollow
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
