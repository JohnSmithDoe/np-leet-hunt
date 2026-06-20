import { inject, Injectable, InjectionToken, Signal } from '@angular/core';

import { RunContext } from './model/run-context';
import { RunFsm } from './run/run.fsm';
import { RunStateStore } from './run/run-state.store';
import { InMemoryPersistence, PersistencePort } from './save/persistence.port';
import { SaveStore } from './save/save.store';

/**
 * The storage backend for the meta save. Defaults to in-memory; the app overrides this provider with a
 * Capacitor-Preferences / localStorage adapter, so platform code stays out of np-state.
 */
export const PERSISTENCE_PORT = new InjectionToken<PersistencePort>('PERSISTENCE_PORT', {
    providedIn: 'root',
    factory: () => new InMemoryPersistence(),
});

/**
 * The Angular facade over game state — the only Angular-touching part of np-state. Owns the single run
 * store, the run FSM, and the save store, and mirrors the run snapshot into a `signal` for OnPush
 * HUD/overlay components. The app injects this and hands `run` (typed `GameState`) to Phaser scenes by
 * reference; np-phaser and the mode libs never see this class.
 */
@Injectable({ providedIn: 'root' })
export class GameStateService {
    readonly run = new RunStateStore();
    readonly fsm = new RunFsm();
    readonly save = new SaveStore(inject(PERSISTENCE_PORT));
    /**
     * The live run snapshot for Angular consumers (OnPush HUD/overlay components). Just the store's own
     * reactive signal — the Phaser HUD instead polls `run.resources` in its game loop.
     */
    readonly snapshot: Signal<RunContext> = this.run.changes;

    /** Start a fresh run: reset carried state + phase machine, then enter the first sector. */
    startNewRun(seed?: Partial<RunContext>): void {
        this.run.reset(seed);
        this.fsm.reset();
        this.fsm.to('sector');
    }
}
