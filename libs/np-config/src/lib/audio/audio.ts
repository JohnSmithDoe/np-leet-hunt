import { SectorId } from '../model/run-context';
import { MixLevels, MoodBuilder, SfxParams } from './audio.model';

/**
 * Per-mood Strudel code builders. The engine's prebake loads a small local sample pack (the uzu drum kit
 * + a note-sampled grand piano — see np-audio's `SAMPLES.md`), so moods now layer those real instruments
 * (`bd`/`sd`/`hh`/`oh`, `note(...).s("piano")`) over the registered synth voices (`sawtooth`/`square`/
 * `sine`) and noise (`brown`). Every mood keeps a pure-synth floor (a pad or bass) so it still plays if
 * the sample pack is ever unavailable; the drums/piano are pure enrichment on top.
 *
 * Intensity (0..1) is the tension knob: it opens filters, lifts gains, thins the `degradeBy` masks (more
 * piano notes / hats), and fades the drums in — so the same mood tightens as "a mid-travel encounter
 * raises tension". All three moods share one C-minor progression (Cm–Ab–Bb–Gm) so crossfades stay in key.
 *
 * `space.calm` — a slow minor pad under a sparse, reverberant piano arpeggio with high drifting bells and
 * a faint brown-noise wind (the generic fallback / hangar wash). `space.encounter` — a resonant bass
 * ostinato, urgent syncopated piano stabs, and a backbeat that fades up with tension; the brooding
 * map-danger mood. `space.duel` — a driving 132-BPM combat track: four-on-the-floor drums, a pumping
 * bass, sixteenth hats, and a delayed piano hook over square stabs; the dedicated Paradroid-duel song.
 *
 * `sector.*` — one map track per sector ({@link SECTOR_ORDER}, vivid → drained toward the Hush), keyed
 * by {@link SectorId} and resolved via {@link Audio.sectorMoodId}. They escalate in **tempo and drive**
 * with depth so the run tightens as you near the Hush: `home-reach` 54 BPM (pad + piano, no drums) →
 * `frozen-drift` 66 BPM (icy piano, a heartbeat kick + sparse hats) → `ember-belt` 80 BPM (throbbing
 * bass, steady kick + warm groove) → `veiled-nebula` 96 BPM (pumping bass, backbeat, swirling delayed
 * lead) → `long-quiet` 116 BPM (four-on-the-floor, driving eighth bass, sixteenth hats, ominous lead).
 * Tune by ear.
 */
