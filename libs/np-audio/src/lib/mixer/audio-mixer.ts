import type { AudioChannel, MixLevels } from '@shared/np-config';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Named volume buses (master × per-channel). v1 tracks levels and exposes {@link gainFor} so callers
 * fold the gain into what they dispatch (SFX gain). Wiring a real `GainNode` bus for the *music*
 * output is TODO, pending the output-routing decision (see `docs/strudel-reference.md` "Open items").
 * Pure and synchronous, so it unit-tests directly.
 */
export class AudioMixer {
    #master = 1;
    readonly #channels: MixLevels;

    constructor(levels: MixLevels) {
        this.#channels = { ...levels };
    }

    get master(): number {
        return this.#master;
    }

    set master(value: number) {
        this.#master = clamp01(value);
    }

    /** A channel's own 0..1 level (before master). */
    volume(channel: AudioChannel): number {
        return this.#channels[channel];
    }

    setVolume(channel: AudioChannel, value: number): void {
        this.#channels[channel] = clamp01(value);
    }

    mute(channel: AudioChannel): void {
        this.setVolume(channel, 0);
    }

    /** Effective gain for a channel = master × channel level. */
    gainFor(channel: AudioChannel): number {
        return this.#master * this.#channels[channel];
    }
}
