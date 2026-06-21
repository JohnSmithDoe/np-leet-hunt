import { Signal, signal } from '@angular/core';
import {
    CrewMember,
    PET_BASE_CLASS,
    ResourceDelta,
    Resources,
    RunContext,
    SECTOR_COUNT,
    SECTOR_ORDER,
    SectorId,
    STARTING_RESOURCES,
} from '@shared/np-config';

import { GameState } from './game-state';

/**
 * The live run state (Leet-27). No Phaser, and no Angular beyond the standalone `signal` primitive
 * (which runs outside DI), so it still unit-tests directly without TestBed (cf. run-state.store.spec.ts).
 * The Angular `GameStateService` owns one instance and the app hands it to scenes typed as `GameState`.
 * Every mutation clamps/guards, then publishes a fresh snapshot on the reactive {@link changes} signal.
 */
export class RunStateStore implements GameState {
    #resources: Resources = { ...STARTING_RESOURCES };
    #items: string[] = [];
    #flags = new Set<string>();
    #crew = new Set<CrewMember>();
    #petClass = PET_BASE_CLASS;
    #sector: SectorId = 'home-reach';
    #sectorNumber = 1;
    readonly #changes = signal<RunContext>(this.snapshot());
    /** A fresh snapshot on construction and after every mutation. Angular consumers read this directly. */
    readonly changes: Signal<RunContext> = this.#changes.asReadonly();

    get resources(): Readonly<Resources> {
        return this.#resources;
    }
    get sector(): SectorId {
        return this.#sector;
    }
    get petClass(): number {
        return this.#petClass;
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

    /** Grow the robo-pet's class from a duel takeover (Leet-39). Raise-only — a takeover never downgrades it. */
    setPetClass(petClass: number): void {
        const next = Math.max(this.#petClass, Math.floor(petClass));
        if (next === this.#petClass) return;
        this.#petClass = next;
        this.#publish();
    }

    snapshot(): RunContext {
        return {
            resources: { ...this.#resources },
            items: [...this.#items],
            flags: [...this.#flags],
            crew: [...this.#crew],
            petClass: this.#petClass,
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
        this.#petClass = seed?.petClass ?? PET_BASE_CLASS;
        this.#sector = seed?.sector ?? 'home-reach';
        this.#sectorNumber = seed?.sectorNumber ?? 1;
        this.#publish();
    }

    #publish(): void {
        this.#changes.set(this.snapshot());
    }
}
