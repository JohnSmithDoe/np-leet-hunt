# Leet Hunt — Event Image Generation Prompts

> One establishing illustration per event — the scene-setter shown on arrival when the event fires
> (the `intro` text in `libs/np-space-map/src/lib/events/content/`). Grounded in `game-design.md`
> §"Art direction" and §5 (the five sectors / grey gradient). Companion to `event-system.md` and
> `event-content.md`.

## How to use this file

Each prompt below describes **one event's hero image** (its intro scene). The prompts are written to be
generator-agnostic — paste a single line into Midjourney / Stable Diffusion / DALL·E / Imagen etc.

For a consistent look across the whole set, **prepend the Global Style Prefix and the event's Sector
Style line** to each scene prompt, then append your generator's own flags (e.g. `--ar 16:9`).

```
<Global Style Prefix>, <Sector Style line>, <event scene prompt>
```

### Global Style Prefix (prepend to every prompt)

> Lush painted digital illustration, cinematic wide establishing shot, deep-space backdrop, soft
> volumetric light, rich saturated colour where the distortion lives. House tone: warm wonder with a
> melancholy core — FTL meets Studio Ghibli, the stolen-time sadness of *Momo* and the quiet menace of
> *Doctor Who*. The everyday made strange. No text, no UI, no watermark. Landscape 16:9.

The Hush (the grey) is the antagonist: **colour and clash read as alive; flat grey uniformity is the
Hush winning.** Sectors run a *grey gradient* from vivid (sector 1) to near-monochrome (sector 5) — the
Sector Style lines below carry that.

### Sector Style lines (prepend the one matching the event's pool)

- **Core / cross-sector** — moderate saturation, sense of awe and the uncanny; eligible anywhere.
- **Home Reach** (sector 1) — warm golden suburban-dusk palette, vivid greens, playful and cozy; barely
  touched by the grey, which only seeps in at the very edges.
- **Frozen Drift** (sector 2) — glassy pale blues and porcelain whites, glittering frost, utter
  stillness, don't-blink eeriness; cool and desaturated.
- **Ember Belt** (sector 3) — hot forge-light, molten orange and ember-red against black rock, flying
  sparks, dramatic chiaroscuro; loud and dangerous.
- **Veiled Nebula** (sector 4) — half-lit eerie nebula, magenta/teal/violet fog, faded neon ghostlight,
  carnival glamour gone spectral, things shining translucently through other things.
- **The Long Quiet** (sector 5) — heavily desaturated near-monochrome grey, dust and stillness,
  clockwork textures, deep melancholy; any surviving spot of colour glows precious and rare.
- **En-route / Grey Fleet** — drab "colour of forgetting" grey machines set against the colour they're
  draining; tense standoffs in open space.

> Note: these cover the **intro** of each event. Outcome-specific or branch art is out of scope here —
> a possible follow-up batch, as are the five guardian set-pieces (Gnome King, Porcelain Matron,
> Dicekeeper, High Scorer, the Unwound).

---

## Core events (eligible in any sector)

- **`distortion-cache`** — A dead cargo hauler drifting across deep space, hull dark and battered, but its exposed reactor core still pulsing with vivid, stolen, multicoloured light — a pocket of bottled distortion the grey never finished tidying away; faint motes of trapped colour leaking from the cracked engine. A live, dangerous charge.
- **`grass-alien-encounter`** — An impossible green meadow on a small planet at the edge of deep space, real grass rippling in a breeze that shouldn't exist, a small explorer ship set down at the meadow's edge, faint alien life half-hidden in the tall grass under an alien sky. Wonder and unease.
- **`space-whale`** — A vast ancient space whale detaching from a planet's dark nightside, body older than the dark, turning one slow luminous eye toward a tiny nearby ship. Bioluminescent markings, immense scale, awe.
- **`stray-droid`** — A derelict combat droid drifting in space off a planet, suddenly waking as a ship's wake stirs it — optics flaring hostile red, a single challenge ping crackling across the void. Scrap-built, menacing, charged for a duel.
- **`zeebo-guide`** — A spindly, grinning alien local, all elbows and enthusiasm, bounding up across dusty ground toward the viewer, thumping its chest — an eager, ramshackle self-appointed tour guide. Comic and friendly.

## En-route / Grey Fleet (catalogued — fires once the intercept trigger lands)

