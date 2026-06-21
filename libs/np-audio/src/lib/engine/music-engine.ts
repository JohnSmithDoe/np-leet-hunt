import type { MoodBuilder } from '@shared/np-config';

/** Options for {@link MusicEngine.play}. */
export interface MusicPlayOptions {
    /** Crossfade duration from the current mood, in milliseconds. */
    fadeMs?: number;
}

/**
 * The swappable music seam. The whole game talks to this; only the concrete engine
 * ({@link StrudelMusicEngine} today) knows how sound is actually made — so the engine can be replaced
 * (e.g. a Tone.js engine) without touching callers. See `docs/strudel-reference.md`.
 */
export interface MusicEngine {
    /** Boot the engine (sets up the audio graph). Must be triggered from a user gesture. */
    init(): Promise<void>;
    /** Play a mood, crossfading from the current one. Safe to call before {@link init}. */
    play(mood: MoodBuilder, options?: MusicPlayOptions): void;
    /** Push the live 0..1 intensity knob; rebuilds the current mood for the new value. */
    setIntensity(value: number): void;
    /** Stop music, optionally fading out over `fadeMs`. */
    stop(fadeMs?: number): void;
    /** Mute/unmute all output by suspending/resuming the shared audio context (music *and* SFX). */
    setMuted(muted: boolean): void;
}
