import type { DuelAiParams } from '@shared/np-state';

import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { TParadroidSubTile } from '../@types/paradroid.types';
import { analyzeOutcome, droidScore } from './paradroid.analysis';

/** A press lights its rows for ~3s before the flow drains (the `ParadroidButton` debounce). */
const HOLD_MS = 3000;

/** What the AI sees each tick — the live match state it reasons over. Mirrors what the game can read. */
export interface TParadroidAiObservation {
    /** Match time elapsed (ms), accumulated from the game-loop delta — never wall-clock. */
    elapsedMs: number;
    /** Total match length (ms), e.g. the timer's start time. */
    durationMs: number;
    /** Droid shots remaining (the side shares 12 across all its buttons). */
    shotsLeft: number;
    /** Droid column-0 rows whose press is still within its 3s hold (i.e. currently lit sources). */
    pressedRows: number[];
    /** Column-0 rows the droid can press right now (has shots, button enabled). */
    availableRows: number[];
}

/**
 * The droid opponent: a pure, seeded, heuristic move-picker — *not* an LLM. Up front it solves the board
 * once into a {@link ParadroidAi.#plan|plan} — the minimal set of column-0 rows that, lit *together*,
 * lights every middle row the droid can win. That set is what makes combine tiles work: a combine middle
 * only lights when several upstream flows arrive at once, so each feeder row is worthless alone but the
 * group pays off. A purely greedy click-the-best-single-button player can never start such a combo (every
 * half scores zero on its own); planning the set first is the fix.
 *
 * Each tick it presses toward that plan. During the run-up it spends only *surplus* shots, and only on
 * presses that pay off on their own (never stranding a combo half that would drain before its partners).
 * Then, inside the final hold window, it slams the remaining plan rows — including the zero-gain combo
 * halves — so every combine lights simultaneously at the buzzer. Lower levels blunt this with reaction
 * lag, score noise and outright blunders (and skip the timed end-game burst entirely).
 *
 * Reproducible by construction: every random choice draws from the injected {@link NPRng}, and all
 * timing comes from `obs.elapsedMs` — so the same seed + the same observation stream yield the same
 * moves, which is what makes it unit-testable. It can never fire two shots closer than
 * `params.shotCooldownMs` (250ms), so it can't out-click a human.
 */
export class ParadroidAi {
    readonly #grid: TParadroidSubTile[][];
    readonly #params: DuelAiParams;
    readonly #rng: NPRng;
    /**
     * The minimal set of column-0 rows that lights every middle row the droid can win — its whole game
     * plan. Every row in it matters (dropping any one loses a middle), so it keeps *both* halves of each
     * combine. Its length is also the shot reserve the timing AIs hold back for the end-game saturation.
     */
    readonly #plan: number[];
    #lastShotAt = -Infinity;
    #nextDecisionAt = 0;
    #shotsFired = 0;

    constructor(grid: TParadroidSubTile[][], params: DuelAiParams, rng: NPRng) {
        this.#grid = grid;
        this.#params = params;
        this.#rng = rng;
        this.#plan = this.#computePlan();
    }