const MOODS: Record<string, MoodBuilder> = {
    'space.calm': i => `
        setcpm(20/4)
        $: note("<[c2,g2,c3,eb3] [ab1,c2,ab2,c3] [bb1,f2,bb2,d3] [g1,d2,g2,bb2]>").s("sawtooth").attack(3).release(5).lpf(sine.range(${Math.round(260 + i * 340)}, ${Math.round(900 + i * 1500)}).slow(24)).room(0.9).roomsize(3).gain(${(0.42 + i * 0.16).toFixed(2)})
        $: note("<[c5 eb5 g5 eb5] [c5 eb5 ab5 eb5] [d5 f5 bb5 f5] [bb4 d5 g5 d5]>").s("piano").degradeBy(${(0.55 - i * 0.4).toFixed(2)}).room(0.9).roomsize(4).gain(${(0.28 + i * 0.18).toFixed(2)}).pan(sine.slow(19).range(0.35, 0.65))
        $: note("<g6 eb6 d6 bb6>").s("piano").degradeBy(${(0.7 - i * 0.3).toFixed(2)}).room(0.95).roomsize(5).gain(${(0.1 + i * 0.1).toFixed(2)}).pan(perlin.range(0.2, 0.8))
        $: s("brown").attack(3).release(5).lpf(${Math.round(380 + i * 500)}).room(0.6).gain(${(0.05 + i * 0.05).toFixed(2)})
    `,
    'space.encounter': i => `
        setcpm(68/4)
        $: note("c2 [eb2 c2] g1 [bb1 c2]").s("sawtooth").lpf(sine.range(${Math.round(350 + i * 700)}, ${Math.round(1100 + i * 2300)}).slow(8)).lpq(7).attack(0.01).release(0.22).room(0.25).gain(${(0.44 + i * 0.12).toFixed(2)})
        $: note("<[c3,eb3,g3] [ab2,c3,eb3] [bb2,d3,f3] [g2,bb2,d3]>").s("piano").struct("x ~ x x ~ x ~ x").release(0.2).lpf(${Math.round(1400 + i * 2400)}).room(0.3).gain(${(0.18 + i * 0.18).toFixed(2)})
        $: s("bd ~ bd ~ bd ~ bd ~").gain(${(i * 0.85).toFixed(2)})
        $: s("~ ~ sd ~ ~ ~ sd ~").room(0.2).gain(${(i * 0.6).toFixed(2)})
        $: s("hh*8").degradeBy(${(0.5 - i * 0.45).toFixed(2)}).pan(0.4).gain(${(0.1 + i * 0.28).toFixed(2)})
    `,
    'space.duel': i => `
        setcpm(132/4)
        $: note("<[c2 c2 c2 c2 eb2 c2 g1 c2] [ab1 ab1 ab1 ab1 c2 ab1 eb1 ab1] [bb1 bb1 bb1 bb1 d2 bb1 f1 bb1] [g1 g1 g1 g1 bb1 g1 d1 g1]>").s("sawtooth").lpf(sine.range(${Math.round(500 + i * 600)}, ${Math.round(1500 + i * 2500)}).slow(4)).lpq(6).attack(0.01).release(0.11).gain(${(0.4 + i * 0.12).toFixed(2)})
        $: s("bd ~ bd ~ bd ~ bd ~").gain(${(0.45 + i * 0.4).toFixed(2)})
        $: s("~ ~ sd ~ ~ ~ sd ~").room(0.2).gain(${(0.35 + i * 0.35).toFixed(2)})
        $: s("hh*16").degradeBy(${(0.45 - i * 0.4).toFixed(2)}).pan(sine.fast(2).range(0.4, 0.6)).gain(${(0.08 + i * 0.2).toFixed(2)})
        $: s("~ oh ~ oh").gain(${(i * 0.25).toFixed(2)})
        $: note("<[c5 g5 eb5 c6] [c5 ab5 eb5 c6] [d5 bb5 f5 d6] [d5 g5 bb5 d6]>").s("piano").release(0.2).lpf(${Math.round(2000 + i * 3000)}).delay(0.35).delaytime(0.16).delayfeedback(0.3).room(0.25).gain(${(0.18 + i * 0.16).toFixed(2)})
        $: note("<[c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4] [g3,bb3,d4]>").s("square").struct("~ x ~ x").release(0.12).lpf(${Math.round(1200 + i * 2000)}).gain(${(i * 0.12).toFixed(2)})
    `,
    // --- per-sector map moods (ascending tempo + drive, vivid → drained toward the Hush) ---
    'sector.home-reach': i => `
        setcpm(54/4)
        $: note("<[c2,g2,c3,eb3] [ab1,c2,ab2,c3] [bb1,f2,bb2,d3] [g1,d2,g2,bb2]>").s("sawtooth").attack(2).release(4).lpf(sine.range(${Math.round(300 + i * 300)}, ${Math.round(1100 + i * 1400)}).slow(16)).room(0.9).roomsize(3).gain(${(0.4 + i * 0.12).toFixed(2)})
        $: note("<[c5 eb5 g5 eb5] [c5 eb5 ab5 eb5] [d5 f5 bb5 f5] [bb4 d5 g5 d5]>").s("piano").degradeBy(${(0.45 - i * 0.3).toFixed(2)}).room(0.8).roomsize(3).gain(${(0.28 + i * 0.12).toFixed(2)}).pan(sine.slow(15).range(0.4, 0.6))
        $: note("<g6 eb6 d6 bb6>").s("piano").degradeBy(${(0.6 - i * 0.3).toFixed(2)}).room(0.95).roomsize(5).gain(${(0.11 + i * 0.08).toFixed(2)}).pan(perlin.range(0.3, 0.7))
        $: s("brown").attack(3).release(5).lpf(${Math.round(420 + i * 500)}).room(0.5).gain(${(0.05 + i * 0.04).toFixed(2)})
    `,
    'sector.frozen-drift': i => `
        setcpm(66/4)
        $: note("<[c2,g2,c3,eb3] [ab1,c2,ab2,c3] [bb1,f2,bb2,d3] [g1,d2,g2,bb2]>").s("sawtooth").attack(1.5).release(3.5).lpf(sine.range(${Math.round(380 + i * 400)}, ${Math.round(1500 + i * 1800)}).slow(12)).room(0.92).roomsize(4).gain(${(0.38 + i * 0.12).toFixed(2)})
        $: note("<[g5 c6 eb6 c6] [ab5 c6 eb6 c6] [bb5 d6 f6 d6] [g5 bb5 d6 bb5]>").s("piano").degradeBy(${(0.45 - i * 0.35).toFixed(2)}).lpf(${Math.round(3000 + i * 2000)}).room(0.85).roomsize(4).gain(${(0.22 + i * 0.14).toFixed(2)}).pan(sine.slow(11).range(0.3, 0.7))
        $: s("bd ~ ~ ~ ~ ~ ~ ~").gain(${(0.42 + i * 0.3).toFixed(2)})
        $: s("hh ~ ~ hh ~ ~ hh ~").degradeBy(${(0.5 - i * 0.4).toFixed(2)}).pan(0.6).gain(${(0.12 + i * 0.16).toFixed(2)})
        $: s("brown").attack(2).release(4).lpf(${Math.round(600 + i * 600)}).room(0.5).gain(${(0.05 + i * 0.04).toFixed(2)})
    `,
    'sector.ember-belt': i => `
        setcpm(80/4)
        $: note("<[c2,g2,c3,eb3] [ab1,c2,ab2,c3] [bb1,f2,bb2,d3] [g1,d2,g2,bb2]>").s("sawtooth").attack(1).release(3).lpf(sine.range(${Math.round(340 + i * 400)}, ${Math.round(1200 + i * 1600)}).slow(10)).room(0.85).roomsize(3).gain(${(0.36 + i * 0.12).toFixed(2)})
        $: note("<[c2 ~ c2 c2] [ab1 ~ ab1 ab1] [bb1 ~ bb1 bb1] [g1 ~ g1 g1]>").s("sawtooth").lpf(${Math.round(700 + i * 900)}).lpq(4).attack(0.01).release(0.25).gain(${(0.32 + i * 0.12).toFixed(2)})
        $: s("bd ~ ~ ~ bd ~ ~ ~").gain(${(0.5 + i * 0.3).toFixed(2)})
        $: s("~ ~ ~ ~ ~ ~ sd ~").room(0.25).gain(${(0.2 + i * 0.25).toFixed(2)})
        $: s("hh*8").degradeBy(${(0.5 - i * 0.4).toFixed(2)}).pan(0.45).gain(${(0.1 + i * 0.2).toFixed(2)})
        $: note("<[eb5 g5] [c5 eb5] [d5 f5] [bb4 d5]>").s("piano").degradeBy(${(0.4 - i * 0.3).toFixed(2)}).room(0.5).gain(${(0.18 + i * 0.14).toFixed(2)})
    `,
    'sector.veiled-nebula': i => `
        setcpm(96/4)
        $: note("<[c2,g2,c3,eb3] [ab1,c2,ab2,c3] [bb1,f2,bb2,d3] [g1,d2,g2,bb2]>").s("sawtooth").attack(0.5).release(2).lpf(sine.range(${Math.round(360 + i * 500)}, ${Math.round(1400 + i * 2000)}).slow(8)).room(0.8).roomsize(4).gain(${(0.34 + i * 0.12).toFixed(2)})
        $: note("<[c2 c2 g1 c2] [ab1 ab1 eb1 ab1] [bb1 bb1 f1 bb1] [g1 g1 d1 g1]>").s("sawtooth").lpf(${Math.round(800 + i * 1100)}).lpq(6).attack(0.01).release(0.18).gain(${(0.34 + i * 0.12).toFixed(2)})
        $: s("bd ~ ~ ~ bd ~ bd ~").gain(${(0.5 + i * 0.3).toFixed(2)})
        $: s("~ ~ sd ~ ~ ~ sd ~").room(0.3).gain(${(0.32 + i * 0.25).toFixed(2)})
        $: s("hh*8").degradeBy(${(0.45 - i * 0.4).toFixed(2)}).pan(sine.slow(3).range(0.3, 0.7)).gain(${(0.1 + i * 0.2).toFixed(2)})
        $: note("<[g5 eb5 c5 g5] [ab5 eb5 c5 ab5] [bb5 f5 d5 bb5] [g5 d5 bb4 g5]>").s("piano").release(0.18).lpf(${Math.round(1800 + i * 2200)}).delay(0.3).delaytime(0.18).delayfeedback(0.3).room(0.3).gain(${(0.16 + i * 0.14).toFixed(2)})
    `,
    'sector.long-quiet': i => `
        setcpm(116/4)
        $: note("<[c2,g2,c3] [ab1,c2,ab2] [bb1,f2,bb2] [g1,d2,g2]>").s("sawtooth").attack(0.3).release(1.5).lpf(sine.range(${Math.round(380 + i * 500)}, ${Math.round(1300 + i * 2200)}).slow(6)).room(0.75).roomsize(4).gain(${(0.3 + i * 0.12).toFixed(2)})
        $: note("<[c2 c2 c2 c2 eb2 c2 g1 c2] [ab1 ab1 ab1 ab1 c2 ab1 eb1 ab1] [bb1 bb1 bb1 bb1 d2 bb1 f1 bb1] [g1 g1 g1 g1 bb1 g1 d1 g1]>").s("sawtooth").lpf(${Math.round(900 + i * 1300)}).lpq(6).attack(0.01).release(0.1).gain(${(0.36 + i * 0.12).toFixed(2)})
        $: s("bd ~ bd ~ bd ~ bd ~").gain(${(0.55 + i * 0.3).toFixed(2)})
        $: s("~ ~ sd ~ ~ ~ sd ~").room(0.25).gain(${(0.38 + i * 0.25).toFixed(2)})
        $: s("hh*16").degradeBy(${(0.4 - i * 0.35).toFixed(2)}).pan(sine.fast(2).range(0.4, 0.6)).gain(${(0.08 + i * 0.18).toFixed(2)})
        $: s("~ oh ~ oh").gain(${(0.16 + i * 0.2).toFixed(2)})
        $: note("<[c6 g5 eb5 c6] [c6 ab5 eb5 c6] [d6 bb5 f5 d6] [d6 g5 bb5 d6]>").s("piano").release(0.18).lpf(${Math.round(2200 + i * 2800)}).delay(0.35).delaytime(0.15).delayfeedback(0.32).room(0.25).gain(${(0.16 + i * 0.14).toFixed(2)})
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

    /** The mood id for a sector's escalating map track (e.g. `home-reach` → `sector.home-reach`). */
    static sectorMoodId(sector: SectorId): string {
        return `sector.${sector}`;
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
