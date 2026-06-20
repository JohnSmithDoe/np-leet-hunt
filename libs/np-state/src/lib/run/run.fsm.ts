import { Signal, signal } from '@angular/core';

/**
 * The phases of a single run (Leet-27 / GDD §7 spine):
 * hangar → sector → (event | dungeon | duel | boarding | guardian) → sectorExit → … → ending → hangar.
 */
export type RunPhase =
    | 'hangar'
    | 'sector'
    | 'event'
    | 'dungeon'
    | 'duel'
    | 'boarding'
    | 'guardian'
    | 'sectorExit'
    | 'ending';

/**
 * The legal next-phases for each phase. Anything not listed throws (see `RunFsm.to`), so an illegal run
 * transition is a loud bug rather than silent corruption. This table is the unit-tested spec of the
 * spine; the app's wrapper maps a phase change to a scene swap (Leet-28), the FSM never touches Phaser.
 */
export const RUN_TRANSITIONS: Readonly<Record<RunPhase, readonly RunPhase[]>> = {
    hangar: ['sector'],
    sector: ['event', 'dungeon', 'duel', 'boarding', 'guardian', 'sectorExit', 'ending'],
    event: ['sector', 'dungeon', 'duel', 'ending'],
    dungeon: ['sector', 'ending'],
    duel: ['sector', 'ending'],
    boarding: ['sector', 'ending'],
    guardian: ['sectorExit', 'ending'],
    sectorExit: ['sector', 'ending', 'hangar'],
    ending: ['hangar'],
};

/**
 * A tiny typed finite-state machine over `RunPhase`. The current phase is a reactive signal
 * ({@link phase}); illegal moves throw. Uses Angular's standalone `signal` primitive, which works
 * outside DI — the class stays unit-testable without TestBed (cf. run.fsm.spec.ts).
 */
export class RunFsm {
    readonly #phase = signal<RunPhase>('hangar');
    /** The current run phase, reactive. The app wires an `effect` on it to swap scenes (Leet-28). */
    readonly phase: Signal<RunPhase> = this.#phase.asReadonly();

    constructor(initial: RunPhase = 'hangar') {
        this.#phase.set(initial);
    }

    get current(): RunPhase {
        return this.#phase();
    }

    /** True if `next` is a legal transition from the current phase. */
    can(next: RunPhase): boolean {
        return RUN_TRANSITIONS[this.#phase()].includes(next);
    }

    /** Transition to `next`, or throw if the table forbids it. */
    to(next: RunPhase): RunPhase {
        if (!this.can(next)) {
            throw new Error(`Illegal run transition: ${this.#phase()} → ${next}`);
        }
        this.#phase.set(next);
        return next;
    }

    /** Force back to the hangar for a new run (bypasses the table). */
    reset(): void {
        this.#phase.set('hangar');
    }
}
