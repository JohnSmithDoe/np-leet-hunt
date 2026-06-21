import type { SfxParams } from '@shared/np-config';

import type { SfxPlayer } from './sfx-player';

// superdough drops any one-shot whose deadline is < the context's currentTime ("can't schedule in the
// past"). Since the call is async, a deadline of exactly "now" is already past by the time it's checked,
// so SFX get silently dropped. Schedule a hair ahead — imperceptible, but reliably in the future.
const SFX_LOOKAHEAD_S = 0.05;

/**
 * {@link SfxPlayer} backed by superdough's one-shot `superdough(value, deadline, duration)`. It loads
 * `@strudel/web` lazily — the SAME cached instance the music engine uses — so the one-shot resolves the
 * synth sounds the repl registered. (A direct `import 'superdough'` would be a second, empty registry →
 * "sound not found".) The first SFX kicks the import (instant once the engine has loaded it) then fires.
 */
export class SuperdoughSfxPlayer implements SfxPlayer {
    #superdough?: (value: object, deadline: number, duration?: number) => void;
    #now?: () => number;
    #loading?: Promise<void>;

    play(params: SfxParams, durationSec = 0.2): void {
        if (this.#superdough && this.#now) {
            this.#superdough(params, this.#now() + SFX_LOOKAHEAD_S, durationSec);
            return;
        }
        this.#loading ??= import('@strudel/web').then(module => {
            this.#superdough = module.superdough;
            this.#now = module.getAudioContextCurrentTime;
        });
        void this.#loading.then(() => this.#superdough?.(params, (this.#now?.() ?? 0) + SFX_LOOKAHEAD_S, durationSec));
    }
}
