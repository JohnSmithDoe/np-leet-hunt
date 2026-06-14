import { PersistencePort } from './persistence.port';
import { emptySave, SAVE_VERSION, SaveFile } from './save-file';

const SAVE_KEY = 'leet-hunt.save';

/**
 * Lift a parsed-from-storage value to the current `SaveFile` shape. Older/partial/garbage input is
 * folded onto a pristine save, so a load can never crash on a stale file. The one real migration so far
 * is "no version field → v1"; add an `if (file.version < N)` block per future schema bump.
 */
export const migrate = (raw: unknown): SaveFile => {
    const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<SaveFile>;
    const base = emptySave();
    let file: SaveFile = {
        version: typeof data.version === 'number' ? data.version : 0,
        meta: { ...base.meta, ...(data.meta ?? {}) },
        settings: { ...(data.settings ?? {}) },
    };
    // v0 (pre-versioning) → v1: stamp the current version; meta defaults are already filled above.
    if (file.version < 1) {
        file = { ...file, version: 1 };
    }
    // Safety net: never hand back a version ahead of what this build understands.
    if (file.version > SAVE_VERSION) {
        file = { ...file, version: SAVE_VERSION };
    }
    return file;
};

/** Reads/writes the versioned meta save through a `PersistencePort`, migrating on load. */
export class SaveStore {
    #port: PersistencePort;
    #key: string;

    constructor(port: PersistencePort, key: string = SAVE_KEY) {
        this.#port = port;
        this.#key = key;
    }

    async load(): Promise<SaveFile> {
        const raw = await this.#port.read(this.#key);
        if (!raw) return emptySave();
        try {
            return migrate(JSON.parse(raw));
        } catch {
            return emptySave(); // corrupt JSON → start clean rather than crash the boot
        }
    }

    async save(file: SaveFile): Promise<void> {
        await this.#port.write(this.#key, JSON.stringify(file));
    }
}
