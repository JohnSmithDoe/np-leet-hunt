import { Balance, DuelAiParams } from '@shared/np-state';

import { NPRng } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { EParadroidOwner } from '../@types/paradroid.consts';
import { TParadroidSubTile } from '../@types/paradroid.types';
import { ParadroidAi } from './paradroid.ai';
import { analyzeOutcome, droidScore } from './paradroid.analysis';
import { defaultFactoryOptions, ParadroidFactory } from './paradroid.factory';

const DURATION_MS = 30_000;
const HOLD_MS = 3_000;
const COL0_ROWS = Array.from({ length: defaultFactoryOptions.rows }, (_, i) => i);

interface Shot {
    t: number;
    row: number;
}

// A pure, deterministic match driver: step the clock at a fixed cadence, feed the AI the live
// observation, honour the 3s holds, and tally the rows still lit at the buzzer. No Phaser, no clock.
const runMatch = (grid: TParadroidSubTile[][], params: DuelAiParams, seed: string) => {
    const ai = new ParadroidAi(grid, params, new NPRng(seed));
    const activeUntil = new Map<number, number>(); // row -> hold expiry (ms)
    const shots: Shot[] = [];
    let shotsLeft = 12;

    for (let t = 0; t <= DURATION_MS; t += 50) {
        for (const [row, expiry] of [...activeUntil]) {
            if (t >= expiry) activeUntil.delete(row);
        }
        const row = ai.decide({
            elapsedMs: t,
            durationMs: DURATION_MS,
            shotsLeft,
            pressedRows: [...activeUntil.keys()],
            availableRows: shotsLeft > 0 ? COL0_ROWS : [],
        });
        if (row !== null) {
            shots.push({ t, row });
            shotsLeft--;
            activeUntil.set(row, t + HOLD_MS);
        }
    }

    // Lit at the buzzer = each row whose most-recent press is still within its hold at DURATION_MS.
    const lastPress = new Map<number, number>();
    for (const shot of shots) lastPress.set(shot.row, shot.t);
    const litRows = [...lastPress].filter(([, t]) => DURATION_MS - t < HOLD_MS).map(([row]) => row);
    return { shots, finalScore: droidScore(analyzeOutcome(grid, litRows)) };
};

describe('ParadroidAi', () => {
    // One fixed board for every test; the AI seed is what we vary.
    const grid = new ParadroidFactory({ ...defaultFactoryOptions, seed: 'ai-spec-board' }).generateGrid(
        EParadroidOwner.Droid
    );
    const ai = (level: 'easy' | 'normal' | 'hard' | 'brutal') => Balance.duelAiParams(level);

    it('is reproducible: the same seed yields the same move sequence', () => {
        const a = runMatch(grid, ai('easy'), 'seed-1');
        const b = runMatch(grid, ai('easy'), 'seed-1');
        expect(a.shots).toEqual(b.shots);
        expect(a.finalScore).toBe(b.finalScore);
    });

    it('is seed-sensitive: different seeds generally produce different play', () => {
        const a = runMatch(grid, ai('easy'), 'seed-A');
        const b = runMatch(grid, ai('easy'), 'seed-B');
        expect(a.shots).not.toEqual(b.shots);
    });

    it('never out-clicks a human: no two shots land within 250ms', () => {
        // brutal fires fastest, so it stresses the floor hardest.
        const { shots } = runMatch(grid, ai('brutal'), 'floor');
        for (let i = 1; i < shots.length; i++) {
            expect(shots[i].t - shots[i - 1].t).toBeGreaterThanOrEqual(250);
        }
    });

    it('assembles combine middles: a flawless AI lights every winnable row — even ones needing several presses at once', () => {
        const col0 = (grid[0] ?? []).map(subTile => subTile.row);
        const max = droidScore(analyzeOutcome(grid, col0));
        // Rows that light a middle on their own; the rest are combine middles that need partners pressed
        // together. This board must actually demand combos, or the test proves nothing.
        const singleSourceRows = col0.filter(row => droidScore(analyzeOutcome(grid, [row])) > 0).length;
        expect(max).toBeGreaterThan(singleSourceRows);

        // brutal has no noise and never blunders, so it's deterministic: it should plan the full set and
        // saturate it inside the final hold window, lighting every winnable middle at the buzzer. A greedy
        // single-click picker (the old AI) tops out at singleSourceRows and could never reach `max`.
        expect(runMatch(grid, ai('brutal'), 'combo').finalScore).toBe(max);
    });

    it('plays better up the ladder: brutal/hard end with at least as many lit rows as easy', () => {
        const seeds = ['s1', 's2', 's3', 's4'];
        const total = (level: 'easy' | 'normal' | 'hard' | 'brutal') =>
            seeds.reduce((sum, seed) => sum + runMatch(grid, ai(level), seed).finalScore, 0);
        const easy = total('easy');
        expect(total('brutal')).toBeGreaterThanOrEqual(easy);
        expect(total('hard')).toBeGreaterThanOrEqual(easy);
        expect(total('brutal')).toBeGreaterThan(0); // and it actually lights rows at the buzzer
    });
});
