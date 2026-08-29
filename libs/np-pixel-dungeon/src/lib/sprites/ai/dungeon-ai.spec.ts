import { DungeonAiParams } from '@shared/np-config';
import { NPRng } from '@shared/np-library';

import { decideDungeonAi } from './dungeon-ai';
import { EBehaviourState, TDungeonAiMemory, TDungeonAiObservation } from './dungeon-ai.types';

// `decideDungeonAi` is the pure half of the brain: an observation + state + memory + params + RNG in, an
// intent + next state + updated memory out — no Phaser, no board, no mob. So it tests headless (the style of
// combat/factory specs) and the full Sleeping → Wandering → Hunting → Fleeing FSM is exercised directly.
// A fixed-seed RNG keeps the wander/wait roll deterministic and the test reproducible.
const rng = new NPRng('dungeon-ai-spec');

// Sector-1-ish tuning so the thresholds in the assertions are explicit and depth-independent.
const params: DungeonAiParams = {
    sightRange: 4,
    wakeOnSpotRadius: 3,
    loseTargetAfterTurns: 4,
    wanderChance: 0.6,
    fleeBelowHpPct: 0.25,
    alertRadius: 4,
};

const obs = (over: Partial<TDungeonAiObservation>): TDungeonAiObservation => ({
    selfTile: { x: 0, y: 0 },
    canSeePlayer: false,
    playerTile: { x: 5, y: 5 },
    isAdjacentToPlayer: false,
    distanceToPlayer: 10, // far by default, so the wake radius / sight don't trip unless a test sets them
    hpFraction: 1, // undamaged by default, so the flee guard doesn't trip unless a test lowers it
    ...over,
});

const mem = (over: Partial<TDungeonAiMemory> = {}): TDungeonAiMemory => ({ turnsSinceSeen: 0, ...over });

const decide = (o: Partial<TDungeonAiObservation>, state: EBehaviourState, memory = mem()) =>
    decideDungeonAi(obs(o), state, memory, params, rng);

describe('decideDungeonAi — sleeping', () => {
    it('stays asleep (wait) while the player is far and unseen', () => {
        const { intent, state } = decide({ distanceToPlayer: 9, canSeePlayer: false }, EBehaviourState.Sleeping);
        expect(intent.kind).toBe('wait');
        expect(state).toBe(EBehaviourState.Sleeping);
    });

    it('wakes to Hunting when the player comes within wakeOnSpotRadius (even unseen)', () => {
        const { intent, state } = decide(
            { distanceToPlayer: params.wakeOnSpotRadius, canSeePlayer: false },
            EBehaviourState.Sleeping
        );
        expect(intent.kind).toBe('hunt'); // jolted awake → pursue
        expect(state).toBe(EBehaviourState.Hunting);
    });

    it('wakes to Hunting on actually seeing the player (beyond the wake radius)', () => {
        const { intent, state } = decide(
            { distanceToPlayer: 9, canSeePlayer: true, playerTile: { x: 2, y: 2 } },
            EBehaviourState.Sleeping
        );
        expect(intent.kind).toBe('hunt');
        expect(intent.targetTile).toEqual({ x: 2, y: 2 });
        expect(state).toBe(EBehaviourState.Hunting);
    });

    it('does not flee while asleep, even at low HP (asleep means inert)', () => {
        const { intent, state } = decide(
            { distanceToPlayer: 9, canSeePlayer: false, hpFraction: 0.1 },
            EBehaviourState.Sleeping
        );
        expect(intent.kind).toBe('wait');
        expect(state).toBe(EBehaviourState.Sleeping);
    });
});

describe('decideDungeonAi — wandering', () => {
    it('locks on to Hunting when it spots the player', () => {
        const playerTile = { x: 3, y: 1 };
        const { intent, state } = decide({ canSeePlayer: true, playerTile }, EBehaviourState.Wandering);
        expect(intent.kind).toBe('hunt');
        expect(intent.targetTile).toEqual(playerTile);
        expect(state).toBe(EBehaviourState.Hunting);
    });

    it('attacks (and Hunts) if it happens to be adjacent to the player while wandering', () => {
        const { intent, state } = decide({ isAdjacentToPlayer: true }, EBehaviourState.Wandering);
        expect(intent.kind).toBe('attack');
        expect(state).toBe(EBehaviourState.Hunting);
    });

    it('rolls wander-or-wait when it cannot see the player (stays Wandering)', () => {
        const { intent, state } = decide({ canSeePlayer: false }, EBehaviourState.Wandering);
        expect(['wander', 'wait']).toContain(intent.kind);
        expect(state).toBe(EBehaviourState.Wandering);
    });

    it('honours wanderChance: 0 wanders never (always waits), 1 always wanders', () => {
        const never = decideDungeonAi(obs({}), EBehaviourState.Wandering, mem(), { ...params, wanderChance: 0 }, rng);
        expect(never.intent.kind).toBe('wait');
        const always = decideDungeonAi(obs({}), EBehaviourState.Wandering, mem(), { ...params, wanderChance: 1 }, rng);
        expect(always.intent.kind).toBe('wander');
    });
});

