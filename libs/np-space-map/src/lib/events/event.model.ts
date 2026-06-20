/**
 * The planet-event data model. See `event-system.md` (repo root) §3–§4 for the full spec and authoring
 * rules. Events are authored as typed data in `content/`, pooled and selected on planet arrival, and
 * resolved through the event dialog. This file is the single source of the shape; keep it in sync with
 * the spec.
 */

import type { CrewMember, ModeLaunch, SectorId } from '@shared/np-state';

/** Internal balance tag, never rendered (spec §4). Order of a question's answers is always good|neutral|bad. */
export type Tone = 'good' | 'neutral' | 'bad';

/** A planet event: a scene-setting intro wrapping a question tree. The unit of authoring and pooling. */
export interface PlanetEvent {
    /** Stable, kebab-case, unique. Also the migration key (spec §10). */
    id: string;
    /** Scene-setter, shown once on arrival. */
    intro: string;
    /** The first decision. */
    root: Question;
    /** Pool membership; omit = core pool (eligible in any sector). */
    sector?: SectorId;
    /** Relative draw weight within its pool (default 1). */
    weight?: number;
    /** Event only enters the pool if the run meets this (omit = always). */
    gate?: Requirement;
}

/** Exactly three answers, internally ordered good | neutral | bad. */
export interface Question {
    prompt: string;
    answers: [Answer, Answer, Answer];
}

export interface Answer {
    /** The button label the player sees. */
    choice: string;
    /** Internal tag — never rendered (spec §4). */
    tone: Tone;
    /** Gated answer (crew/pet/item/flag) — shown locked with its reason by default (spec §4). */
    gate?: Requirement;
    /**
     * The stake paid the *moment this answer is chosen* — applied before its follow-up or outcome
     * (spec §4/§8). A risk/commitment mechanic: you spend to take the branch, then its outcome decides
     * the payoff. Typically negative `resource` deltas (trade hull/heart/marbles for a shot at more).
     * Omit for a free choice.
     */
    cost?: Effect[];
    /** Branch one level deeper — recursion allowed (flexible depth). Exactly one of followUp/outcome (spec §4). */
    followUp?: Question;
    /** ...or resolve here. */
    outcome?: Outcome;
}

export interface Outcome {
    /** Narrative shown after the choice. */
    resultText: string;
    /** Applied in order (spec §8). Empty = pure flavour, no state change. */
    effects: Effect[];
}

/** What an outcome does to the run (spec §3/§8). */
export type Effect =
    | { kind: 'resource'; hull?: number; heart?: number; marbles?: number } // signed deltas
    | { kind: 'item'; grant?: string; take?: string } // inventory ids
    | { kind: 'spawnGame'; game: 'dungeon' | 'duel'; reason: string; launch?: ModeLaunch } // hand-off (Leet-29)
    | { kind: 'openRoute'; to: string } // reveal a map connection
    | { kind: 'front'; advance: number } // <0 = distortion-battery pushback
    | { kind: 'flag'; set: string }; // run-scoped story/state flag

/** Unlock condition for an event entering its pool, or for a gated answer (spec §3/§4). */
export type Requirement =
    | { kind: 'crew'; member: CrewMember } // rescued & aboard
    | { kind: 'item'; id: string } // in inventory
    | { kind: 'petClass'; atLeast: number } // robo-pet class 001..999 (Paradroid)
    | { kind: 'flag'; set: string }; // a flag previously set this run
