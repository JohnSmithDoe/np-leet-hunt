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
 * The droid opponent: a pure, seeded, heuristic move-picker — *not* an LLM. Each tick it scores every
 * legal button by how many extra middle rows it would light for the droid (via {@link analyzeOutcome}
 * over the droid's own board), adds difficulty-scaled RNG noise, and fires the best — sometimes
 * blundering on lower levels, and on higher levels holding its shots so they're still lit at the buzzer.
 *
 * Reproducible by construction: every random choice draws from the injected {@link NPRng}, and all
 * timing comes from `obs.elapsedMs` — so the same seed + the same observation stream yield the same
 * moves, which is what makes it unit-testable.
 *
 * Human-like by construction: it can never fire two shots closer than `params.shotCooldownMs` (250ms),
 * and it accounts for that floor when deciding how early to begin its end-game burst.
 */
export class ParadroidAi {
    readonly #grid: TParadroidSubTile[][];
    readonly #params: DuelAiParams;
    readonly #rng: NPRng;
    /** How many middle rows this board can ever light for the droid — the reserve to saturate at the buzzer. */
    readonly #winnableRows: number;
    #lastShotAt = -Infinity;
    #nextDecisionAt = 0;
    #shotsFired = 0;

    constructor(grid: TParadroidSubTile[][], params: DuelAiParams, rng: NPRng) {
        this.#grid = grid;
        this.#params = params;
        this.#rng = rng;
        const col0Rows = (grid[0] ?? []).map(subTile => subTile.row);
        this.#winnableRows = droidScore(analyzeOutcome(grid, col0Rows));
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
        if (usesTiming && !this.#shouldFireNow(obs, fireInterval)) return null;

        const candidates = obs.availableRows.filter(row => !obs.pressedRows.includes(row));
        if (!candidates.length) return null;

        // A genuine misfire (lower levels only): pick any legal row, even a weak or self-harming one.
        if (blunderChance > 0 && this.#rng.percentageHit(Math.round(blunderChance * 100))) {
            return this.#fire(obs, this.#rng.item(candidates));
        }

        const base = droidScore(analyzeOutcome(this.#grid, obs.pressedRows));
        const scored = candidates.map(row => {
            const gain = droidScore(analyzeOutcome(this.#grid, [...obs.pressedRows, row])) - base;
            const noise = scoreNoise > 0 ? this.#rng.inRange(scoreNoise) : 0;
            return { row, gain, score: gain + noise };
        });
        const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
        // Skilled play never wastes a shot on a move with no upside.
        if (best.gain <= 0) return null;

        return this.#fire(obs, best.row);
    }

    /** Record a shot and return the row pressed. */
    #fire(obs: TParadroidAiObservation, row: number): number {
        this.#lastShotAt = obs.elapsedMs;
        this.#shotsFired++;
        return row;
    }

    /**
     * Timing gate for skilled (usesTiming) AIs. It reserves enough shots to (re)light every winnable row
     * inside the final hold window — where presses survive to the buzzer — and during the run-up spends
     * only the *surplus* shots, paced evenly, so the droid is visibly contesting the board rather than
     * idling and then dumping everything at the end.
     */
    #shouldFireNow(obs: TParadroidAiObservation, fireInterval: number): boolean {
        const burstStart = obs.durationMs - Math.max(HOLD_MS, this.#winnableRows * fireInterval);
        if (obs.elapsedMs >= burstStart) return true; // final saturation window — fire freely
        const surplus = obs.shotsLeft - this.#winnableRows;
        if (surplus <= 0) return false; // hold the reserve for the finish
        // Spread the surplus shots across the run-up: the (#shotsFired+1)-th surplus shot is due at its slot.
        const slot = burstStart / (this.#shotsFired + surplus + 1);
        return obs.elapsedMs >= (this.#shotsFired + 1) * slot;
    }
}
