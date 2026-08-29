# Grey-Fight — follow-up backlog

Roughly priority order. None of it is on the run's critical path; pull what's fun. Reordered 2026-06-28
after the **turn-based / round-based pivot** (see [design.md](design.md)) — the engine rewrite is now the
spine; several old items fold into it.

## ✅ Done (2026-06-28)

1. ~~**Turn-based engine rewrite.**~~ **DONE.** `takeTurn()` (you → cats → regen) / `startRound()`, stamina +
   rounds, single-round-record cat-freeing, bosses as in-round walls, locations (contested → reclaimed),
   cultivation + per-location resources, cat evolution, the 6-tree light web, `formatNumber`. Pure/Phaser-free,
   deterministic rng. Scene rebuilt to drive it.

2. ~~**Per-cat specialist abilities.**~~ **DONE.** Scuff multi-hit, Nona ×whole-crew, Glimmer ×light, Blink
   −regen, Comet periodic burst, Tinker boosts your most-leveled tree — passives folded into the stat getters,
   Comet a per-round proc. Scales with `evoLevel`. (`28 unit tests` total now; lint + build green.)

## High value (do next)

3. **Tuning pass (turn-based).** Constants in `DEFAULT_TUNING` are sketches. Validate: first bay clears in a
   few turns, Scuff frees in round ~1–2, regen out-paces HP so walls reappear, stamina/Endurance curve, per-cat
   thresholds, cultivation/evolution costs, cost growth vs light income. A headless balance sim over the pure
   engine is cheap and worth writing.

4. **The upgrade web toward ~100 nodes.** 21 starter nodes exist across the 6 trees; deepen them (and add the
   per-cat evolution lines from #2) toward the ~100 target. Geometric costs, prereq gating already in place.

5. **Resize-safe layout** (review: MAJOR for mobile). The scene lays out once at `create()` from `gameSize`;
   add a `Scale.RESIZE` handler (like `ParadroidScene`) so the colony adapts to window/rotation — recompute
   `#cx/#greyCy`, re-centre the chip row + strip, recompute drag bounds + overlay.

6. **Save-file persistence.** Add `serialize()/restore()` to the engine (best round/record, light, upgrade
   levels, freed cats, colour tiers + resources, evolutions; current round state is transient) and hook into
   the app's versioned save. _(The suffix `formatNumber` and the legible turn HUD are ✅ done.)_

## Medium

7. **Real cosmetic payoff.** Make freed cats actually **recolor the ship** (the design's whole point)
   wherever the ship is shown (hangar/HUD), not just a colored strip cell + tint stub. Decide the
   colour→cosmetic map and wire the cultivation colour tiers into it.

8. **Real entry point.** It's behind a debug toolbar button. Add a proper in-fiction way in (a ship-hub /
   hangar "colony" door), and confirm "open mid-run" doesn't sap run tension (GDD §8).

9. **Camera vs page-drag / HTML catalog.** Decide whether to keep in-scene page-drag or a real camera
   scroll, and whether the upgrade catalog should become an HTML/Ionic overlay per GDD §6.

## Low / polish

10. **Art** — grey-mass, cats, node cards, the ship recolor.
11. **Per-cat in-game codex** — surface the `cat-codex.md` names/memories in the codex UI.
12. **Move tuning into np-config `Balance`** once stable, for consistency with the other modes (the
    conductor already sources duel/dungeon tuning from there).

## Guardrails for any of the above

Keep the [load-bearing invariants](design.md#load-bearing-invariants-dont-break-these-without-a-deliberate-redesign):
cosmetic-only / walled-off (no run power), active-never-idle (all damage gated on a turn; no offline),
endless rounds with persistent meta, clockless. If a task wants to break one, raise it as a design change
first.
