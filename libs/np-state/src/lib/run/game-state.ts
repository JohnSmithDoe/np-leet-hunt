import { Observable } from 'rxjs';

import { ResourceDelta, Resources } from '../model/resources';
import { CrewMember, RunContext, SectorId } from '../model/run-context';

/**
 * The contract a game mode codes against — resources, inventory, flags, crew. Implemented by
 * `RunStateStore` and handed to scenes by reference from the app (the composition root); modes depend on
 * this interface, never on the Angular facade, so they stay framework-agnostic. Intentionally narrow:
 * run-lifecycle controls (reset, sector entry) live on the concrete store, not here.
 */
export interface GameState {
    readonly resources: Readonly<Resources>;
    readonly sector: SectorId;
    /** Emits a fresh snapshot on every mutation. */
    readonly changes$: Observable<RunContext>;

    /** Apply a signed change to the meters; each meter is clamped at zero. */
    adjustResources(delta: ResourceDelta): void;
    grantItem(id: string): void;
    takeItem(id: string): void;
    hasItem(id: string): boolean;
    setFlag(flag: string): void;
    hasFlag(flag: string): boolean;
    addCrew(member: CrewMember): void;
    hasCrew(member: CrewMember): boolean;

    /** A detached, serialisable copy of the current run state. */
    snapshot(): RunContext;
}
