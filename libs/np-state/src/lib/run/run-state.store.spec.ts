import { STARTING_RESOURCES } from '../model/resources';
import { RunStateStore } from './run-state.store';

describe('RunStateStore', () => {
    it('starts with the starting resources', () => {
        expect(new RunStateStore().resources).toEqual(STARTING_RESOURCES);
    });

    it('applies signed resource deltas and clamps each meter at zero', () => {
        const store = new RunStateStore();
        store.adjustResources({ marbles: 5, heart: -3 });
        expect(store.resources).toEqual({ hull: 10, heart: 7, marbles: 5 });
        store.adjustResources({ heart: -100 });
        expect(store.resources.heart).toBe(0);
    });

    it('grants, queries and takes items', () => {
        const store = new RunStateStore();
        store.grantItem('xeno-samples');
        expect(store.hasItem('xeno-samples')).toBe(true);
        store.takeItem('xeno-samples');
        expect(store.hasItem('xeno-samples')).toBe(false);
    });

    it('sets flags and adds crew', () => {
        const store = new RunStateStore();
        store.setFlag('grass-surveyed');
        store.addCrew('mom');
        expect(store.hasFlag('grass-surveyed')).toBe(true);
        expect(store.hasCrew('mom')).toBe(true);
        expect(store.hasCrew('dad')).toBe(false);
    });

    it('publishes a fresh snapshot on subscribe and on every mutation', () => {
        const store = new RunStateStore();
        const marbles: number[] = [];
        store.changes$.subscribe(ctx => marbles.push(ctx.resources.marbles));
        store.adjustResources({ marbles: 2 });
        store.adjustResources({ marbles: 3 });
        expect(marbles).toEqual([0, 2, 5]);
    });

    it('snapshot is detached — mutating it does not affect the store', () => {
        const store = new RunStateStore();
        const snap = store.snapshot();
        snap.items.push('hacked');
        snap.resources.hull = 999;
        expect(store.hasItem('hacked')).toBe(false);
        expect(store.resources.hull).toBe(10);
    });

    it('reset returns to a fresh run, optionally seeded', () => {
        const store = new RunStateStore();
        store.adjustResources({ marbles: 50 });
        store.reset();
        expect(store.resources).toEqual(STARTING_RESOURCES);
        store.reset({ resources: { hull: 5, heart: 5, marbles: 1 }, sector: 'ember-belt' });
        expect(store.resources.hull).toBe(5);
        expect(store.sector).toBe('ember-belt');
    });
});
