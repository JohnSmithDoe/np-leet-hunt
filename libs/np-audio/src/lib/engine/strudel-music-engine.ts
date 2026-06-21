import type { MoodBuilder } from '@shared/np-config';

import type { MusicEngine, MusicPlayOptions } from './music-engine';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * {@link MusicEngine} backed by Strudel. `@strudel/web` runs browser-only side effects at import time
 * and re-exports the whole superdough API, so it's **imported lazily inside {@link init}** and is the
 * single source of every audio function — `evaluate`, the crossfade master gain, sample loading, and
 * (via the SFX player) the one-shot. Sharing this ONE instance is essential: superdough keeps the sound
 * registry + audio context as module state, so a second `import 'superdough'` would be an empty registry.
 *
 * A mood is rendered by `evaluate()`-ing its code string; {@link setIntensity} re-evaluates (shifts at
 * the next cycle). Transitions crossfade through a brief dip on superdough's master `destinationGain`.
 */
export class StrudelMusicEngine implements MusicEngine {
    #started = false;
    #playing = false;
    #mood: MoodBuilder | null = null;
    #intensity = 0;

    #strudel?: typeof import('@strudel/web');
    #ctx?: AudioContext;
    #fadeTimer?: ReturnType<typeof setTimeout>;

    async init(): Promise<void> {
        if (this.#started) return;
        const strudel = await import('@strudel/web');
        this.#strudel = strudel; // set before initStrudel so #prebake (called during it) can use it
        this.#ctx = strudel.getAudioContext();
        // initStrudel registers initAudioOnFirstClick (resumes on the gesture); resume again to be sure.
        await strudel.initStrudel({ prebake: () => this.#prebake() });
        void this.#ctx.resume();
        this.#started = true;
        this.#render();
    }

    play(mood: MoodBuilder, options?: MusicPlayOptions): void {
        this.#mood = mood;
        if (!this.#started) return;
        const fadeMs = options?.fadeMs ?? 0;
        if (fadeMs > 0 && this.#playing) this.#crossfade(fadeMs);
        else this.#render();
    }

    setIntensity(value: number): void {
        this.#intensity = clamp01(value);
        if (this.#started && this.#playing) this.#render();
    }

    stop(fadeMs?: number): void {
        const ms = fadeMs ?? 0;
        const master = this.#masterGain();
        if (ms > 0 && master && this.#ctx) {
            this.#rampMaster(master, 0, ms / 1000);
            this.#after(ms, () => {
                this.#silence();
                this.#resetMaster(master);
            });
        } else {
            this.#silence();
        }
    }

    setMuted(muted: boolean): void {
        // Suspending the context silences everything (music + SFX) without fighting the crossfade ramps.
        if (muted) void this.#ctx?.suspend();
        else void this.#ctx?.resume();
    }

    #render(): void {
        if (!this.#mood) return;
        this.#playing = true;
        void this.#strudel?.evaluate(this.#mood(this.#intensity));
    }

    #silence(): void {
        this.#mood = null;
        this.#playing = false;
        this.#strudel?.hush();
    }

    #crossfade(fadeMs: number): void {
        const master = this.#masterGain();
        if (!master || !this.#ctx) {
            this.#render(); // fallback: instant swap when the master gain isn't reachable
            return;
        }
        const half = fadeMs / 2000; // seconds
        this.#rampMaster(master, 0, half);
        this.#after(fadeMs / 2, () => {
            this.#render();
            this.#rampMaster(master, 1, half, true);
        });
    }

    #rampMaster(master: GainNode, target: number, seconds: number, fromZero = false): void {
        if (!this.#ctx) return;
        const now = this.#ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(fromZero ? 0 : master.gain.value, now);
        master.gain.linearRampToValueAtTime(target, now + seconds);
    }

    #resetMaster(master: GainNode): void {
        if (!this.#ctx) return;
        master.gain.cancelScheduledValues(this.#ctx.currentTime);
        master.gain.setValueAtTime(1, this.#ctx.currentTime);
    }

    #masterGain(): GainNode | undefined {
        return this.#strudel?.getSuperdoughAudioController()?.destinationGain;
    }

    /** Register the bundled local sample pack (drums + piano) for the song, through the shared instance. */
    async #prebake(): Promise<void> {
        try {
            const response = await fetch('np-audio/samples/strudel.json');
            const text = response.ok ? await response.text() : '';
            // A missing file returns the SPA index.html; only parse a real JSON sample map.
            if (text.trimStart().startsWith('{')) {
                await this.#strudel?.samples(JSON.parse(text) as Record<string, unknown>);
            }
        } catch {
            // sample pack unavailable (e.g. dev server not restarted) — synth moods/SFX don't need it.
        }
    }

    #after(ms: number, fn: () => void): void {
        if (this.#fadeTimer) clearTimeout(this.#fadeTimer);
        this.#fadeTimer = setTimeout(fn, ms);
    }
}
