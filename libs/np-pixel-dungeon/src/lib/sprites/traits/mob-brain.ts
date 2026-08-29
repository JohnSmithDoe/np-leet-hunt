import { mapRexPluginDirection, NPRng } from '@shared/np-library';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { AttackMobAction, RestAction, WalkToAction, WarpAction } from '../../engine/states/handle-action.state';
import { decideDungeonAi } from '../ai/dungeon-ai';
import { EBehaviourState, TAiIntent, TDungeonAiMemory, TDungeonAiObservation } from '../ai/dungeon-ai.types';
import { PixelDungeonMob } from '../pixel-dungeon.mob';

/**
 * The 4th mob trait (RPG cluster E — enemy hunting), sibling to `MobMovement`/`MobVision`/`MobAction`/
 * `MobCombat`: a mob's *behaviour*. It owns the coarse {@link EBehaviourState} and turns the pure
 * {@link decideDungeonAi} core into a concrete next action via the mob's own vision, the engine's
 * re-rootable pathfinder, and the existing action verbs. Built in `enemy.create()` (after the vision trait
 * exists) and driven once per turn by `enemy.decide()` — which the turn loop calls explicitly, replacing
 * the old mutation-on-read `get action()` side-effect.
 *
 * **Determinism.** The wander RNG is seeded from the dungeon seed PLUS the mob's identity (`type` + a spawn
 * ordinal), never `Math.random`: two skeletons on the same floor each get their own reproducible stream, so
 * a given dungeon seed replays the same AI.
 *
 * **The full behaviour state machine (#12): Sleeping → Wandering → Hunting → Fleeing.** Enemies start
 * {@link EBehaviourState.Sleeping} — dormant until the player approaches within the wake radius or is seen
 * (the classic dungeon feel; tunable per archetype later via `MobDef.behaviour`). `#lastSeenPlayerTile` /
 * `#turnsSinceSeen` are the pursuit memory the pure core threads through for the hunt give-up timer; HP-guarded
 * fleeing reads `mob.combat.fraction`. All the tuning (sight/wake radii, give-up turns, wander chance, flee
 * fraction) comes from the depth-scaled {@link DungeonAiParams} the engine injects via `engine.aiParams`.
 *
 * **Alert propagation is RESERVED, not implemented.** `DungeonAiParams.alertRadius` is carried and
 * depth-scaled, but a mob entering Hunting does NOT yet wake nearby sleepers: each brain only sees its own
 * mob, so a shout would need it to reach across `engine.mobs` and mutate sibling brains' private state — real
 * coupling the F5 event bus ('mob:spotted-player') is the right home for, not this per-mob decision step.
 * Left as a // TODO so the vocabulary lands with the data without dragging cross-mob mutation into the brain.
 */
export class MobBrain {
    // Enemies wake into the world asleep — the classic dungeon feel (item #12). The state advances through the
    // FSM as the pure core decides; the brain only stores what the core returns.
    #state: EBehaviourState = EBehaviourState.Sleeping;
    #lastSeenPlayerTile?: TileXYType; // the last tile the mob saw the player on (last-known-position pursuit)
    #turnsSinceSeen = 0; // the give-up timer: turns since the mob last had eyes on the player
    readonly #rng: NPRng;

    constructor(
        private readonly mob: PixelDungeonMob,
        identity: string
    ) {
        // Seed = dungeon seed + this mob's identity, so the stream is reproducible AND distinct per mob.
        this.#rng = new NPRng(`${mob.engine.seed}#brain#${identity}`);
    }

    /** The mob's current behaviour state (read by tests / future HUD; the FSM lives in {@link decide}). */
    get state(): EBehaviourState {
        return this.#state;
    }

    /**
     * Decide and queue this mob's action for the turn. Called once per turn by the drain loop (via
     * `enemy.decide()`) BEFORE it reads `mob.action`, so decisions are an explicit step, not a getter
     * side-effect. Idempotent within a turn via the same guard the old `#aiAction` had: bail if an action
     * is already queued or the mob can't act.
     */
    decide(): void {
        const activity = this.mob.activity;
        if (activity.hasNextAction || !activity.canAct()) return;

        // 1. Refresh the mob's OWN field of view, facing the way it last moved so the cone tracks pursuit
        // (the old enemy borrowed the *player's* vision — REVIEW weakness #7). `destinationDirection` is the
        // rex direction of the last step; null before the mob has ever moved, when we keep the current face.
        // rex types `destinationDirection` as `number`, but it is `null` until the mob first moves; coerce
        // a nullish value to `undefined` so the comparison is a clean `eqeqeq`-friendly identity check.
        const lastDir = this.mob.movement.destinationDirection ?? undefined;
        if (lastDir !== undefined) this.mob.vision.faceDirection = mapRexPluginDirection(lastDir);
        this.mob.vision.updateVision();

        // 2. Build the pure observation from the live world.
        const obs = this.#observe();

        // 3. Run the pure decision core, threading the depth-scaled tuning and the pursuit memory in and the
        // updated memory back out. The core owns the sighting/give-up bookkeeping (so the FSM is fully
        // headless-testable); the brain just stores what it returns.
        const memory: TDungeonAiMemory = {
            lastSeenPlayerTile: this.#lastSeenPlayerTile,
            turnsSinceSeen: this.#turnsSinceSeen,
        };
        const decision = decideDungeonAi(obs, this.#state, memory, this.mob.engine.aiParams, this.#rng);
        this.#state = decision.state;
        this.#lastSeenPlayerTile = decision.memory.lastSeenPlayerTile;
        this.#turnsSinceSeen = decision.memory.turnsSinceSeen;

        // 4. Enact the intent as a concrete action verb.
        this.#enact(decision.intent);
    }

    /** Resolve the live world into the flat, pure observation {@link decideDungeonAi} consumes. */
    #observe(): TDungeonAiObservation {
        const player = this.mob.engine.player;
        const selfTile = this.mob.tile;
        const playerTile = player.tile;
        const distanceToPlayer = this.#chebyshev(selfTile, playerTile);

        // "Can see" = the mob's own FOV reports the player tile AND the player is within the AI's `sightRange`
        // (a cheap Chebyshev clamp, item #12 — the tuning, not the sprite's raw vision cone). Without the
        // range check a clear line of sight across an open map would let an enemy lock on from the far side of
        // the floor; the range keeps pursuit local and depth-scaled.
        const inRange = distanceToPlayer <= this.mob.engine.aiParams.sightRange;
        const canSeePlayer = inRange && this.mob.vision.canSee(playerTile);

        return {
            selfTile,
            playerTile,
            canSeePlayer,
            isAdjacentToPlayer: this.mob.engine.level.areNeighbors(selfTile, playerTile),
            distanceToPlayer,
            // HP as a 0..1 fraction — the only thing the flee guard reads; the core never touches MobCombat.
            hpFraction: this.mob.combat.fraction,
        };
    }

