/**
 * Identifies a musical mood / context. Known ids today: `space.calm`, `space.encounter`, `space.duel`.
 * Resolved to a {@link MoodBuilder} via the {@link Audio} registry.
 */
export type MoodId = string;

/** Identifies a one-shot sound effect. Known ids today: `ui.veilMove`, `weapon.shoot`. */
export type SfxId = string;

/** Mixer buses. A master volume sits above these. */
export type AudioChannel = 'music' | 'ui' | 'weapons' | 'ambient';

/** Per-channel 0..1 volumes (master excluded). */
export type MixLevels = Record<AudioChannel, number>;

/**
 * A mood is a *pure builder* from intensity (0..1) to a Strudel code string — so the same mood can
 * tense up without re-authoring it. Driving the engine with code strings is the confirmed embedding
 * path (see `docs/strudel-reference.md`), which makes "music as data" literal.
 */
export type MoodBuilder = (intensity: number) => string;

/**
 * Raw one-shot parameters handed straight to superdough's `superdough(value, …)` call. Superdough
 * accepts many more keys (delay, crush, distort, vowel, orbit, …) — add them here as needed.
 */
export interface SfxParams {
    /** Synth name today (e.g. `sawtooth`, `sine`); a sample name once samples land. */
    s?: string;
    note?: string | number;
    gain?: number;
    cutoff?: number;
    resonance?: number;
    room?: number;
    pan?: number;
    release?: number;
    /** Which mixer bus this SFX plays on (defaults to `ui`). Not a superdough key. */
    channel?: AudioChannel;
}
