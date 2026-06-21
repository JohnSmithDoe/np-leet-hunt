import { MixLevels, MoodBuilder, SfxParams } from './audio.model';

/**
 * Per-mood Strudel code builders — synth-only (no samples loaded), so every voice is a registered
 * synth (`sawtooth`/`square`/`triangle`/`sine`) or noise (`white`/`brown`). Intensity (0..1) is the
 * tension knob: it opens filters, lifts gains, thins out the `degradeBy` masks (more notes/hats), and
 * brings in the kick — so the same mood tightens as a "mid-travel encounter raises tension". Tune by ear.
 *
 * `space.calm` — a slow minor pad over a long reverb, sparse panning triangle bells, and a faint brown
 * noise wind bed. `space.encounter` — a resonant bass ostinato, tense square stabs, fast noise hats,
 * and a sine kick that fades in with intensity.
 */
const MOODS: Record<string, MoodBuilder> = {
    'space.calm': i => `
        setcpm(20/4)
        $: note("<[c2,g2,c3,eb3] [ab1,c2,ab2,c3] [bb1,f2,bb2,d3] [g1,d2,g2,bb2]>").s("sawtooth").attack(3).release(5).lpf(sine.range(${Math.round(260 + i * 340)}, ${Math.round(900 + i * 1500)}).slow(24)).room(0.9).roomsize(3).gain(${(0.5 + i * 0.16).toFixed(2)})
        $: note("<eb5 g5 bb5 c6 g5>").s("triangle").slow(4).degradeBy(${(0.82 - i * 0.3).toFixed(2)}).attack(0.5).release(2).lpf(3500).room(0.95).roomsize(4).gain(${(0.15 + i * 0.12).toFixed(2)}).pan(sine.slow(17))
        $: s("brown").attack(3).release(5).lpf(${Math.round(380 + i * 500)}).room(0.6).gain(${(0.05 + i * 0.05).toFixed(2)})
    `,
    'space.encounter': i => `
        setcpm(68/4)
        $: note("c2 [eb2 c2] g1 [bb1 c2]").s("sawtooth").lpf(sine.range(${Math.round(350 + i * 700)}, ${Math.round(1100 + i * 2300)}).slow(8)).lpq(7).attack(0.01).release(0.22).room(0.25).gain(${(0.48 + i * 0.14).toFixed(2)})
        $: note("<[c3,eb3,g3] [ab2,c3,eb3] [bb2,d3,f3] [g2,bb2,d3]>").s("square").slow(2).attack(0.05).release(0.5).lpf(${Math.round(800 + i * 1700)}).room(0.45).gain(${(0.16 + i * 0.16).toFixed(2)})
        $: s("white*8").decay(0.03).sustain(0).degradeBy(${(0.55 - i * 0.45).toFixed(2)}).gain(${(0.04 + i * 0.28).toFixed(2)}).pan(0.4)
        $: note("c1*4").s("sine").attack(0.001).decay(0.16).sustain(0).release(0.05).gain(${(i * 0.42).toFixed(2)})
    `,
};

/** One-shot SFX, as superdough params. */
// SFX fire as one-shots through the shared @strudel/web superdough instance, so the repl-registered
// synth voices resolve — same waveforms the moods use.
const SFX: Record<string, SfxParams> = {
    'ui.veilMove': { s: 'sine', note: 'a4', release: 0.25, gain: 0.4, room: 0.3, channel: 'ui' },
    'ui.travel': { s: 'triangle', note: 'e5', cutoff: 4000, release: 0.09, gain: 0.5, channel: 'ui' },
    'weapon.shoot': { s: 'sawtooth', note: 'c5', cutoff: 2600, release: 0.12, gain: 0.5, channel: 'weapons' },
};

/** Default per-channel mix. */
const DEFAULT_MIX: MixLevels = { music: 0.8, ui: 1, weapons: 0.9, ambient: 0.7 };

/** Unknown ids fall back to the calm space wash / a soft blip, so a typo never goes silent-with-error. */
const FALLBACK_MOOD: MoodBuilder = i => MOODS['space.calm'](i);
const FALLBACK_SFX: SfxParams = { s: 'sine', note: 'c5', release: 0.15, gain: 0.3, channel: 'ui' };

/**
 * The declarative audio surface — the single place to tune what the game sounds like, mirroring how
 * {@link Balance} centralises difficulty. Pure data + builders; the `np-audio` engine consumes it.
 */
export class Audio {
    /** The {@link MoodBuilder} for a mood id (unknown ids fall back to the calm space mood). */
    static mood(id: string): MoodBuilder {
        return MOODS[id] ?? FALLBACK_MOOD;
    }

    /** The Strudel code for a mood at a given intensity (0..1). */
    static moodCode(id: string, intensity: number): string {
        return Audio.mood(id)(intensity);
    }

    /** A copy of the one-shot params for an SFX id (unknown ids → a soft default blip). */
    static sfx(id: string): SfxParams {
        return { ...(SFX[id] ?? FALLBACK_SFX) };
    }

    /** A copy of the default per-channel mix levels. */
    static defaultMix(): MixLevels {
        return { ...DEFAULT_MIX };
    }
}