    /** Translate a decided {@link TAiIntent} into the mob's next action (the impure, Phaser-touching half). */
    #enact(intent: TAiIntent): void {
        const activity = this.mob.activity;
        const player = this.mob.engine.player;

        switch (intent.kind) {
            case 'attack':
                activity.setNextAction(new AttackMobAction(this.mob, player));
                return;
            case 'hunt': {
                // Re-root the shared pathfinder onto this mob, take ONLY the first step, re-path next turn —
                // never follow a stored path (two hunters following stale paths could collide). rex omits the
                // start tile, so path[0] is already the first step toward the player.
                const path = this.mob.engine.findPathFor(this.mob, intent.targetTile!);
                const step = path[0];
                if (step) {
                    this.#stepTo(step);
                } else {
                    // No route (blocked / already there) — fall back to roaming rather than stalling.
                    this.#wander();
                }
                return;
            }
            case 'flee':
                this.#flee(intent.targetTile!);
                return;
            case 'wander':
                this.#wander();
                return;
            case 'wait':
                activity.setNextAction(new RestAction(this.mob));
                return;
        }
    }

    /**
     * Run away from `from` (the player): step onto the walkable adjacent tile that MAXIMISES the distance to
     * the player (item #12). Falls back to resting in place when hemmed in (no walkable neighbour increases
     * the distance — e.g. cornered), which is correct: a trapped fleer can only cower. One step only, like
     * hunting; the brain re-decides next turn.
     */
    #flee(from: TileXYType): void {
        const self = this.mob.tile;
        let best: TileXYType | null = null;
        let bestDist = this.#chebyshev(self, from); // must strictly improve on standing still to be worth a step
        // The 8 king-move neighbours; `canMoveToTile` rejects walls / out-of-bounds / blocked tiles for us.
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const tile = { x: self.x + dx, y: self.y + dy };
                if (!this.mob.movement.canMoveToTile(tile)) continue;
                const dist = this.#chebyshev(tile, from);
                if (dist > bestDist) {
                    bestDist = dist;
                    best = tile;
                }
            }
        }
        if (best) {
            this.#stepTo(best);
        } else {
            this.mob.activity.setNextAction(new RestAction(this.mob));
        }
    }

    /** Roam to a random walkable adjacent tile, or rest if hemmed in (the old enemy's wander behaviour). */
    #wander(): void {
        const tile = this.#randomStepTile();
        if (!tile) {
            this.mob.activity.setNextAction(new RestAction(this.mob));
        } else {
            this.#stepTo(tile);
        }
    }

    /**
     * Queue a single step onto `tile`: `WalkToAction` when the step is in the player's sight (animate it),
     * else `WarpAction` (teleport) — preserving the offscreen-step optimisation the old enemy had so
     * out-of-view mobs don't burn tweens. One step only; the brain re-decides next turn.
     */
    #stepTo(tile: TileXYType): void {
        const playerVision = this.mob.engine.player.vision;
        if (playerVision.canSee(this.mob.tile) || playerVision.canSee(tile)) {
            this.mob.activity.setNextAction(new WalkToAction(this.mob, tile));
        } else {
            this.mob.activity.setNextAction(new WarpAction(this.mob, tile));
        }
    }

    /**
     * A random walkable adjacent tile, or null after a few misses (lifted verbatim from the old
     * `enemy.ts#randomStepTile`, now seeded by the brain RNG via the level's range query). The rex board
     * lookups can throw when no empty tile is in range, so every call is guarded.
     */
    #randomStepTile(): TileXYType | null {
        try {
            let tile = this.mob.engine.level.getRandomEmptyTileXYInRange(this.mob.tile, 1);
            for (let i = 0; tile && !this.mob.movement.canMoveToTile(tile); i++) {
                if (i >= 5) return null;
                tile = this.mob.engine.level.getRandomEmptyTileXYInRange(this.mob.tile, 1);
            }
            return tile ?? null;
        } catch {
            return null;
        }
    }

    /** Chebyshev (king-move) distance — the natural range metric on a grid where diagonals count as 1. */
    #chebyshev(a: TileXYType, b: TileXYType): number {
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    }
}
