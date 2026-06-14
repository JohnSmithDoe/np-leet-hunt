/**
 * The storage backend the save system writes through (ports & adapters). np-state ships only the
 * in-memory adapter (used by tests and as a safe default); the app provides a Capacitor-Preferences /
 * localStorage adapter, so platform code never leaks into this framework-agnostic lib.
 */
export interface PersistencePort {
    read(key: string): Promise<string | null>;
    write(key: string, value: string): Promise<void>;
}

/** Volatile adapter — keeps values in a `Map` for the process lifetime. Default + test backend. */
export class InMemoryPersistence implements PersistencePort {
    #store = new Map<string, string>();

    read(key: string): Promise<string | null> {
        return Promise.resolve(this.#store.get(key) ?? null);
    }
    write(key: string, value: string): Promise<void> {
        this.#store.set(key, value);
        return Promise.resolve();
    }
}
