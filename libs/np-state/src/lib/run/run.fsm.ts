import { BehaviorSubject, Observable } from 'rxjs';

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

/** A tiny typed finite-state machine over `RunPhase`. Observable current phase; illegal moves throw. */
export class RunFsm {
    #current: RunPhase;
    #changes: BehaviorSubject<RunPhase>;
    readonly current$: Observable<RunPhase>;

    constructor(initial: RunPhase = 'hangar') {
        this.#current = initial;
        this.#changes = new BehaviorSubject<RunPhase>(initial);
        this.current$ = this.#changes.asObservable();
    }

    get current(): RunPhase {
        return this.#current;
    }

    /** True if `next` is a legal transition from the current phase. */
    can(next: RunPhase): boolean {
        return RUN_TRANSITIONS[this.#current].includes(next);
    }

    /** Transition to `next`, or throw if the table forbids it. */
    to(next: RunPhase): RunPhase {
        if (!this.can(next)) {
            throw new Error(`Illegal run transition: ${this.#current} → ${next}`);
        }
        this.#current = next;
        this.#changes.next(next);
        return next;
    }

    /** Force back to the hangar for a new run (bypasses the table). */
    reset(): void {
        this.#current = 'hangar';
        this.#changes.next('hangar');
    }
}
