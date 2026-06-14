import { Preferences } from '@capacitor/preferences';
import { PersistencePort } from '@shared/np-state';

/**
 * The platform-backed save adapter (Leet-30): np-state's `PersistencePort` implemented over Capacitor
 * Preferences. On native it uses the OS key-value store; on web it falls back to localStorage. Provided
 * for `PERSISTENCE_PORT` in `app.config.ts`, so np-state stays platform-agnostic (it ships only the
 * in-memory default).
 */
export class CapacitorPersistence implements PersistencePort {
    async read(key: string): Promise<string | null> {
        const { value } = await Preferences.get({ key });
        return value;
    }

    async write(key: string, value: string): Promise<void> {
        await Preferences.set({ key, value });
    }
}
