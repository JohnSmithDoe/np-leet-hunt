import type { SfxParams } from '@shared/np-config';

/** Fires one-shot sounds. A swappable seam like {@link MusicEngine}; superdough-backed today. */
export interface SfxPlayer {
    /** Fire a one-shot now. `durationSec` defaults to a short blip. */
    play(params: SfxParams, durationSec?: number): void;
}
