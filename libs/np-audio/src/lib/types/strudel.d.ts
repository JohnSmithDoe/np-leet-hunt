/**
 * Minimal ambient typings for the untyped `@strudel/web` package. `@strudel/web` re-exports
 * `@strudel/webaudio` → `superdough` (`export * from 'superdough'`), so the whole audio API is reachable
 * here. Standalone `.d.ts` *script* so `declare module` is a real declaration; the app build picks it
 * up via a `tsconfig.app.json` include. See `docs/strudel-reference.md`.
 *
 * IMPORTANT: get every audio function from THIS module. superdough keeps module-level state (the sound
 * registry + the audio context), and the bundler makes a direct `import 'superdough'` a *second*
 * instance whose registry is empty → "sound not found" on one-shots, and a dead master gain. One
 * instance = one registry = SFX, music, and the crossfade master all agree.
 */
declare module '@strudel/web' {
    export function initStrudel(options?: { prebake?: () => Promise<void> | void }): Promise<unknown>;
    export function evaluate(code: string, autoplay?: boolean): Promise<unknown>;
    export function hush(): void;
    export function getAudioContext(): AudioContext;
    export function getAudioContextCurrentTime(): number;
    /** The audio controller; `destinationGain` is the master GainNode (channelMerger → it → destination). */
    export function getSuperdoughAudioController(): { destinationGain?: GainNode } | undefined;
    /** Load a sample map (object, JSON-file URL, or `github:` repo) so `s("…")` / `.bank("…")` resolve. */
    export function samples(sampleMap: string | Record<string, unknown>, baseUrl?: string): Promise<void>;
    /** Fire a single sound directly (one-shot SFX): `value` is control params (s, note, gain, …). */
    export function superdough(value: object, deadline: number, duration?: number): void;
}
