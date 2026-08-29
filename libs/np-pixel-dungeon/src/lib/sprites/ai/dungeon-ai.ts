import { DungeonAiParams } from '@shared/np-config';
import { NPRng } from '@shared/np-library';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { EBehaviourState, TAiIntent, TDungeonAiMemory, TDungeonAiObservation } from './dungeon-ai.types';

/** The decision core's return: the intent to enact, the next FSM state, and the updated pursuit memory. */
interface TDungeonAiDecision {
    intent: TAiIntent;
    state: EBehaviourState;
    memory: TDungeonAiMemory;
}

/**
 * The pure decision core for dungeon enemy AI (RPG cluster E / item #12) — the `ParadroidAi.decide` analogue
 * and the full behaviour state machine **Sleeping → Wandering → Hunting → Fleeing**. Given what the mob
 * {@link TDungeonAiObservation observes}, its current {@link EBehaviourState}, its pursuit {@link TDungeonAiMemory},
 * the depth-scaled {@link DungeonAiParams} tuning and an {@link NPRng}, it returns the intent for this turn, the
 * next state and the updated memory. **Pure and headless-testable**: no Phaser, no board, no mob — just numbers,
 * booleans, tiles and a seeded RNG, so the spec exercises it directly.
 *
 * The states, and the transitions between them:
 *  - **Sleeping** — stays asleep (`wait`) until the player comes within `wakeOnSpotRadius` OR is actually seen;
 *    then wakes straight to **Hunting** (recording the sighting).
 *  - **Wandering** — sees the player → **Hunting**; else takes a random step with probability `wanderChance`,
 *    otherwise `wait` (so roamers aren't in perpetual motion).
 *  - **Hunting** — adjacent → `attack`; else sees the player → refresh the last-seen tile, reset the give-up
 *    timer and `hunt` toward the player; else (sight lost) tick the timer and `hunt` toward the last-seen tile
 *    until it exceeds `loseTargetAfterTurns`, then give up → **Wandering**.
 *  - **Fleeing** — `flee` (run from the player) while still low on HP; once HP recovers above the threshold AND
 *    the player is out of sight, calm down → **Wandering**. (Mobs don't heal yet, so a fleer near the player
 *    keeps fleeing — acceptable.)
 *
 * The flee guard sits ABOVE the per-state logic: any awake state flips to **Fleeing** the moment
 * `hpFraction < fleeBelowHpPct`, so a wounded hunter/wanderer breaks off mid-pursuit. A sleeping mob is left
 * to wake first (it can't be hurt while dormant in practice, but the guard skips it to keep "asleep means
 * inert" honest).
 */
export function decideDungeonAi(
    obs: TDungeonAiObservation,
    state: EBehaviourState,
    memory: TDungeonAiMemory,
    params: DungeonAiParams,
    rng: NPRng
): TDungeonAiDecision {
    // Track the sighting in a working copy so every return threads fresh, consistent memory. Seeing the
    // player pins the last-seen tile and zeroes the give-up timer; otherwise the timer ticks (a hunter that
    // lost sight counts down toward giving up). Sleeping mobs don't pursue, so they never tick the timer.
    const mem: TDungeonAiMemory = { ...memory };
    const wasAsleep = state === EBehaviourState.Sleeping;
    if (obs.canSeePlayer) {
        mem.lastSeenPlayerTile = { ...obs.playerTile };
        mem.turnsSinceSeen = 0;
    } else if (!wasAsleep) {
        mem.turnsSinceSeen = memory.turnsSinceSeen + 1;
    }

    // --- Sleeping: dormant until roused -------------------------------------------------------------------
    if (wasAsleep) {
        const woken = obs.canSeePlayer || obs.distanceToPlayer <= params.wakeOnSpotRadius;
        if (!woken) return { intent: { kind: 'wait' }, state: EBehaviourState.Sleeping, memory: mem };
        // Jolted awake — go straight to hunting from where it last sensed the player.
        if (!mem.lastSeenPlayerTile) mem.lastSeenPlayerTile = { ...obs.playerTile };
        return hunt(obs.playerTile, mem);
    }

    // --- Flee guard: a wounded mob breaks off whatever it was doing ---------------------------------------
    if (obs.hpFraction < params.fleeBelowHpPct) {
        return { intent: { kind: 'flee', targetTile: obs.playerTile }, state: EBehaviourState.Fleeing, memory: mem };
    }

    // --- Fleeing: keep running until safe (HP back up AND player out of sight) ----------------------------
    if (state === EBehaviourState.Fleeing) {
        // The flee guard above already covers "still low HP". Reaching here means HP recovered above the
        // threshold; calm down only once the player is also out of sight, else keep fleeing.
        if (obs.canSeePlayer) {
            return {
                intent: { kind: 'flee', targetTile: obs.playerTile },
                state: EBehaviourState.Fleeing,
                memory: mem,
            };
        }
        return wander(EBehaviourState.Wandering, params, rng);
    }

    // --- Hunting: pursue, strike, or give up --------------------------------------------------------------
    if (state === EBehaviourState.Hunting) {
        if (obs.isAdjacentToPlayer) {
            return { intent: { kind: 'attack' }, state: EBehaviourState.Hunting, memory: mem };
        }
        if (obs.canSeePlayer) {
            return hunt(obs.playerTile, mem);
        }
        // Lost sight — chase the last-known tile until the give-up grace period lapses, then resume roaming.
        if (mem.turnsSinceSeen > params.loseTargetAfterTurns || !mem.lastSeenPlayerTile) {
            return wander(EBehaviourState.Wandering, params, rng);
        }
        return hunt(mem.lastSeenPlayerTile, mem);
    }

    // --- Wandering (the default awake state): lock on, or roam idly ---------------------------------------
    if (obs.isAdjacentToPlayer) {
        // Right next to the player even before "spotting" them — strike and commit to the hunt.
        return { intent: { kind: 'attack' }, state: EBehaviourState.Hunting, memory: mem };
    }
    if (obs.canSeePlayer) {
        return hunt(obs.playerTile, mem);
    }
    return wander(EBehaviourState.Wandering, params, rng);
}

/** A `hunt` intent toward `targetTile` (the player, or the last-seen tile), committing to the Hunting state. */
function hunt(targetTile: TileXYType, mem: TDungeonAiMemory): TDungeonAiDecision {
    return { intent: { kind: 'hunt', targetTile }, state: EBehaviourState.Hunting, memory: mem };
}

/**
 * Roam: take a random step with probability `wanderChance`, otherwise `wait` in place — so a wandering floor
 * isn't in perpetual motion. The give-up memory is reset (a roamer has nothing to pursue), keeping the timer
 * honest for the next time it picks up a trail. The roll draws from the seeded RNG, so it replays per seed.
 */
function wander(next: EBehaviourState, params: DungeonAiParams, rng: NPRng): TDungeonAiDecision {
    // `wanderChance` is a 0..1 fraction; `percentageHit` rolls 1..100, so scale to a percentage.
    const kind = rng.percentageHit(params.wanderChance * 100) ? 'wander' : 'wait';
    return { intent: { kind }, state: next, memory: { turnsSinceSeen: 0 } };
}
