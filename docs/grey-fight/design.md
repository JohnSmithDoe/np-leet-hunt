# Grey-Fight — design

> Canonical source is `../game-design.md` §4 ("Holding the Grey"). This is the consolidated working view +
> the decision log behind it. Cat narrative lives in `cat-codex.md`.
>
> **2026-06-28 pivot:** the mode moved from a real-time endless clicker to a **turn-based, round-based
> incremental**. This doc describes the new target. The current prototype in `libs/np-grey-fight` still
> implements the _old_ real-time model — see [implementation.md](implementation.md) and
> [backlog.md](backlog.md) for the rewrite.

## Concept

A tendril of the grey (the game's antagonist — drab normality, GDD §2) has crept _aboard_ the ship. The
colony is the one place you go on the **offensive** against it: take turns beating it back, bay by bay, in
**rounds**, while the cats you free fight alongside you and bring color back to a greyed ship. It's the
clockless **off-ramp** from the run's tension — where a run _flees_ the grey under a clock, here you
_attack_ it with no clock.

## Load-bearing invariants (don't break these without a deliberate redesign)

1. **Cosmetic-only / walled-off.** Upgrades make you stronger _inside the colony only_. The sole thing
   that ever leaves is **ship color (cosmetics)**. This is what lets it be a deep incremental without
   breaking the run pillar "a fresh player with game knowledge can win run one." _If asked to make it
   grant run bonuses, flag this first._
2. **Active, never idle — and now airtight.** Every point of damage is gated on a **turn** you take
   (a tap). Nothing ticks on a clock; nothing generates while you're away. Because there is no time axis,
   there is no idle strategy to exploit — waiting does literally nothing, and an autoclicker only burns a
   round faster. Rationale: idle-by-waiting is the Hush's domain (Momo's stolen time, drab efficiency);
   the colony is the anti-Hush — it grows when you _play_.
