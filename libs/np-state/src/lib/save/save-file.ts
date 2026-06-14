/**
 * The persisted meta save (Leet-30). Versioned from day one so every phase writes forward-compatible
 * data; `migrate` (save.store.ts) lifts older files to the current shape. Run state (`RunContext`) is
 * NOT here — that is ephemeral and resets each run; this is the cross-run meta only.
 */
export const SAVE_VERSION = 1;

export interface SaveMeta {
    /** Robo-pet class 001..999 (Paradroid). */
    petEvolution: number;
    /** Unlock ids earned across runs. */
    unlocks: string[];
    /** Story-piece ids collected across runs. */
    storyPieces: string[];
}

export interface SaveFile {
    version: number;
    meta: SaveMeta;
    settings: Record<string, unknown>;
}

/** A pristine save at the current version. */
export const emptySave = (): SaveFile => ({
    version: SAVE_VERSION,
    meta: { petEvolution: 0, unlocks: [], storyPieces: [] },
    settings: {},
});