- **`grey-thief-drone`** — A Grey Fleet thief drone sliding out of the dark, an angular drab-grey machine, its tractor beam reaching greedily toward a glittering stash of colourful marbles. Colourless predator against bright loot.
- **`grey-escort-fighter`** — A sleek grey Grey-Fleet fighter falling into formation alongside the player's ship, wings painted the dull "colour of forgetting," weapons cold but ready — an uneasy escort that hasn't fired yet. Tense standoff.
- **`grey-drift-picket`** — A field of slow-blinking grey buoys (Hush pickets) strung across space, each draining the colour out of the void around it into dull grey halos, a ship's course threading between them. Quiet, encroaching menace.

---

## Home Reach — sector 1 (warm, playful, barely greyed)

- **`home-tractor-in-orbit`** — A muddy farm tractor turning slow idle circles in low orbit over a green world, no farm in sight, a small robo-pet pressing both paws to a ship window at the sight of it. Cozy and gently absurd.
- **`home-gnome-scout`** — A garden gnome in a red hat standing on a bare asteroid, fishing rod cast into open space, refusing to turn around though it clearly knows you're there. Comic dread, the uncanny in the ordinary.
- **`home-lemonade-comet`** — A comet drifting by trailing a folding table, a small alien in a sun-hat, and a hand-lettered sign reading "LEMONADE — 5 MARBLES (HONEST)". Sweet, sunny, roadside-stand charm in space.
- **`home-thief-drone-cul-de-sac`** — A Grey Fleet thief drone hanging over a tidy ring of suburban planets arranged like a cul-de-sac, drab grey, its tractor beam locked onto a glittering stash of marbles rising out of a back garden. Colour-theft over cozy suburbia.
- **`home-backyard-pool`** — A round above-ground backyard swimming pool floating in the black, its water perfectly level, an inflatable flamingo turning lazy circles, a pool ladder hanging off one side into nothing. Sunny and surreal.
- **`home-mailbox-row`** — A strip of suburban curb floating in orbit lined with numbered mailboxes, red flags up, the street name long faded, one flag twitching as you approach. Warm and lonely, quietly uncanny.
- **`home-block-party`** — A whole green world mid block-party: bunting strung pole to pole, grills smoking, a hundred alien species in lawn chairs, someone waving the viewer down to land like they're just late. Joyful, welcoming chaos.
- **`home-treehouse-broadcast`** — A backyard treehouse riding a drifting chunk of oak through space, rope ladder dangling, a coat-hanger aerial on the roof still pushing out an old radio serial the grey never switched off. Nostalgic and cozy.
- **`home-sprinkler-nebula`** — A suburban nebula shaped like a giant oscillating lawn sprinkler the size of a moon, throwing great glittering arcs of mist across a lawn of stars, hissing and sweeping back and forth. Playful cosmic domesticity.
- **`home-ice-cream-truck`** — An ice-cream truck coasting driverless through the dark, its jingle looping tinny and slow, the little serving hatch propped open, a robo-pet already pawing at the airlock to get to it. Sweet and faintly eerie.
- **`home-garage-sale-asteroid`** — An asteroid covered surface-to-surface in folding tables of pegged-out junk under handwritten prices, a cardboard "SALE THIS WAY" arrow pointing into open space, a grandfather clock ticking somewhere. Cozy treasure-hunt clutter.
- **`home-paper-route`** — A canvas paperboy satchel tumbling through space, still stuffed with rubber-banded rolled newspapers each addressed to a porch among the planets ahead, a bike bell tinging out of sight. Nostalgic suburban Americana in orbit.
- **`home-trampoline-moon`** — A small moon that is one enormous backyard trampoline, springs singing in the vacuum, the mat still faintly warm, dipping and rebounding all on its own — slow and inviting. Playful, bouncy, gently uncanny.
- **`home-sandbox-planet`** — A whole planet of clean raked yellow sand, a plastic bucket and spade left mid-sandcastle near the pole, tiny footprints leading away and stopping, the sand still damp where it was packed. Innocent and lonely.
- **`home-kite-comet`** — A bright red diamond kite snagged on a passing comet, its string trailing back into the dark to a spool no hand holds, fluttering and diving in the comet's wind. Vivid red against the cold blue tail, wistful play.
- **`home-recess-bell`** — A brass school bell hanging on a rope from a floating archway, ringing itself in long lonely peals over an empty playground-world below — swings creaking, a hopscotch grid half-faded in the dust. Nostalgic and hollow, grey at the edge.
- **`home-riderless-bicycle`** — A child's bicycle pedalling steadily through space, training wheels spinning, a playing card still clipped to the spokes flapping at nothing, the seat empty — keeping to a lane only it can see. Eerie, sweet, the absent child.
- **`home-fort-blanket`** — A station-sized blanket fort drifting ahead, bedsheets pinned over chair-backs into turrets, a "NO GROWNUPS" sign taped to the front flap, a torch glow flickering inside — and something else moving in there too. Cozy, secret, faintly ominous.
- **`home-nightlight-buoy`** — A child's plastic crescent-moon nightlight bobbing alone at the edge of Home Reach, glowing soft and steady right where the green starts to grey out — the last warm light before the dark proper. Tender, fragile, a threshold.
- **`home-soapbox-derby-comet`** — A plank-and-pram-wheel soapbox racer lashed to the nose of a comet, its driver's helmet a saucepan, a hand-chalked start line drifting just ahead, a checkered flag on a broom handle waving itself at the far turn. Goofy, gleeful, homemade.
- **`home-pinata-asteroid`** — An asteroid-sized papier-mâché donkey piñata swaying on a cable strung between two moons, gaudy and fringed and very obviously stuffed, a fence-post bat floating below, blindfold optional. Festive, absurd, candy-coloured.
- **`home-dunk-tank-planet`** — A planet-sized carnival dunk tank turning below, a grinning clown on the drop seat over a continent-sized sea of warm blue water, a banner reading "3 MARBLES A THROW — SOAK THE CHUMP". Bright, silly, summer-fair energy.
- **`home-wishing-well-moon`** — A mossy stone wishing well on a bare moon, its bucket on a winding crank, the shaft dropping into a dark that twinkles faintly with coin-light, a weathered sign reading only "MAKE IT A GOOD ONE". Quiet warm-grey magic, hopeful.
- **`home-go-kart-track`** — A figure-eight go-kart track looping through a knot of small moons, rubber-burned and bunting-strung, a single battered kart idling at the grid, a goggled gnome flagging you down and revving a thumb at the line. Energetic and playful.