3. **Endless rounds; the fight resets, the meta persists.** _(Reworded 2026-06-28, was "endless, no
   prestige reset".)_ There is no hard ascend/wipe of your progress. A **round** resets only the _fight_
   (bay → 1, grey HP, stamina); **upgrades, freed cats, color, and light all persist**. The round reset
   _is_ the soft-prestige rhythm; the per-bay-scaling grey is the treadmill.
4. **The robo-pet is a robo-cat** — the eldest of the colony, owned from the start (GDD §2/§4), striking
   every turn from round one. Freed cats are its found family.
5. **No offline, no idle reward** _(was "clockless"; softened 2026-06-28 for the cloud layer)._ Nothing
   accrues while you're away, and **waiting never progresses you** — every point of damage is gated on a tap.
   The fight now has a real-time _tap-skill_ layer (grey **clouds** spawn over time as targets, see "Tapping
   the grey" below), but the **economy stays turn-based**: a cloud-pop is one turn, regen/light/round-damage
   are per-turn, so idle-waiting is never optimal — the anti-Hush core holds. (Strict timed _rounds_ are still
   rejected: stamina is an action budget, not a countdown.)

## The loop

**A turn** (one tap), resolved in order:

1. **You strike** — `tapDamage`, can **crit** (chance × multiplier).
2. **Your cats strike** — each freed cat (incl. the robo-cat) adds its **per-turn** hit.
3. **The grey regenerates** — heals by `regenPerTurn`.

Net change to the grey this turn = `(your hit + cats' hits) − regen`. Empty a bay → a denser bay's mass
condenses; every few bays a **boss-mass** (a hard regen wall) gates the next. Damage dealt earns **light**.

**A round** = a run of turns bounded by **stamina** (a turn budget). Spend the last turn → round ends →
the grey creeps back to bay 1 → spend banked **light** on the permanent upgrade web → start the next
round instantly, stronger, deeper. _Push as far as this build allows, bank light, come back harder._

**Persists** across rounds: upgrade levels, freed cats, color, light. **Resets** each round: bay (→1),
grey HP, stamina (→max).

## Tapping the grey — clouds (the skill layer)

You don't tap the grey-mass rectangle (too easy) — **grey clouds spawn inside it and you tap the clouds**;
each pop is one turn. Clouds spawn in real time while a round is live (the one real-time element; see
invariant #5). The **Aim** branch (off the root, ungated by cats) tunes this: **spawn rate** (clouds appear
faster), **hit radius** (bigger, more forgiving tap targets), **max clouds** (more targets at once, less
waiting), and **charged/gold clouds** (a rare gold cloud → guaranteed crit + ×`chargedLightMult` light — a
"go for the gold one" risk-reward). Cultivation reuses the same system as coloured motes.

## Cats — freed by single-round records

A cat is freed when a **single round's total damage** crosses its threshold (escalating: Scuff early,
then up). Freeing is permanent and does **both**: the cat **strikes every turn** _and_ **adds its color
to the ship**. This chains the cosmetic payoff — the whole point — directly to getting stronger, which you
only do by playing rounds ("can I crack 1M this round and free Nona?"). Robo-cat owned from the start.

Roster order (`cat-codex.md`): **Scuff, Nona, Glimmer, Blink, Comet, Tinker**, then generic kittens.
Each is a specialist in spirit and restores a signature color. Per-turn ability sketches:

- **Scuff** (Force) — each turn lands a bonus swipe (multi-hit).
- **Nona** (Crew) — multiplies the whole crew's per-turn strike (scales with roster size).
- **Glimmer** (Prism) — ×light gained.
- **Blink** (Hold) — suppresses the grey's regen each turn.
- **Comet** (Burst) — every \_N_th turn, a massive hit (the boss-breaker).
- **Tinker** (Wildcard) — boosts whichever tree you've leveled most.

## The skill tree — one connected tree that unfolds

A **single connected tree**, **one root** (`d1` Sharper Taps); buying a node **reveals its children**
(hidden until then), so the tree unfolds as you spend. Geometric cost (≈ ×1.18–1.25/level); deeper nodes
cost more. The **six cats are gate nodes on the central spine** — _not_ buyable; they auto-acquire when the
cat is freed in combat, and freeing one reveals its branch. The opening kit (tap/crit/cats off the root) is
buyable from the start so you can free Scuff; each cat then opens a themed branch, in free-order:

| Spine gate (auto: freed in combat) | Reveals branch (bought with light)                              |
| ---------------------------------- | --------------------------------------------------------------- |
| **Scuff** (after the opening kit)  | Damage — Heavy Hand, Crushing Blow                              |
| **Nona**                           | Cats — Pride, Big Litter                                        |
| **Glimmer**                        | Economy/light — Bright Coats, Refraction, Spectrum              |
| **Blink**                          | Regen/Endurance — Overwhelm, Second Wind, Deep Breath, Marathon |
| **Comet**                          | Crit — Frenzy, Devastate                                        |
| **Tinker**                         | Openers/capstone — Head Start, Vanguard                         |

26 nodes today (20 upgrades + 6 cat gates), all 10 stat kinds covered; deepening toward ~100 is a later
tuning job. **Reachability invariant:** the round-damage-growth levers (stamina, openers) must not all sit
behind the _last_ gate, or that gate becomes unreachable — `catThresholdGrowth` is tuned (×3) to keep the
deepest threshold under the achievable round-damage ceiling. There's a `DEFAULT_TUNING` test that frees all
six through play to guard this.

## Scaling — why it reaches the deep end

Clear HP grows geometrically: `baseHp × hpGrowth^bay`. Damage scales the same way (Damage tree on taps,
Cats tree on per-turn strikes), so the deep bays reach the billions and beyond. Regen grows slightly
faster than HP per bay (`regenGrowth` > `hpGrowth`), so walls reappear — a round stalls at its wall, you
spend, the next round breaks through. Boss = bigger HP + regen gate.

**Numbers.** Plain JS doubles hold to ~1e308 (≈ bay ~1260 at the current growth) — far beyond reach — and
precision loss past 1e15 is irrelevant since only ~4 sig figs are shown. So: **plain doubles**, plus a
**suffix formatter** for display (1k / 1m / 1b / 1t / 1sx … then scientific or letter notation). Storage
behind the engine getters stays a contained swap, so `break_infinity.js` (mantissa + float exponent — the
correct form of "keep the unit and the number") is **held in reserve** only if a literally-endless number
aesthetic is ever wanted.

## Decision log (what was chosen, and why)

- **A cozy idea → an active fight → a turn-based round game.** Started as a Neko-Atsume tend-the-cats
  idea; became an active clicker (owner wanted to _fight_ the grey with a tree + scaling enemy); then
  pivoted (2026-06-28) to **round-based** ("stamina ends → round over; buy upgrades between rounds; free
  cats by per-round damage") — the loop that makes incrementals compelling.
- **Turn-based over timed rounds.** With an action-budget stamina and real-time cats, the optimal play
  would be "tap once, wait for the cats" → idle creeps back (anti-Hush). Making **each tap a turn** (you
    - cats strike, grey heals) gates _all_ damage on actions: no wait is ever beneficial, it stays
      clockless, autoclickers become pointless, and the per-turn readout is far more legible than continuous
      DPS math. The alternative (stamina = a countdown) was rejected for reintroducing a clock.
- **Cats freed by single-round damage records** (not per boss) — makes "beat your best round" the engine
  that drives the cosmetic payoff. Bosses stay as in-round walls.
- **Cosmetic-only stakes** remain the unlock that lets it be a _real_ incremental without breaking the run.
- **Single currency (light), permanent.** Push deeper = more damage = more light; no separate in-round
  shop. (Dual-currency "banking" prestige considered and shelved.)
- **Always start a round at bay 1** — early bays become a satisfying blitz; "start at bay N" is an Openers
  upgrade.
- **~100 upgrades** is the depth target; per-cat lines carry the count with character.
- **Plain doubles + suffix formatter**; break_infinity held in reserve (see Scaling).
- **Crit** kept as a distinct tree + the per-turn active-play thrill.

## Open design threads (also in GDD §8)

- Tuning: stamina/turn budget + its Endurance curve, per-bay HP/regen ratios, per-cat thresholds and
  line costs, cost curve vs light income. A headless balance sim over the pure engine is cheap.
- Currency name (working: **light**). How a freed cat's "color to a bay" maps to concrete ship cosmetics.
- Whether each cat's signature ability + per-cat line read clearly (names/memories in `cat-codex.md`).
- Robo-pet's exact visual form vs the cats.
- A playtest check that "open mid-run" doesn't quietly undercut run tension.
