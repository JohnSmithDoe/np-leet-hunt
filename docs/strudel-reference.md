# Strudel reference (for `np-audio`)

A working reference for Strudel, scoped to the `np-audio` work. The embedding/engine APIs here were
**verified against `@strudel/web` 1.3.0 / `superdough` 1.3.0** (installed in this repo) — marked ✅.
A couple of genuinely-open items remain (tagged **⚠️ open**) and are listed at the bottom. The
pattern-language cheat-sheet is inherited from TidalCycles and stable.

Canonical sources to check against:

- Docs / REPL: <https://strudel.cc> (workshop + technical manual)
- Source (moved off GitHub): <https://codeberg.org/uzu/strudel>
- The `@strudel/web` package README is the authority on embedding.

---

## What it is, in one paragraph

Strudel is the JavaScript port of **TidalCycles** — a _pattern_ language for music. You describe music
as patterns (functions of time over repeating **cycles**) and transform them with combinators. Its
own Web-Audio engine, **`superdough`**, makes the sound — so, unlike Tidal, it needs no SuperCollider
and runs entirely in the browser. Built by Felix Roos and the Tidal community.

**License: AGPL-3.0** (strong copyleft). Fine for us because the game is open-source and ships via
GitHub / Google Play / F-Droid, never the Apple App Store — see the project memory on distribution.

---

## Package map

| Package                                                                   | What it does                                                                                                                                              |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@strudel/core`                                                           | The pattern engine — the `Pattern` class, combinators (`stack`, `cat`, `fast`, …), signals.                                                               |
| `@strudel/mini`                                                           | The mini-notation parser (the stuff inside `"..."` strings).                                                                                              |
| `@strudel/transpiler`                                                     | Rewrites the relaxed REPL syntax (bare top-level patterns, operator overloading like `+`) into real JS. The REPL uses it; a plain TS import path may not. |
| `superdough`                                                              | The Web-Audio output engine (synths, samples, effects). Owns the `AudioContext`.                                                                          |
| `@strudel/webaudio`                                                       | Glue binding patterns → `superdough` (the `webaudioOutput` / scheduler trigger).                                                                          |
| `@strudel/web`                                                            | **All-in-one convenience package for embedding.** Exposes `initStrudel()` and installs the global pattern functions. This is the one we want.             |
| `@strudel/tonal`, `@strudel/soundfonts`, `@strudel/repl`/`@strudel/embed` | Extras: music theory helpers, soundfont samples, the `<strudel-editor>` web component.                                                                    |

For `np-audio` we almost certainly depend on **`@strudel/web`** (and reach into **`superdough`** for
one-shot SFX). Keep all of these imports inside the `StrudelMusicEngine` so the `MusicEngine` seam
stays clean.

---

## Embedding in our own code

✅ **Verified embedding recipe** (`@strudel/web` 1.3.0). `@strudel/web` re-exports _everything_ from
`@strudel/core`, `@strudel/webaudio`, `@strudel/transpiler`, `@strudel/mini`, `@strudel/tonal`, so the
music engine needs only this one package:

```ts
import { initStrudel, evaluate, hush, getAudioContext } from '@strudel/web';

// initStrudel() returns Promise<repl>. It calls initAudioOnFirstClick(), wires a webaudio repl with
// the transpiler, and prebakes the synth sounds (registerSynthSounds) + eval scope. Globals are also
// installed on window, but the named exports above are real ESM exports — use those in a typed lib.
const repl = await initStrudel();

// Drive the engine with CODE STRINGS via evaluate() — the transpiler handles mini-notation, operator
// overloading and multi-track `$:` syntax. This is why a "mood" is literally a Strudel code string.
await evaluate(`
  setcpm(40/4)
  $: note("c2 eb2 g2 bb1").slow(2).s("sawtooth").lpf(400).room(0.8).gain(0.7)
`);