## Frozen Drift — sector 2 (glassy, still, don't-blink eerie)

- **`frozen-statue-garden`** — A garden of porcelain figures standing mid-gesture on a still ice field — reaching, bowing, one with a hand half-raised in greeting — none of them facing the way they were a moment ago. Don't-blink dread, pale frost.
- **`frozen-glass-city`** — A city of spun glass spread across a frozen plain, every tower intact, every window lit, every street utterly empty. The lights are on; no one is home and no one ever left. Glittering, abandoned, uncanny calm.
- **`frozen-weeping-angel`** — A single porcelain statue standing on open ice between the viewer and a distant ship — wings folded, hands over its face, weeping the way carved things weep — that was not there when you landed. Cold dread.
- **`frozen-frozen-fleet`** — A convoy of a dozen ships hanging dead in glittering black space, rimed thick in frost, drifting in perfect formation, their running lights still patiently blinking to no one. Beautiful, lonely, frozen in time.
- **`frozen-matron-invitation`** — A frost-rimed engraved card left on a ship's hull by a gowned, gloved porcelain courier who stands perfectly still behind it — an invitation from the Porcelain Matron requesting the honour of your stillness at court. Icy formality.
- **`frozen-aurora-pulse`** — A slow aurora breathing in and out over an ice-cap planet below — not wind-driven but inhaling and exhaling, as though the whole frozen world were asleep and dreaming in light. Ethereal, hushed, glassy greens and blues.
- **`frozen-doll-orphan`** — A single upright porcelain doll on a snow-blown step at the edge of a dead frozen settlement, its lap full of frost, painted eyes open — the only small thing on the whole planet. Heartbreaking stillness.
- **`frozen-stopped-clocktower`** — An ice-locked colony tower rising from the floe, its great clock stopped, hands frozen at the same minute every other dead-town clock agrees on. Frost, silence, time halted, melancholy blue.
- **`frozen-distress-beacon`** — A distress beacon blinking faint and slow from a deep-blue crevasse in an ice field, an old signal still calling though whoever sent it is likely long gone. A dim pulsing light in glacial dark.
- **`frozen-mirror-floe`** — A floe of black ice so polished it mirrors the whole starfield — but the figure standing in the reflection where the viewer's own should be has not yet copied the pose. Uncanny, glassy, dread.
- **`frozen-frozen-waterfall`** — A whole waterfall caught mid-fall off an ice cliff: a wall of glass spray frozen between one instant and the next, the roar still trapped somewhere inside it. Suspended motion, glittering stillness.
- **`frozen-comet-rink`** — A comet flattened into a glass-smooth disc of ice, fresh frost-edged skate-tracks looping and figure-eighting across it, leading from nowhere to nowhere. Playful yet haunting, pale and empty.
- **`frozen-ice-hermit`** — A lone bundled figure sitting on a stool over a hole cut in an ice floe, line in the water, back to the whole frozen sky — ice-fishing here so long they've forgotten there are no fish. Quiet, absurd, melancholy.
- **`frozen-snow-globe`** — A perfect dome of clear ice no bigger than a ship, floating in space, holding one tiny toy town under one toy sky, snow forever falling, small lights forever lit in small windows. Precious, contained, wistful.
- **`frozen-frostbit-greenhouse`** — A cracked-glass greenhouse dome on an ice plain still trying to be a garden — rows of flowers caught at full bloom in a sheath of frost, their colour locked under the ice the moment the warmth ran out. Frozen vivid colour, poignant.
- **`frozen-lighthouse-keeper`** — An ice-rimed lighthouse on a black reef of frozen shipwrecks, its great lamp still sweeping the dark, and in the glass room at the top a keeper with frost on their shoulders still standing watch. Lonely vigil, cold beam through fog.
- **`frozen-iceberg-armada`** — A fleet of icebergs sailing the void in eerie formation, and frozen deep inside the largest, dim behind fathoms of blue ice, the masts and hulls of actual sailing ships — a whole harbour that drifted away. Surreal, glacial-blue awe.
- **`frozen-held-breath-field`** — A field of small white clouds hanging motionless in space, each one the exact shape of a breath exhaled on a cold morning, frozen the instant it left a mouth no longer there. Eerie, delicate, deeply still.
- **`frozen-music-box`** — A music box carved from a single block of ice drifting in still black space — comb, cylinder, tiny frozen dancer and all — so cold its mechanism has slowed to one note every long, long minute. Glassy, near-stopped time.
- **`frozen-glacier-tomb`** — A moon-sized glacier hanging in the void, and pressed flat and perfectly preserved in its deep-blue heart, a single small thing too far down to make out but too clearly there to ignore. Vast, cold, mysterious.
- **`frozen-vault-of-thaw`** — A bank vault standing alone on an ice floe, its blast door ajar by a hand's width, the cold inside so absolute it has frosted the air solid in the gap, and something behind it catching the light and refusing to let it go. Glittering mystery.
- **`frozen-geyser-gamble`** — A frozen geyser rising from the ice like a glass tree, branch on branch of suspended spray, and deep in its trunk a slow warm blue glow that makes the surrounding ice weep. Forbidden heat in a frozen world.
- **`frozen-thin-ice-crossing`** — A sheet of new black ice thin as window-glass between the viewer and a frost-locked observatory, and beneath it the dim drowned shapes of a sunken supply train, crate on crate just below the surface. Tense, fragile, treasure under ice.
- **`frozen-avalanche-shelf`** — A city-sized shelf of blue ice overhanging a frozen ravine, a courier drone with its cargo light still blinking pinned half-buried in the wall beneath it — one loud noise from bringing the whole shelf down. Suspended catastrophe.
- **`frozen-aurora-forge`** — A cavern under an ice cap, a smith's forge gone cold, half-made blades of frozen aurora racked above it — light worked like steel then abandoned mid-temper when the warmth ran out, one blade still waiting on the anvil for its final quench. Magical, glacial, abandoned craft.

