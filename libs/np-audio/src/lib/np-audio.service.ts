import { Injectable, signal } from '@angular/core';
import { Audio, type MoodBuilder, type MoodId, type SfxId } from '@shared/np-config';

import { type MusicEngine, type MusicPlayOptions } from './engine/music-engine';
import { StrudelMusicEngine } from './engine/strudel-music-engine';
import { AudioMixer } from './mixer/audio-mixer';
import { type SfxPlayer } from './sfx/sfx-player';
import { SuperdoughSfxPlayer } from './sfx/superdough-sfx-player';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * The app-facing audio facade (root-provided, injected into scene constructors like np-state). Owns
 * the single audio context via the engine, resolves mood/SFX ids through np-config's {@link Audio}
 * registry, and exposes `music` / `sfx` / `mixer`. The concrete {@link StrudelMusicEngine} is the swap
 * point for the {@link MusicEngine} seam; the engine owns intensity + transitions, so this stays thin.
 *
 * Reactivity: `music.setIntensity` is manual for now. Wiring it to an `effect()` over an np-state
 * `tension()` signal (mid-travel encounter raises tension) is the next integration step.
 */
@Injectable({ providedIn: 'root' })
export class NpAudioService {
    readonly #engine: MusicEngine = new StrudelMusicEngine();
    readonly #sfx: SfxPlayer = new SuperdoughSfxPlayer();
    readonly mixer = new AudioMixer(Audio.defaultMix());

    readonly #ready = signal(false);
    readonly ready = this.#ready.asReadonly();

    readonly #muted = signal(false);
    /** Whether all audio is muted — bind this in templates for a mute toggle. */
    readonly muted = this.#muted.asReadonly();

    #mood: MoodId | null = null;
    // A loaded .strudel song (raw code), if one is the current source instead of a mood id.
    #song: MoodBuilder | null = null;

    /** Boot audio from the title-screen Start gesture: resume the context, init the engine, play any queued mood. */
    async unlock(): Promise<void> {
        if (this.#ready()) return;
        await this.#engine.init();
        this.#ready.set(true);
        this.#engine.setMuted(this.#muted()); // honour a mute toggled before audio booted
        if (this.#song) this.#engine.play(this.#song);
        else if (this.#mood) this.#engine.play(Audio.mood(this.#mood));
    }

    /** Flip the global mute. */
    toggleMute(): void {
        this.setMuted(!this.#muted());
    }

    /** Mute or unmute all audio (music + SFX). */
    setMuted(muted: boolean): void {
        this.#muted.set(muted);
        this.#engine.setMuted(muted);
    }

    readonly music = {
        play: (mood: MoodId, options?: MusicPlayOptions): void => {
            this.#mood = mood;
            this.#song = null;
            if (this.#ready()) this.#engine.play(Audio.mood(mood), options);
        },
        /** Load and play a `.strudel` song file by URL (e.g. `np-audio/song.strudel`). */
        playSong: async (url: string, options?: MusicPlayOptions): Promise<void> => {
            const code = await fetch(url).then(response => response.text());
            // A 404 returns the SPA index.html; don't try to evaluate HTML as a Strudel program.
            if (code.trimStart().startsWith('<')) return;
            const song: MoodBuilder = () => code;
            this.#mood = null;
            this.#song = song;
            if (this.#ready()) this.#engine.play(song, options);
        },
        setIntensity: (value: number): void => this.#engine.setIntensity(clamp01(value)),
        stop: (fadeMs?: number): void => {
            this.#mood = null;
            this.#song = null;
            this.#engine.stop(fadeMs);
        },
    };

    readonly sfx = {
        play: (id: SfxId): void => {
            if (!this.#ready()) return;
            const params = Audio.sfx(id);
            const channel = params.channel ?? 'ui';
            // Fold the mixer bus gain into the dispatched gain (superdough ignores the `channel` hint).
            this.#sfx.play({ ...params, gain: (params.gain ?? 1) * this.mixer.gainFor(channel) });
        },
    };
}