hush(); // stop everything  (== repl.stop())
getAudioContext().resume(); // explicit unlock on a user gesture (iOS/Capacitor)
```

Notes:

- **Drive via `evaluate(codeString)`**, not hand-built `Pattern` objects — simpler, fully
  transpiler-powered, and it makes a mood pure data (a string in np-config). Signature:
  `evaluate(code, autoplay = true)`.
- `Pattern.prototype.play()` also works post-init (sets the pattern on the default scheduler), but the
  code-string path is the one we use.
- The returned `repl` exposes `.evaluate/.stop/.setPattern/.scheduler`; the named `evaluate`/`hush`
  exports delegate to it. `silence` is the empty pattern (a handy idle deck).

---

## The audio engine (`superdough`) + AudioContext

- ✅ `getAudioContext()` (exported from `@strudel/web`, originally `@strudel/webaudio`/`superdough`)
  returns the single shared `AudioContext` — a singleton, so the music engine and the SFX player hit
  the same context automatically.
- ✅ **Unlock:** `initStrudel()` already registers `initAudioOnFirstClick()`. For Capacitor/iOS we also
  expose an explicit `unlock()` that calls `getAudioContext().resume()` from our tap-to-start.
- **Sharing with Phaser:** superdough owns THE context (the singleton above). The clean answer is to
  let it own game audio entirely and **not** use Phaser's sound manager — np-audio is
  Phaser-independent anyway. One context, one unlock, no fighting.

---

## Pattern language cheat-sheet (this part is reliable)

### Mini-notation (inside `"..."`)

| Syntax                    | Meaning                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `"a b c"`                 | sequence — 3 events spread over one cycle                     |
| `"a [b c]"`               | sub-sequence — `b c` share the slot (nesting subdivides time) |
| `"a*2"` / `"a/2"`         | speed a slot up / slow it down                                |
| `"~"`                     | rest                                                          |
| `"<a b c>"`               | alternate — one per cycle (slow rotation)                     |
| `"[a, c, e]"`             | stack — play in parallel (a chord)                            |
| `"a!3"` / `"a@3 b"`       | replicate / elongate (weighting)                              |
| `"a(3,8)"` / `"a(3,8,2)"` | Euclidean rhythm (pulses, steps, optional rotation)           |
| `"a?"`                    | randomly drop (50%)                                           |
| `"0 .. 7"`                | numeric range expansion                                       |

### JS combinators & transforms

- **Build:** `stack(a, b, …)` (parallel), `cat(a,b)`/`slowcat` (one per cycle), `sequence`/`fastcat`,
  `arrange([n, pat], …)`.
- **Time:** `.fast(n)`, `.slow(n)`, `.rev()`, `.iter(n)`, `.palindrome()`, `.ply(n)`, `.off(t, fn)`,
  `.early(t)`/`.late(t)`.
- **Probabilistic / conditional:** `.every(n, fn)`, `.when(cond, fn)`, `.sometimes(fn)`,
  `.somecyclesBy(p, fn)`, `.degradeBy(p)` / `.undegradeBy(p)`.
- **Stereo / thicken:** `.jux(fn)` (apply to right channel only), `.superimpose(fn)`, `.add/.sub/.mul`.

### Sound + pitch

- `note("c3 e3 g3")` (named/MIDI), `n("0 2 4").scale("C:minor")` (scale degrees), `sound("sawtooth")`
  / `s(...)` (synth or sample name), `freq(...)`.

### Effects (the mood knobs)

`gain`, `pan`, `lpf`/`cutoff`, `hpf`, `resonance`/`lpq`, `room` (reverb amount), `roomsize`/`size`,
`delay`, `delaytime`, `delayfeedback`, `shape` (distortion), `crush` (bitcrush), `coarse`, `vowel`.
Envelope: `attack`, `decay`, `sustain`, `release` (or `adsr`).

### Signals (continuous modulators)

`sine`, `cosine`, `saw`, `square`, `tri`, `rand`, `perlin`, `irand(n)`. Shape them with
`.range(min, max)`, `.slow(n)`/`.fast(n)`, `.segment(n)` (sample-and-hold into steps).
Example: a slowly breathing filter — `.lpf(sine.range(300, 1800).slow(16))`.

### Tempo

✅ `setcpm(cyclesPerMinute)` sets tempo (also `setcps(cyclesPerSecond)`; the `repl` handle returns
`setCps`). Examples write `setcpm(120/4)` — the `/4` is just the convention of treating a cycle as a
bar of 4 beats. A "cycle" is the basic bar-like unit.

---

## The three things `np-audio` specifically needs

### 1. Reactive control (the `intensity` knob)

Goal: push a live `0..1` value from np-state into the music.

- ✅ **Re-evaluate on change (our v1).** Rebuild the mood code string with the new intensity and call
  `evaluate(...)`; the scheduler swaps at the next cycle boundary (free musical quantization; updates
  per cycle, which is fine for a calm↔encounter switch). Uses only confirmed APIs.
- **⚠️ open — continuous control.** For smooth per-frame modulation, a signal sampling a live closure
  (conceptually `signal(() => intensity)`, used as `.lpf(signal(() => intensity).range(200, 4000))`)
  would track without re-evaluating. Public API name unconfirmed — verify before relying on it.
- The `slider()` widget is **REPL-only** — not for programmatic control.

Map `intensity` to **layer gains** (vertical layering) first — the robust, musical technique — and to
a filter cutoff second. Always **ramp**, never jump.

### 2. One-shot SFX (synthesized, no samples)

Patterns loop; SFX fire once. ✅ Confirmed primitive — call `superdough(value, deadline, duration)`
directly (imported from the `superdough` package), bypassing the pattern scheduler:

```ts
import { superdough, getAudioContext } from 'superdough';
// fire a short synth "blip" now
superdough({ s: 'sawtooth', note: 'c5', cutoff: 2000, release: 0.15, gain: 0.8 }, getAudioContext().currentTime, 0.15);
```

`value` accepts the full control set (`s`, `note`, `gain`, `cutoff`, `resonance`, `room`, `delay`,
`pan`, `crush`, `distort`, `vowel`, `orbit`, …). `deadline` is in the audio context's time base;
`duration` is seconds. Importing from `superdough` keeps `SfxPlayer` independent of the music engine
(the intended split). SFX definitions (id → params + duration) live in np-config.

### 3. Crossfading moods (implemented as a master-gain dip)

A true two-track _overlap_ isn't clean here: Strudel runs **one scheduler with one global tempo**, and
music + SFX share **one output sink** (superdough's `destinationGain`). So `StrudelMusicEngine` does a
**crossfade through a brief dip** instead — sample-accurate via Web Audio:

```ts
// master = getSuperdoughAudioController().destinationGain  (the one master GainNode)
master.gain.linearRampToValueAtTime(0, now + fadeMs / 2000); // ramp down
setTimeout(() => {
    // at the silent point…
    evaluate(newMoodCode); // …swap the mood
    master.gain.linearRampToValueAtTime(1, t + fadeMs / 2000); // …ramp back up
}, fadeMs / 2);
```

It momentarily ducks SFX too (shared master) — which actually reinforces a sector/mode transition.
Falls back to an instant swap if `destinationGain` isn't reachable. A true music-only overlap would
need per-source routing (separate orbits/GainNodes) — deferred (see Open items).

---

## Samples (deferred, but purely additive)

We start synth-only, but samples will come. They're **first-class in `superdough`** and adding them is
_not_ a re-architecture — the `MusicEngine`/`SfxPlayer` interfaces are agnostic, since a pattern can
reference a synth or a sample interchangeably. Three isolated steps when the time comes:

1. **Asset copy** — add one glob to the app `project.json` (`input: libs/np-audio/src/assets`,
   `output: ./np-audio`), like np-phaser/np-space-map do. (Deferred now because pure-synth needs no assets.)
2. **Register the bank** in the engine's init/prebake (**⚠️ verify** signatures), then reference via `s("…")`:
    ```ts
    await samples({ bd: 'np-audio/samples/kick.wav', hh: 'np-audio/samples/hat.wav' }); // name → url map
    // or a bank:  await samples('np-audio/samples/strudel.json');  /  samples('github:user/repo')
    s('bd hh sd hh');
    ```
3. **Content** — sample-backed mood/SFX definitions go in np-config next to the synth ones.

Realities of samples (not blockers, just things to plan for):

- superdough **loads samples async** (fetch + decode) → there's a preload/readiness step; await it in the
  `unlock()`/init path before playing.
- Sample **bytes count against the mobile budget** (synth params don't).
- Sample files need **CC0/permissive licenses** — a new licensing surface given our distribution.

To keep this a one-place change, `StrudelMusicEngine` will ship with a **no-op `prebake()` sample-load
seam** so wiring samples later = filling one method + adding one project.json glob.

---

## How this lands in `np-audio` (design recap)

- `MusicEngine` interface (`init/play/setIntensity/stop`) → `StrudelMusicEngine` is the only file that
  imports `@strudel/web`/`superdough`. Swap seam intact (a `ToneMusicEngine` is the escape hatch).
- `SfxPlayer` → fires one-shot synth hits via `superdough`.
- A mixer of named gain channels (master → music, sfx{ui, weapons, ambient}).
- `NpAudioService` (root, Angular) owns the context + `unlock()`, exposes `music` / `sfx` / `mixer`,
  is injected into scene constructors (like np-state), and drives `setIntensity` from an `effect()`
  over `state.tension()`.
- **Pure synths, no `.ogg` / samples** for now. Content (mood→pattern, sfx→params) lives in np-config.

---

## ⚠️ Open items (verify before relying on)

The embedding/engine APIs above were verified against the installed `@strudel/web` 1.3.0 /
`superdough` 1.3.0. What's still genuinely open:

1. **Continuous reactive control** — the public `signal(() => x)` / `ref` mechanism for per-frame
   parameter modulation (our v1 sidesteps it by re-evaluating per cycle).
2. **Music-only gain / true overlap** — transitions use superdough's single master `destinationGain`
   (a dip crossfade that also ducks SFX). A music-only bus + a real two-track overlap would need
   per-source routing (separate orbits / `GainNode`s); deferred. The `AudioMixer`'s music-bus volume
   isn't applied yet for the same reason (SFX gain is).
3. **Cycle-aligned transitions** — exact mechanism to quantize a rhythmic crossfade to the bar (the
   deferred nicety; a gain-ramp crossfade doesn't need it).
4. **`samples(...)`** signatures (name→url map / bank JSON / `github:` shorthand) and awaiting load
   readiness — only when we add samples later.