    /** The column-0 row to press this tick, or `null` to wait (cooldown, off-cadence, or no good move). */
    decide(obs: TParadroidAiObservation): number | null {
        const { reactionMs, shotCooldownMs, scoreNoise, blunderChance, usesTiming } = this.#params;
        const fireInterval = Math.max(reactionMs, shotCooldownMs);

        // Hard human-click floor — never fire faster than the cooldown, whatever the cadence says.
        if (obs.elapsedMs - this.#lastShotAt < shotCooldownMs) return null;
        // Think only on the reaction cadence (keeps the per-frame cost near zero).
        if (obs.elapsedMs < this.#nextDecisionAt) return null;
        this.#nextDecisionAt = obs.elapsedMs + reactionMs;
        if (obs.shotsLeft <= 0) return null;

        const legal = obs.availableRows.filter(row => !obs.pressedRows.includes(row));
        if (!legal.length) return null;

        // A genuine misfire (lower levels only): press any legal row, even a weak or self-harming one.
        if (blunderChance > 0 && this.#rng.percentageHit(Math.round(blunderChance * 100))) {
            return this.#fire(obs, this.#rng.item(legal));
        }

        // Only ever work toward the plan: ignore rows already lit and rows that buy the droid nothing
        // (e.g. ones a changer hands to the player).
        const wanted = legal.filter(row => this.#plan.includes(row));
        if (!wanted.length) return null;

        const base = droidScore(analyzeOutcome(this.#grid, obs.pressedRows));
        const scored = wanted.map(row => {
            const gain = droidScore(analyzeOutcome(this.#grid, [...obs.pressedRows, row])) - base;
            const noise = scoreNoise > 0 ? this.#rng.inRange(scoreNoise) : 0;
            return { row, gain, score: gain + noise };
        });
        const best = scored.reduce((a, b) => (b.score > a.score ? b : a));

        // End-game saturation (timing AIs only): slam the remaining plan rows so every combine lights
        // together at the buzzer. This is the one place zero-gain presses are correct — a combo's halves
        // each score nothing alone, so assembling the pair *requires* pressing through a zero-gain step.
        if (usesTiming && obs.elapsedMs >= this.#burstStart(obs.durationMs, fireInterval)) {
            return this.#fire(obs, best.row);
        }

        // Run-up: only spend on a press that pays off on its own — never strand a combo half that would
        // drain before its partners arrive. Timing AIs also keep a reserve back for the end-game burst.
        if (best.gain <= 0) return null;
        if (usesTiming && !this.#hasSurplus(obs, fireInterval)) return null;
        return this.#fire(obs, best.row);
    }

    /** Record a shot and return the row pressed. */
    #fire(obs: TParadroidAiObservation, row: number): number {
        this.#lastShotAt = obs.elapsedMs;
        this.#shotsFired++;
        return row;
    }

    /**
     * When the end-game saturation burst opens. Late enough that the first slammed row is still lit at
     * the buzzer (its press lands inside the 3s hold), yet leaving the rest of that hold window to fit one
     * press per remaining plan row at the fire cadence. Slower AIs get a shorter window, so they saturate
     * fewer rows — the timing skill scales with the level.
     */
    #burstStart(durationMs: number, fireInterval: number): number {
        return durationMs - HOLD_MS + fireInterval;
    }

    /**
     * During the run-up a timing AI spends only its *surplus* shots — those beyond the plan-sized reserve
     * it needs to saturate at the end — paced evenly across the run-up so it visibly contests the board
     * instead of idling and then dumping everything at once.
     */
    #hasSurplus(obs: TParadroidAiObservation, fireInterval: number): boolean {
        const surplus = obs.shotsLeft - this.#plan.length;
        if (surplus <= 0) return false; // hold the reserve for the finish
        const burstStart = this.#burstStart(obs.durationMs, fireInterval);
        const slot = burstStart / (this.#shotsFired + surplus + 1);
        return obs.elapsedMs >= (this.#shotsFired + 1) * slot;
    }

    /**
     * Solve the board once into the smallest set of column-0 rows that lights every middle the droid can
     * win. {@link droidScore} is monotone in pressed rows (a flow only ever lights more, never less), so
     * pressing *all* rows is the maximum; we then drop any row whose removal doesn't lower that maximum —
     * off-plan rows like ones routed to the player by a changer. What survives is a set where every row
     * earns its press, both halves of each combine included.
     */
    #computePlan(): number[] {
        const allRows = (this.#grid[0] ?? []).map(subTile => subTile.row);
        const maxScore = droidScore(analyzeOutcome(this.#grid, allRows));
        let plan = [...allRows];
        for (const row of allRows) {
            const trial = plan.filter(r => r !== row);
            if (droidScore(analyzeOutcome(this.#grid, trial)) === maxScore) plan = trial;
        }
        return plan;
    }
}
