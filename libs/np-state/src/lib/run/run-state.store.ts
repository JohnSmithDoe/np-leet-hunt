import { BehaviorSubject, Observable } from 'rxjs';

import { SECTOR_COUNT, SECTOR_ORDER } from '../balance/balance.model';
import { ResourceDelta, Resources, STARTING_RESOURCES } from '../model/resources';
import { CrewMember, RunContext, SectorId } from '../model/run-context';
import { GameState } from './game-state';

/**
 * The live run state (Leet-27). A plain class — no Angular, no Phaser — so it unit-tests directly (cf.
 * normality-front.spec.ts). The Angular `GameStateService` owns one instance and the app hands it to
 * scenes typed as `GameState`. Every mutation clamps/guards, then publishes a fresh snapshot on
 * `changes$`.
 */
export class RunStateStore implements GameState {
    #resources: Resources = { ...STARTING_RESOURCES };
    #items: string[] = [];
    #flags = new Set<string>();
    #crew = new Set<CrewMember>();
    #sector: SectorId = 'home-reach';
    #sectorNumber = 1;
    #changes = new BehaviorSubject<RunContext>(this.snapshot());
    readonly changes$: Observable<RunContext> = this.#changes.asObservable();

    get resources(): Readonly<Resources> {
        return this.#resources;
    }
    get sector(): SectorId {
        return this.#sector;
    }

    adjustResources(delta: ResourceDelta): void {
        this.#resources = {
            hull: Math.max(0, this.#resources.hull + (delta.hull ?? 0)),
            heart: Math.max(0, this.#resources.heart + (delta.heart ?? 0)),
            marbles: Math.max(0, this.#resources.marbles + (delta.marbles ?? 0)),
        };
        this.#publish();
    }

    grantItem(id: string): void {
        this.#items.push(id);
        this.#publish();
    }
    takeItem(id: string): void {
        this.#items = this.#items.filter(item => item !== id);
        this.#publish();
    }
    hasItem(id: string): boolean {
        return this.#items.includes(id);
    }

    setFlag(flag: string): void {
        this.#flags.add(flag);
        this.#publish();
    }
    hasFlag(flag: string): boolean {
        return this.#flags.has(flag);
    }

    addCrew(member: CrewMember): void {
        this.#crew.add(member);
        this.#publish();
    }
    hasCrew(member: CrewMember): boolean {
        return this.#crew.has(member);
    }

    snapshot(): RunContext {
        return {
            resources: { ...this.#resources },
            items: [...this.#items],
            flags: [...this.#flags],
            crew: [...this.#crew],
            sector: this.#sector,
            sectorNumber: this.#sectorNumber,
        };
    }

    /**
     * Advance to the next sector: bump the 1-based number and set the id from {@link SECTOR_ORDER}.
     * Caps at the last sector — the run-end decision (reaching the end) lives in the conductor / FSM.
     * Orchestration-only, so it sits on the store, not the mode-facing `GameState` interface.
     */
    advanceSector(): void {
        this.#sectorNumber = Math.min(SECTOR_COUNT, this.#sectorNumber + 1);
        this.#sector = SECTOR_ORDER[this.#sectorNumber - 1];
        this.#publish();
    }

    /** Reset to a fresh run (optionally seeded), then publish. Called by `GameStateService.startNewRun`. */
    reset(seed?: Partial<RunContext>): void {
        this.#resources = { ...STARTING_RESOURCES, ...(seed?.resources ?? {}) };
        this.#items = [...(seed?.items ?? [])];
        this.#flags = new Set(seed?.flags ?? []);
        this.#crew = new Set(seed?.crew ?? []);
        this.#sector = seed?.sector ?? 'home-reach';
        this.#sectorNumber = seed?.sectorNumber ?? 1;
        this.#publish();
    }

    #publish(): void {
        this.#changes.next(this.snapshot());
    }
}
