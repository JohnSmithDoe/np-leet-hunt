import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

/**
 * A mob's coarse behaviour state (RPG cluster E) — the full behaviour state machine of #12. The brain is a
 * tiny FSM over these four states, driven by {@link decideDungeonAi}:
 *
 *   Sleeping ──(player near OR seen)──▶ Hunting
 *   Wandering ─(sees player)─▶ Hunting ;  roams / waits otherwise
 *   Hunting ──(adjacent)──▶ attack ;  (sees)──▶ pursue ;  (lost sight > N turns)──▶ Wandering
 *   any state ─(HP < fleeBelowHpPct)─▶ Fleeing ;  Fleeing ─(HP recovers AND player unseen)─▶ Wandering
 *
 * Enemies start {@link Sleeping} (dormant until the player approaches/seen — the classic dungeon feel),
 * tunable per archetype later via `MobDef.behaviour`.
 */
export enum EBehaviourState {
    Sleeping = 'sleeping', // inert until the player comes within the wake radius or is seen
    Wandering = 'wandering', // idle roaming — the default once awake; can't see the player
    Hunting = 'hunting', // actively pursuing — sees (or just saw) the player
    Fleeing = 'fleeing', // retreating once HP drops below the flee threshold
}

/**
 * What the brain observes about the world this turn — the pure input to {@link decideDungeonAi}. It is a
 * flat bag of already-resolved facts (tiles + booleans), deliberately Phaser-free and board-free so the
 * decision core tests headless (cf. the duel's `TDungeonAiObservation` analogue). The `MobBrain` builds it
 * from the live mob/level/vision; the decision function never touches any of those.
 */
export interface TDungeonAiObservation {
    /** The mob's own tile. */
    selfTile: TileXYType;
    /** Whether the mob can currently see the player (own vision AND within `sightRange`). */
    canSeePlayer: boolean;
    /** Where the player is right now (only meaningful when {@link canSeePlayer}). */
    playerTile: TileXYType;
    /** Whether the mob stands on a tile adjacent to the player (can strike without moving). */
    isAdjacentToPlayer: boolean;
    /**
     * Grid (Chebyshev) distance from the mob to the player, in tiles — the *raw* proximity, independent of
     * line of sight. The brain uses it for the sleeping wake radius (a near-but-unseen player still rouses a
     * sleeper). Kept a plain number so the core stays Phaser-free and headless-testable.
     */
    distanceToPlayer: number;
    /**
     * The mob's current HP as a 0..1 fraction (`hp / maxHp`). The flee guard reads only this number — the
     * core never touches `MobCombat`, keeping it pure. `1` = undamaged, `0` = dead.
     */
    hpFraction: number;
}

/**
 * The brain's pursuit memory — the small mutable scratchpad {@link decideDungeonAi} threads turn to turn so
 * a hunter can chase the player's *last known tile* after losing sight, then give up after a grace period.
 * The `MobBrain` owns the live fields (`#lastSeenPlayerTile` / `#turnsSinceSeen`); the pure core reads and
 * returns an updated copy so it stays headless (no hidden mob state). Deliberately tiny and primitive.
 */
export interface TDungeonAiMemory {
    /** The last tile the mob actually saw the player on — where a hunter heads after losing sight. */
    lastSeenPlayerTile?: TileXYType;
    /** Turns elapsed since the mob last saw the player (the give-up timer); 0 while in sight. */
    turnsSinceSeen: number;
}

/**
 * The brain's decision for this turn — what it *wants* to do, decoupled from how the mob enacts it. The
 * `MobBrain` translates an intent into a concrete action verb (`AttackMobAction`/`WalkToAction`/…). Keeping
 * intent and action separate is what lets {@link decideDungeonAi} stay a pure, testable function: it returns
 * an intent, never an action object.
 */
export interface TAiIntent {
    /**
     * What the mob means to do this turn:
     *  - `attack` — strike the adjacent player (no `targetTile`);
     *  - `hunt` — step toward `targetTile` (the player, or the last-seen tile when sight is lost);
     *  - `flee` — step *away* from `targetTile` (the player), running for its life below the HP threshold;
     *  - `wander` — take a random idle step (no `targetTile`);
     *  - `wait` — do nothing this turn (a sleeping mob, or an idle wanderer that rolled to stay put).
     */
    kind: 'attack' | 'hunt' | 'flee' | 'wander' | 'wait';
    /** The tile the intent targets: the player tile for `hunt`/`flee`. Absent for `wander`/`wait`/`attack`. */
    targetTile?: TileXYType;
}
