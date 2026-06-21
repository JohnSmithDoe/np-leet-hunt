# np-audio

The game's audio framework: a thin, **engine-swappable** wrapper around [Strudel](https://strudel.cc)
(`@strudel/web` + `superdough`) for generative, data-driven music and SFX. Game code talks to a small
facade and never to Strudel directly — mirroring how `np-phaser` wraps Phaser.

See [`docs/strudel-reference.md`](../../docs/strudel-reference.md) for the Strudel API notes this builds on.

## How it works

- **`NpAudioService`** (root-provided, injected into scenes like np-state) is the facade. It owns the
  single audio context, unlocks it on a user gesture, and exposes `music` / `sfx` / `mixer`.
- **`MusicEngine`** is the swap seam. `StrudelMusicEngine` is the only file that imports Strudel
  (lazily, so the module stays safe to import in tests/SSR). A `ToneMusicEngine` could replace it.
- **`SfxPlayer`** fires one-shots via superdough's `superdough(...)` call — independent of the music
  engine, so swapping one never touches the other.
- **`AudioMixer`** tracks master × per-channel (`music` / `ui` / `weapons` / `ambient`) volumes.
- **Content lives in np-config** (`Audio`): a mood is a pure `(intensity) => StrudelCode` builder; an
  SFX is a superdough params object. "Music as data."

```ts
audio.unlock(); // from the first tap (iOS/Capacitor audio unlock)
audio.music.play('space.calm'); // mood id → Strudel code
audio.music.setIntensity(0.8); // tension rises → filter opens, layers/gain lift
audio.sfx.play('weapon.shoot'); // one-shot synth, routed to the `weapons` bus
audio.mixer.master = 0.7;
```

## Reactive music

A mood is a function of **intensity (0..1)**. `music.setIntensity(v)` rebuilds the current mood's code
(filter opens, gain/layers rise). Today it's manual; the planned wiring is an `effect()` over an
np-state `tension()` signal so a mid-travel encounter raises tension automatically.

## Status / gaps

Boots a mood, crossfades on transitions, and fires synth SFX. Known TODOs:

- **Crossfade** is a master-gain dip (ramp down → swap → ramp up via superdough's `destinationGain`),
  not a true two-track overlap — Strudel has one scheduler + one global tempo, and music/SFX share one
  sink, so the dip also briefly ducks SFX. A music-only overlap (per-source routing) is deferred.
- **Mixer → music** volume isn't applied to the music bus yet (only SFX); same routing dependency.
- **Continuous intensity** uses per-cycle re-evaluation, not a live signal.
- **Samples** are deferred (pure synth for now) but purely additive — see the reference doc.
- Tests cover the pure mixer only; the Strudel-touching code needs a real browser to exercise.