## Ember Belt — sector 3 (forge-light, loud, dangerous)

- **`ember-forge-bargain`** — A cracked lava world, its mantle split open into a hundred working forges, a huge soot-black alien smith looking up from a molten anvil. Rivers of magma, showers of sparks, a deal struck over heat and steel.
- **`ember-loaded-dice`** — A gambling den carved into a dead asteroid, lit only by glowing molten-glass dice that shed sparks as they tumble across a stone table, shadowy gamblers around it. A rigged house in hot orange light — the Dicekeeper's domain.
- **`ember-magma-tithe`** — Robed volcano-priest silhouettes on a lava world feeding offerings into a roaring caldera, turning as one to beckon a ship down. Ominous orange glow, ritual, an ever-hungry fire.
- **`ember-slag-prospector`** — A weary lone prospector in a battered mining rig at the edge of a glowing asteroid field, sieving slag for ore, hailing the viewer with tired hope. Drifting debris, sparks, a big ore seam too large for one.
- **`ember-runaway-cinder`** — A burning planetoid trailing an enormous coronal tail of cinder straight across the shipping lanes, drifting toward an inhabited rock. Looming disaster, fire against the void, urgent.
- **`ember-grey-furnace`** — A foundry-moon, half its forges still blazing orange and half gone cold ash-grey, the fire visibly draining tile by tile into a humming distortion siphon at its core that feeds the Hush. Colour and heat being stolen.
- **`ember-stray-droid`** — A half-molten foundry droid clattering out of an asteroid hangar, optics flaring, glowing seams in its armour, alone in the heat too long and unable to tell friend from scrap. Hostile, industrial, ember-lit.
- **`ember-glassblower-twins`** — Twin alien artisans working a single shared glassblowing furnace on a forge world, bickering over the molten glass on their pipes, turning to ask the viewer to settle whose work is finer. Glowing glass, warm rivalry.
- **`ember-thief-drone`** — A Grey Fleet thief drone dropping out of an asteroid's shadow in the forge sector, tractor beam locking onto a glittering marble stash, drab grey against ember-lit rock, about to flee with stolen colour.
- **`ember-dicekeeper-shrine`** — A roadside shrine to the Dicekeeper lit by a single fist-sized molten-glass die glowing on a pedestal, a stone golem idol looming behind it, sparks drifting. Tempting and ominous — "one throw."
- **`ember-card-sharp`** — A slick card sharp at a cinder-station table dealing cards printed on sheets of cooled lava-glass that catch and wink the forge-light, inviting the viewer to sit and play. Smoky, glowing, con-artist charm.
- **`ember-lava-surfer`** — A daredevil lava-surfer riding a glowing heat-shield board across the molten seas of a forge world, trailing sparks and whooping, carving up alongside the viewer's hull. Dynamic, fiery, cocky energy.
- **`ember-meteor-foundry`** — A foundry built into a captured meteor, catching falling rock and forging it mid-flight, hammers ringing in the vacuum, a glowing foreman leaning out a fiery port. Industrial spectacle in space.
- **`ember-fireworks-barge`** — A drifting festival barge packed with live fireworks humming with stored colour, its crew long gone, the grey nibbling at one corner of the hold. Faded festivity, dormant colour waiting to burst.
- **`ember-coin-flip-toll`** — A toll-gate spanning the only safe gap through a grinding asteroid wall, a one-eyed tinker-bot keeper flipping a glowing forge-cast coin in the air. Heads-or-tails fate, hot metal, a narrow passage.
- **`ember-salamander-pet`** — A creature-seller hawking a little fire-salamander curled around a hot coal in a heat-lamp cage, purring sparks, on a forge station. A cute fire-lizard pet in warm lamp-glow, a lonely-traveller sales pitch.
- **`ember-blacksmith-ghost`** — A forge-world gone cold, every fire grey ash, yet one anvil still ringing — struck by a translucent ghost-smith, a flicker of orange in the shape of a worker who would not stop working. A single ember of colour in grey ruin, melancholy.
- **`ember-demolition-derby`** — A demolition derby roaring inside a hollowed-out asteroid arena, junk-ships ramming junk-ships for a pot of marbles, a barker waving the viewer to the starting grid. Crowd, chaos, sparks, reckless fun.
- **`ember-marble-kiln`** — A magma kiln on a smith-moon casting glowing marbles by the thousand — the sector's mint — a kilnmaster offering the viewer a turn at the molten casting trough. Rivers of glass marbles, "pour true."
- **`ember-roulette-comet`** — A comet hollowed into a kilometre-wide roulette wheel, its tail forming the spinning rim, lit pockets streaking through the dark, a casino-warden hailing from the hub. A vast gambling spectacle in space.
- **`ember-ante-pit`** — A sunken ante-pit on a smelter-station, gamblers ringed around it betting on which crucible cracks first, a slag-jawed golem pit-boss raking the pot with a glowing hook. Hot, grimy, high-stakes.
- **`ember-slag-plunge`** — A slag-diving crew cordoning off a cooling lake of molten waste, betting on who can dredge the most fire-glass before the crust sets, their grinning captain in heat-shielded gear. Daredevil, glowing crust.
- **`ember-molten-auction`** — A molten-glass auction floating in a forge-bubble, still-glowing artisan beads sold blind in clay pots so no one sees the colour until they pay, an auctioneer ringing a hot tuning-fork off the anvil. Mystery, glowing pots, anticipation.
- **`ember-meteor-snatch`** — Bookmakers running a meteor-catch wager off a forge-platform: a burning rock falls on a timer while the crowd bets whether anyone is mad enough to net it mid-fall, an odds-bot flashing a fat payout. Tension, fire, gambling.
- **`ember-rigged-wheel`** — A back-room forge-casino prize-wheel everyone knows is rigged — that's the draw — a sparking croupier-golem slapping it into a spin. A glowing wheel shedding sparks, a knowing wink, a sucker's bet.

