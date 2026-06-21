# np-audio local samples

Bundled, self-hosted samples for the **song** (`../song.strudel`) — no CDN, no runtime fetch to a third
party. The synth moods/SFX need none of this; it's only for the song's drums + piano.

The engine's prebake loads `np-audio/samples/strudel.json` on init (through the shared `@strudel/web`
instance, so the repl resolves the sounds). The app build copies this whole folder to `np-audio/`.

## What's here

- **`strudel.json`** — the sample map (`_base: np-audio/samples/`): `bd`/`sd`/`hh`/`oh` drum variants and a
  note-mapped `piano`. Played by the song via `s("bd")` etc. and `note(...).s("piano")`.
- **`drums/`** — kick/snare/hat/open-hat from the **uzu-drumkit** (`tidalcycles/uzu-drumkit`), released
  into the **public domain (Unlicense)** — clean for our AGPL / F-Droid distribution.
- **`piano/`** — a note-sampled grand piano (`A0…C8`, `v8` velocity) from **`felixroos/dough-samples`**,
  Strudel's example sample repo (per-set licensing documented in its README; confirmed fine to use).

## Notes

- The song originally used `.bank("RolandTR909")` (a drum-machine bank we don't host) and `.piano()` (a
  CDN soundfont). Both were adapted: drums use the plain uzu kit (no bank), and `.piano()` → `.s("piano")`
  (the bundled note-sampled piano). The bass and the sector moods are pure synths.
- To add more sounds: drop the files here, add them to `strudel.json`, keeping CC0 / permissive sources.

## Attribution

- **Drums** (`drums/`) — [uzu-drumkit](https://github.com/tidalcycles/uzu-drumkit) by TidalCycles,
  released into the **public domain (The Unlicense)**.
- **Piano** (`piano/`) — the note-sampled grand piano from
  [dough-samples](https://github.com/felixroos/dough-samples) by Felix Roos, the default sample
  collection for superdough / Strudel. See that repo's README for each set's source and licence.

Thanks to the Strudel / TidalCycles community for releasing these freely.
