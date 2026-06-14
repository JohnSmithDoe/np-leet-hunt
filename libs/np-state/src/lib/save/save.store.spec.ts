import { InMemoryPersistence } from './persistence.port';
import { emptySave, SAVE_VERSION } from './save-file';
import { migrate, SaveStore } from './save.store';

describe('migrate', () => {
    it('stamps an unversioned (v0) file up to the current version, filling meta defaults', () => {
        const migrated = migrate({ meta: { petEvolution: 3 } });
        expect(migrated.version).toBe(SAVE_VERSION);
        expect(migrated.meta.petEvolution).toBe(3);
        expect(migrated.meta.unlocks).toEqual([]);
        expect(migrated.meta.storyPieces).toEqual([]);
    });

    it('folds garbage onto a pristine save', () => {
        expect(migrate(null)).toEqual(emptySave());
        expect(migrate('nonsense')).toEqual(emptySave());
    });

    it('never returns a version ahead of this build', () => {
        expect(migrate({ version: 999 }).version).toBe(SAVE_VERSION);
    });
});

describe('SaveStore', () => {
    it('round-trips a save through the persistence port', async () => {
        const store = new SaveStore(new InMemoryPersistence());
        const file = emptySave();
        file.meta.unlocks.push('first-rescue');
        await store.save(file);
        expect((await store.load()).meta.unlocks).toEqual(['first-rescue']);
    });

    it('returns a pristine save when nothing is stored', async () => {
        expect(await new SaveStore(new InMemoryPersistence()).load()).toEqual(emptySave());
    });

    it('migrates a legacy unversioned file on load', async () => {
        const port = new InMemoryPersistence();
        await port.write('leet-hunt.save', JSON.stringify({ meta: { petEvolution: 7 } }));
        const loaded = await new SaveStore(port).load();
        expect(loaded.version).toBe(SAVE_VERSION);
        expect(loaded.meta.petEvolution).toBe(7);
    });
});