## Veiled Nebula — sector 4 (eerie, half-lit, pop-culture ghosts)

- **`enchanted-nebula`** — A nebula humming with colour and intent, drifting in slow visual chords of magenta, teal and violet — clearly more than gas, and clearly aware the viewer has arrived. Sentient, luminous, eerie wonder.
- **`celestial-dance-off`** — A drifting stage of stitched-together light in the void, a hundred alien species mid dance-competition, a judge with too many arms beckoning the crew up into the glare. Glittering, kinetic, surreal nightlife.
- **`cosmic-carnival`** — A carnival strung clean across the void — barkers, rides, and a midway running on too far to see the end of — its lights warm but the shadows behind them wrong. Faded glamour, neon haze, lurking unease.
- **`veiled-derelict-arcade`** — A station shaped like an arcade cabinet, dead and dark except for one machine still glowing in the back, its leaderboard reading three blinking initials and a score no one could survive. Spooky neon — the High Scorer's haunt.
- **`veiled-haunted-broadcast`** — An old comms relay endlessly looping a children's show into the dark — a grinning puppet host performing to an audience of no one, far longer than any tape should hold. Creepy nostalgia, flickering screen-glow.
- **`veiled-ghost-whale`** — A moon-sized whale drifting through the nebula half here and half not, stars shining straight through its translucent grey flank, singing low to nobody. Ethereal, melancholy, ghostly bioluminescence.
- **`veiled-mask-bazaar`** — A floating bazaar of nothing but thousands of masks — grinning, weeping, blank — and a hooded merchant who wears none, insisting the viewer take one as a gift. Eerie, ornate, unsettling generosity.
- **`veiled-stuck-clocktower`** — A cathedral-sized clocktower drifting alone in nebula fog, every hand frozen at the same grey minute, a caretaker-ghost pacing the gantry winding nothing. Haunted, half-lit, waiting for a time that won't come.
- **`veiled-fan-club`** — A glittering club where holographic ghosts of half-remembered heroes hold court — knights, captains, cartoon icons all faded at the edges — every one of them swearing the viewer looks familiar. Nostalgic neon, bittersweet.
- **`veiled-painted-planet`** — A flat painted theatrical backdrop of a planet hung in the void, so convincing that birds of light wheel across its painted sky, a single door propped just ajar at its base. Surreal, uncanny, a way behind the scenery.
- **`veiled-ghostlight-theatre`** — A theatre adrift in the fog, every seat full of grey silhouettes that don't breathe, all facing a stage where a single ghost-light burns and an empty role waits to be read. Hushed, spooky, theatrical melancholy.
- **`veiled-phantom-drivein`** — A city-block-sized drive-in screen in the void projecting a film no one ever shot — the viewer's own family laughing in scenes that never happened — rows of empty cars idling below. Haunting, nostalgic, heartbreaking glow.
- **`veiled-karaoke-comet`** — A comet trailing a tail of glowing lyric-sheets, blaring a backing track into vacuum and cycling endlessly to a half-remembered chorus that never quite resolves, a microphone floating, waiting. Lonely neon, eerie loop.
- **`veiled-hall-of-mirrors`** — A sealed funhouse hull of warped mirrors floating silent in the fog, a hundred crews like the viewer's visible through the glass, all lost in the corridors, all looking back out. Vertiginous, eerie, infinite reflections.
- **`veiled-phantom-orchestra`** — A hall of empty chairs and abandoned instruments that play themselves — bows sawing through thin air, a conductor's baton raised on an empty podium, waiting for a downbeat that never falls. Ghostly, elegant, suspended music.
- **`veiled-fortune-machine`** — A glass booth bobbing in the fog holding an automaton fortune-teller, her painted smile flaking, a slot waiting for a marble while her hand already hovers over a deck of cards. Carnival-spooky, dim glow, fate for sale.
- **`veiled-frozen-parade`** — A neon parade stopped dead mid-march in the void — floats, marching bands, gunship-sized balloon beasts — every face caught mid-cheer and held grinning for who knows how long. Festive yet frozen, garish, uncanny.
- **`veiled-roller-disco-moon`** — A little moon paved end to end in a roller-disco rink, a cathedral-sized mirror-ball turning, a beat still thumping through dead speakers, not one skater on the gleaming floor. Neon-lit, empty, eerie groove.
- **`veiled-seance-station`** — A derelict station rigged into one enormous séance — a ring of antennae around a table, a planchette of welded scrap twitching across a dial of star-charts, slowly spelling something. Occult sci-fi, dim, creeping dread.
- **`veiled-spinning-fortune-wheel`** — A two-storey wheel of fortune turning on its own in the fog, its painted prizes worn to grey ghosts of colour, a spectral barker doffing a faded hat — one ante per spin, no refunds. Faded carnival, ghostly, tempting.
- **`veiled-ghost-poker-parlour`** — A smoke-stained card parlour drifting past, a felt table ringed by translucent gamblers folding and anteing in perfect silence, one empty chair sliding back for the viewer. Spectral, dim, a silent invitation.
- **`veiled-dunk-the-spook-booth`** — A carnival dunk-tank bobbing in the void, a sodden ghost perched on the drop-seat taunting an empty midway, a rack of weighted balls beside a sign reading "THREE THROWS, ONE PRICE, BIG PRIZE". Spooky-silly, neon, dripping.
- **`veiled-phantom-auction`** — A grand auction house lit in the dark, rows of ghost bidders raising spectral paddles at a velvet-draped lot, an auctioneer of pure static gavelling for a crowd that pays in memory. Opulent, eerie, faded grandeur.
- **`veiled-midway-ring-toss`** — A ring-toss stall floating half-lit on a dead midway, bottles racked in tight rows, the top one crowned with a glittering grand prize, a ghostly attendant rattling a fistful of grey hoops. Carnival-spooky neon, a sucker's game.
- **`veiled-high-roller-table`** — A roped-off high-roller table glowing at the heart of a dead casino-station, a single masked phantom behind a tower of antique chips, beckoning to a game with no name and no limit. Sinister glamour, dim, high-stakes dread.