describe('decideDungeonAi — hunting', () => {
    it('attacks when adjacent to the player (and stays Hunting)', () => {
        const { intent, state } = decide({ isAdjacentToPlayer: true, canSeePlayer: true }, EBehaviourState.Hunting);
        expect(intent.kind).toBe('attack');
        expect(intent.targetTile).toBeUndefined();
        expect(state).toBe(EBehaviourState.Hunting);
    });

    it('attacks when adjacent even if vision is blocked (adjacency wins over sight)', () => {
        const { intent } = decide({ isAdjacentToPlayer: true, canSeePlayer: false }, EBehaviourState.Hunting);
        expect(intent.kind).toBe('attack');
    });

    it('pursues the live player tile and resets the give-up timer while in sight', () => {
        const playerTile = { x: 7, y: 3 };
        const { intent, state, memory } = decide(
            { canSeePlayer: true, playerTile, distanceToPlayer: 3 },
            EBehaviourState.Hunting,
            mem({ turnsSinceSeen: 2 })
        );
        expect(intent.kind).toBe('hunt');
        expect(intent.targetTile).toEqual(playerTile);
        expect(state).toBe(EBehaviourState.Hunting);
        expect(memory.lastSeenPlayerTile).toEqual(playerTile);
        expect(memory.turnsSinceSeen).toBe(0); // reset on sight
    });

    it('chases the last-seen tile after losing sight, ticking the give-up timer', () => {
        const lastSeen = { x: 6, y: 6 };
        const { intent, state, memory } = decide(
            { canSeePlayer: false },
            EBehaviourState.Hunting,
            mem({ lastSeenPlayerTile: lastSeen, turnsSinceSeen: 1 })
        );
        expect(intent.kind).toBe('hunt');
        expect(intent.targetTile).toEqual(lastSeen);
        expect(state).toBe(EBehaviourState.Hunting);
        expect(memory.turnsSinceSeen).toBe(2); // ticked
    });

    it('gives up (→ Wandering) once turnsSinceSeen exceeds loseTargetAfterTurns', () => {
        // The timer ticks INSIDE the core: start at loseTargetAfterTurns so this turn pushes it over.
        const start = mem({ lastSeenPlayerTile: { x: 6, y: 6 }, turnsSinceSeen: params.loseTargetAfterTurns });
        const { intent, state } = decide({ canSeePlayer: false }, EBehaviourState.Hunting, start);
        expect(['wander', 'wait']).toContain(intent.kind);
        expect(state).toBe(EBehaviourState.Wandering);
    });

    it('keeps hunting up to and including the give-up turn, only giving up afterwards', () => {
        const lastSeen = { x: 6, y: 6 };
        // turnsSinceSeen 0 → becomes 1..loseTargetAfterTurns: still hunting; only > threshold gives up.
        for (let started = 0; started < params.loseTargetAfterTurns; started++) {
            const { state } = decide(
                { canSeePlayer: false },
                EBehaviourState.Hunting,
                mem({ lastSeenPlayerTile: lastSeen, turnsSinceSeen: started })
            );
            expect(state).toBe(EBehaviourState.Hunting);
        }
    });
});

describe('decideDungeonAi — fleeing (HP guard)', () => {
    it('breaks off to Fleeing the moment HP drops below fleeBelowHpPct (mid-hunt)', () => {
        const { intent, state } = decide(
            { canSeePlayer: true, playerTile: { x: 5, y: 5 }, hpFraction: params.fleeBelowHpPct - 0.01 },
            EBehaviourState.Hunting
        );
        expect(intent.kind).toBe('flee');
        expect(intent.targetTile).toEqual({ x: 5, y: 5 }); // flee away from the player tile
        expect(state).toBe(EBehaviourState.Fleeing);
    });

    it('does not flee at exactly the threshold (strictly below triggers it)', () => {
        const { intent, state } = decide(
            { canSeePlayer: true, hpFraction: params.fleeBelowHpPct },
            EBehaviourState.Hunting
        );
        expect(intent.kind).not.toBe('flee');
        expect(state).toBe(EBehaviourState.Hunting);
    });

    it('keeps fleeing while still low on HP', () => {
        const { intent, state } = decide({ canSeePlayer: true, hpFraction: 0.1 }, EBehaviourState.Fleeing);
        expect(intent.kind).toBe('flee');
        expect(state).toBe(EBehaviourState.Fleeing);
    });

    it('keeps fleeing if HP recovered but the player is still in sight', () => {
        const { intent, state } = decide({ canSeePlayer: true, hpFraction: 1 }, EBehaviourState.Fleeing);
        expect(intent.kind).toBe('flee');
        expect(state).toBe(EBehaviourState.Fleeing);
    });

    it('calms down (→ Wandering) once HP recovered AND the player is out of sight', () => {
        const { intent, state } = decide({ canSeePlayer: false, hpFraction: 1 }, EBehaviourState.Fleeing);
        expect(['wander', 'wait']).toContain(intent.kind);
        expect(state).toBe(EBehaviourState.Wandering);
    });
});

describe('decideDungeonAi — sightRange / determinism', () => {
    it('returns the updated memory the brain stores (pure — no hidden state)', () => {
        const playerTile = { x: 4, y: 4 };
        const { memory } = decide({ canSeePlayer: true, playerTile }, EBehaviourState.Hunting);
        expect(memory.lastSeenPlayerTile).toEqual(playerTile);
        // a detached copy, not a shared reference to the observation tile
        expect(memory.lastSeenPlayerTile).not.toBe(playerTile);
    });

    it('replays identically for a given seed (same inputs → same wander/wait roll)', () => {
        const a = decideDungeonAi(obs({}), EBehaviourState.Wandering, mem(), params, new NPRng('seed-x'));
        const b = decideDungeonAi(obs({}), EBehaviourState.Wandering, mem(), params, new NPRng('seed-x'));
        expect(a.intent.kind).toBe(b.intent.kind);
    });
});
