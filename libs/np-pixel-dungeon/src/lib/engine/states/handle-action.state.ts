// eslint-disable-next-line max-classes-per-file
import { lunge, rotateTo } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { EMobInfoType } from '../../sprites/pixel-dungeon.info-text';
import { PixelDungeonMob } from '../../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../../sprites/pixel-dungeon.player';
import { resolveDamage } from '../combat';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export interface PixelDungeonAction {
    mob: PixelDungeonMob;
    costs: number;

    perform(): boolean;

    finish(): void;
}

export abstract class PixelDungeonBaseAction implements PixelDungeonAction {
    costs = 100;

    constructor(public mob: PixelDungeonMob) {}

    finish(): void {
        this.mob.activity.drainEnergy(this.costs);
        this.mob.activity.setNextAction(null);
    }

    abstract perform(): boolean;
}

export class AttackMobAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    #isRunning = false;
    #done = false;

    constructor(
        mob: PixelDungeonMob,
        public target: PixelDungeonMob
    ) {
        super(mob);
    }

    override perform(): boolean {
        if (!this.#isRunning) {
            this.#isRunning = true;
            const angle = this.mob.engine.level.angleBetween(this.mob, this.target);
            const pos = new Phaser.Math.Vector2(this.mob.x, this.mob.y);
            rotateTo(pos, this.mob.x, this.mob.y, angle, 8);
            lunge(this.mob, {
                x: pos.x,
                y: pos.y,
                onContact: () => this.#onContact(),
                onComplete: () => {
                    this.#done = true;
                },
            });
        }
        return this.#done;
    }

    // Resolve real damage when the lunge connects (Leet combat spine), replacing the old cosmetic '3'.
    #onContact(): void {
        // Guard a target killed mid-lunge: if it already died (another attack, or a prior contact),
        // don't re-apply damage or spawn a second floater. `killMob` is idempotent, but skipping here
        // avoids a misleading `0`/NaN floater over a corpse.
        if (this.target.combat.isDead) return;
        const dmg = resolveDamage(this.mob.combat.attack, this.target.combat.defense, this.mob.engine.combatParams);
        this.target.combat.applyDamage(dmg);
        this.target.info(String(dmg), EMobInfoType.LoseHealth);
        if (this.target.combat.isDead) this.mob.engine.killMob(this.target);
    }
}

/**
 * Pick up the item lying on the acting mob's tile (RPG cluster A). A new verb on the proven action
 * contract — zero turn-loop changes. Instant: `perform` collects-and-returns-true in one frame (no
 * animation), so the mob acts again the same pump. It is *self-checking*: if the tile is bare (the item
 * was already taken, or the mob isn't standing on one) it's a harmless no-op that still completes, so the
 * scheduler never stalls. The engine records the id and removes the entity; floater + bookkeeping live in
 * the engine's auto-pickup handler so this stays a thin "take what's here" verb.
 */
export class PickUpAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    override perform(): boolean {
        const item = this.mob.engine.level.getItemAt(this.mob.tile);
        if (item) this.mob.engine.collectItem(this.mob, item);
        return true;
    }
}

export class WalkToAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    constructor(
        mob: PixelDungeonMob,
        public tile: TileXYType | undefined
    ) {
        super(mob);
    }

    override perform(): boolean {
        if (this.tile) {
            this.mob.movement.moveToTile(this.tile);
            this.tile = undefined;
        }
        return !this.mob.movement.isMoving;
    }
}

export class WarpAction extends WalkToAction implements PixelDungeonAction {
    override perform(): boolean {
        if (this.tile) {
            this.mob.movement.warp(this.tile);
            this.tile = undefined;
        }
        return true;
    }
}

export class RestAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    override perform(): boolean {
        // this.mob.gainEnergy(); // extra energy
        return true;
    }
}

export class WaitForInputAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    override perform(): boolean {
        return false;
    }
}

// 1. No one has energy
//    - Gain energy on each update? or on each turn
//        - on each update -> there is nearly always something to do -> more time slots
//        - on each turn -> there is waiting time but fixed time slots
//        - on one update cycle -> wait here until an action is ready -> Always have an action should be faster
//           - only update if something needs animation... is coupled on the fps.. is it?
// 2. Some have enough energy to perform an action
//    - Actions should take one turn for now
//    - So finish all action before advancing
// 3. When all actions are done a turn has ended
// 4. Start over
export class HandleActionState extends PixelDungeonState {
    name = States.HandleAction;
    #mobs: PixelDungeonMob[] = [];
    #waitForInputAction: WaitForInputAction;

    constructor(player: PixelDungeonPlayer) {
        super();
        this.#waitForInputAction = new WaitForInputAction(player);
    }

    /**
     * Scrub a killed mob from the ready set (Leet combat spine). Called by `engine.killMob`, this is the
     * SECOND of the two lists a dead mob must leave (the first is `engine.mobs`): a mob shifted off as
     * ready, or still queued behind another, must never be acted on after it dies. Filtering covers both
     * a queued mob and a defensive re-add.
     */
    removeFromReady(mob: PixelDungeonMob): void {
        this.#mobs = this.#mobs.filter(m => m !== mob);
    }

    next = () => {
        while (true) {
            // A death/victory mid-loop (killMob → endGame) flips `engine.isOver`. Bail to EndGame before the
            // next pump so the simulation stops cleanly instead of pumping energy into a finished run — and
            // crucially before touching any mob a kill may have just removed. (Respects the 10k guard below.)
            if (this.engine.isOver) return States.EndGame;
            // gain energy until one or more mobs can act. Guard against a misconfigured mob (e.g.
            // energyGain 0) that can never reach FULL_ENERGY — without this the loop never yields and
            // freezes the game; fail fast and loud instead.
            let pumps = 0;
            while (!this.#mobs?.length) {
                this.engine.gainEnergy();
                this.#mobs = this.engine.mobs.filter(mob => {
                    const canAct = mob.activity.canAct();
                    if (canAct && mob === this.engine.player) {
                        // start a new turn if the player is on
                        this.engine.startTurn();
                    }
                    return canAct;
                });
                if (++pumps > 10_000) {
                    throw new Error('PixelDungeon: no mob can gain enough energy to act (check energyGain)');
                }
            }
            // get the action of the first one and if animated wait for it to end
            while (this.#mobs.length) {
                // the while condition guarantees a non-empty list
                const mob = this.#mobs.shift()!;

                // The shifted mob may have been killed since it was marked ready (e.g. by an earlier mob's
                // attack this drain). It's already gone from `engine.mobs`; skip its action so we never read
                // `mob.action` on a corpse.
                if (!this.engine.mobs.includes(mob)) continue;

                // Decide BEFORE reading `action` (RPG cluster E / F5): the player continues its queued path,
                // the enemy runs its brain. Decision-making is now an explicit step, not a side-effect of the
                // `action` getter — so the getter is a pure read and is safe to evaluate more than once.
                mob.decide();

                const action = mob.action ?? this.#waitForInputAction;
                const done = action.perform();
                if (done) {
                    // done -> finish action and continue with the next mob instantly
                    action.finish();
                } else {
                    // not done -> enqueue first and wait an update cylce
                    this.#mobs.unshift(mob);
                    return States.HandleAction;
                }
            }
        }
    };
}