## The Long Quiet — sector 5 (greyest, melancholy, clockwork)

- **`quiet-stopped-clock`** — A grey town square under a cathedral-sized clock tower, its hands stopped, nothing moving but dust settling. Near-monochrome, deep stillness, profound melancholy.
- **`quiet-last-lighthouse`** — A lonely lighthouse planet in an emptied dark, its lamp still turning but the colour bled out of the beam until it sweeps the void a pale, exhausted grey. Drained, weary, the last light failing.
- **`quiet-empty-carousel`** — A fairground greyed to the bone, the painted horses of a great carousel faded to ash-white shapes, the calliope open-mouthed and silent in the cold. Abandoned joy, dust, deep grey melancholy.
- **`quiet-forgetting-archive`** — A vast library moon, shelves running off into the grey for miles, words physically lifting off the open pages like dust and drifting away as the books close themselves blank. Loss of memory made visual, somber.
- **`quiet-greyed-orchard`** — A planet that was once an orchard, trees still standing in their rows but grey as cobwebs, one last apple at the end of a colourless branch holding a single stubborn blush of red. Near-monochrome with one precious spot of colour.
- **`quiet-unwound-knight`** — A clockwork knight kneeling head-bowed and frozen mid-vigil in a hall of stopped clocks, a faint dying tick still coming from deep in the armour — slowing. Mournful, grey, a wound-down sentinel.
- **`quiet-paling-aurora`** — An ice giant trailing the sector's last aurora, its curtains washed out to a faint pewter shimmer — the ghost of the colours it used to throw across the dark. Faded beauty, cold grey-silver, elegiac.
- **`quiet-grey-fleet-derelict`** — A Grey Fleet thief-drone drifting dead ahead and half-greyed itself, its tractor still clamped on a small stash it stole before it wound down. Even the wardens forgotten out here. Bleak, still, quietly ironic.
- **`quiet-last-radio`** — A relay station tumbling slowly through the dark, one working speaker still looping a cheerful, decades-old broadcast to a sector that stopped listening long ago. Lonely, grey, achingly nostalgic.
- **`quiet-sandglass-shore`** — A grey shore where the tide is made of hissing sand under stopped stars, a person-sized sandglass half-buried in it with its last grains nearly run through. Time running out, monochrome, solemn.
- **`quiet-last-candle`** — A tiny chapel-sized world holding a single candle burning down in a window — the last open flame in the whole grey quarter, guttering in a draught that has no business out here. One warm flame against vast grey, tender.
- **`quiet-frozen-procession`** — A grey boulevard where a funeral procession is stopped dead mid-step — mourners, bearers, a small coffin draped in colourless flowers — all held by the Hush forever about to take the next pace. Heartbreaking, frozen grief, monochrome.
- **`quiet-drifting-bedroom`** — A whole child's bedroom adrift in the void — bed, rug, a shelf of slumping toys, one wall torn clean off a house that's no longer anywhere — tumbling slowly with the lights still warmly on inside. A tender island of warmth in grey emptiness.
- **`quiet-wishing-fountain`** — A plaza around a great dry fountain, its basin a grey bowl of dust and dull coins — every coin a wish someone once threw, none granted now, none ever to be. Faded hope, monochrome, melancholy.
- **`quiet-winding-music-box`** — A planet shaped like a vast music box, its surface a cylinder studded with hill-sized pins turning so slowly you can count the teeth, the tune now a single note every few minutes, spaced wider each time as the great mainspring lets go. Grand, grey, time running down.
- **`quiet-fading-photograph`** — A single sail-sized photograph hung on invisible wire in the grey void, showing a family laughing at a kitchen table — the faces paling, the edges going white, the whole image quietly forgetting itself as you watch. Devastating, intimate.
- **`quiet-unmelting-snow`** — A world under snow that has not melted in a hundred grey years, every flake stopped where it landed, drifts smooth as poured wax, a single sledge abandoned at the top of a long white hill — waiting for a winter that never ends and a child who never came back. Still, sorrowful, pale grey-white.
- **`quiet-unreached-door`** — A freestanding green door painted a colour so vivid it hurts after all the grey, standing alone in the open void, warm light leaking round its edges and the muffled, impossible sound of an ordinary day on the far side. One blazing colour in monochrome — hope.
- **`quiet-stopped-droid-foundry`** — A foundry-moon where the Hush builds its tidy grey machines, gone quiet mid-shift, half-finished grey droids stilled on the lines, one nearly-complete unit twitching on its cradle between waking up and never waking at all. Cold, industrial, grey dread.
- **`quiet-grandmother-kitchen`** — A house worn nearly to nothing, its kitchen window still glowing faint amber, a pot of soup on the cold stove held by the grey mid-simmer — one degree below warm, one breath short of a meal, for who knows how long. Aching domestic warmth in grey ruin.
- **`quiet-handwound-clock`** — A watchmaker's shop pared down to grey, one small clock still keeping time only because a worn spring holds it by a thread, its bare arbor waiting to be turned by hand against the full pull of the works. Intimate, tense, fading time.
- **`quiet-dimming-star`** — A small old star guttered to a dull ember the colour of cooling iron, the handful of grey worlds still huddled around it going cold in its dimming. Vast, somber, the last warmth fading from a fading sun.
- **`quiet-grey-toll`** — A narrow rift through a wall of stilled debris, a lone half-faded tollkeeper in a booth worn smooth by waiting at its mouth — he takes not marbles but a memory you'd rather keep. Solemn, grey, a terrible quiet bargain.
- **`quiet-remembering-pool`** — A still grey pool in a crater on a dead moon, a robo-pet gone rigid at its edge — the water showing not a reflection but the past, the day the Hush came, for anyone willing to look. Haunting, grey, a painful window.
- **`quiet-last-streetlamp`** — A whole greyed-out town, and at the end of its longest street one streetlamp still burning, its little doorstep-sized pool of warm light the last lit thing in a place the Hush has nearly finished, its failing cell flickering. One small warm glow against total grey.

---

## Catalogued events — not yet coded (en-route / boarding seeds)

> From `event-content.md` — these fire only once their triggers land (en-route intercept, boarding mode).
> Included so art can be staged ahead of the code.

- **`black-hole-dilemma`** *(core / en-route)* — A black hole sitting dead ahead, swallowing light and patience alike, a tiny ship hesitating at the edge of its accretion glow. Awe, dread, gravitational menace, deep space.
- **`pirates-attack`** *(en-route)* — A ragtag pirate ship swinging into the viewer's path, weapons hot and run out, demanding cargo. Aggressive, scrappy, a tense standoff in open space.
- **`distress-signal`** *(en-route)* — A small civilian ship pinned down by raiders, flashing a desperate distress call, the viewer's ship arriving on the scene. Urgency, a choice to intervene, the glow of a chaotic firefight.
- **`abandoned-station`** *(en-route)* — A derelict space station turning slowly in the dark, airlocks gaping open, lights dead, an air of salvage and danger. Eerie, exploratory, cold.
- **`cargo-boarding`** *(boarding)* — The view through a breached airlock into the quiet corridors of a boarded Federation freighter, dim emergency lighting, tension before contact. Boarding dread, industrial.
</content>
</invoke>
