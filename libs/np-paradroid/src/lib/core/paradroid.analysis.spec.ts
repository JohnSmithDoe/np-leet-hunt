import { EFlowFrom, EFlowTo, EParadroidAccess, EParadroidOwner, EParadroidShape } from '../@types/paradroid.consts';
import { TParadroidFx, TParadroidPath, TParadroidPlayer, TParadroidSubTile } from '../@types/paradroid.types';
import { analyzeOutcome, droidScore, TMiddleOwner } from './paradroid.analysis';
import { defaultFactoryOptions, ParadroidFactory } from './paradroid.factory';

// --- hand-built grids: a single-row, 2-column chain (col0 IShape → terminal at the right edge),
// so the activation/owner semantics can be asserted exactly without leaning on the random factory.
const sub = (col: number, row: number): TParadroidSubTile => ({
    col,
    row,
    shape: EParadroidShape.IShape,
    access: EParadroidAccess.hasPath,
    paths: [],
});
const mkPath = (
    subTile: TParadroidSubTile,
    from: EFlowFrom,
    to: EFlowTo,
    owner: TParadroidPlayer,
    fx: TParadroidFx = 'none'
): TParadroidPath => ({ subTile, from, to, owner, fx, next: [], prev: [], triggeredBy: [] });

const makeChain = (terminalOwner: TParadroidPlayer = EParadroidOwner.Droid, terminalFx: TParadroidFx = 'none') => {
    const s0 = sub(0, 0);
    const s1 = sub(1, 0);
    const pIn = mkPath(s0, EFlowFrom.Left, EFlowTo.Mid, EParadroidOwner.Droid);
    const pOut = mkPath(s0, EFlowFrom.Mid, EFlowTo.Right, EParadroidOwner.Droid);
    const qIn = mkPath(s1, EFlowFrom.Left, EFlowTo.Mid, terminalOwner);
    const qOut = mkPath(s1, EFlowFrom.Mid, EFlowTo.Right, terminalOwner, terminalFx);
    pOut.next = [qIn];
    qIn.prev = [pOut];
    qIn.next = [qOut];
    qOut.prev = [qIn];
    s0.paths = [pIn, pOut];
    s1.paths = [qIn, qOut];
    return [[s0], [s1]]; // grid[col][row]
};

describe('analyzeOutcome (semantics)', () => {
    it('lights a clean droid chain for the droid only when its button is pressed', () => {
        const grid = makeChain();
        expect(analyzeOutcome(grid, []).get(0) ?? 'none').toBe('none');
        expect(analyzeOutcome(grid, [0]).get(0)).toBe('droid');
    });

    it('an fx-autofire terminal lights its row with no press at all', () => {
        const grid = makeChain(EParadroidOwner.Droid, 'fx-autofire');
        expect(analyzeOutcome(grid, []).get(0)).toBe('droid');
    });

    it('a changer-flipped (player-owned) terminal is a self-harming move — resolves to player', () => {
        const grid = makeChain(EParadroidOwner.Player);
        const outcome = analyzeOutcome(grid, [0]);
        expect(outcome.get(0)).toBe('player');
        expect(droidScore(outcome)).toBe(0);
    });
});

describe('analyzeOutcome (generated droid boards)', () => {
    const droidGrid = (seed: string) =>
        new ParadroidFactory({ ...defaultFactoryOptions, seed }).generateGrid(EParadroidOwner.Droid);
    const allRows = Array.from({ length: defaultFactoryOptions.rows }, (_, i) => i);
    const fingerprint = (o: Map<number, TMiddleOwner>) =>
        [...o.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([row, owner]) => `${row}:${owner}`)
            .join(',');

    it('is reproducible: the same seed yields the same outcome', () => {
        expect(fingerprint(analyzeOutcome(droidGrid('repro'), allRows))).toBe(
            fingerprint(analyzeOutcome(droidGrid('repro'), allRows))
        );
    });

    it('pressing every column-0 button never scores worse than pressing none', () => {
        for (const seed of ['alpha', 'beta', 'gamma']) {
            const grid = droidGrid(seed);
            expect(droidScore(analyzeOutcome(grid, allRows))).toBeGreaterThanOrEqual(
                droidScore(analyzeOutcome(grid, []))
            );
        }
    });
});
