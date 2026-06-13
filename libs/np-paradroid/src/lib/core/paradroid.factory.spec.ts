import { EFlowTo } from '../@types/paradroid.consts';
import { TParadroidSubTile } from '../@types/paradroid.types';
import { defaultFactoryOptions, ParadroidFactory } from './paradroid.factory';

// A serialisable signature of a generated grid (the live structure has circular
// next/prev path references, so it can't be compared with toEqual directly).
const fingerprint = (grid: TParadroidSubTile[][]) =>
    grid
        .map(column =>
            column
                .map(st => `${st.col},${st.row}:${st.shape}|${st.paths.map(p => `${p.from}>${p.to}:${p.fx}:${p.owner}`).join(',')}`)
                .join(';')
        )
        .join('\n');

describe('ParadroidFactory', () => {
    beforeAll(() => {
        // the factory logs grid stats on every generation; keep test output clean
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });
    afterAll(() => vi.restoreAllMocks());

    const build = (seed = 'paradroid-test') => new ParadroidFactory({ ...defaultFactoryOptions, seed });

    it('fills a columns x rows grid of sub-tiles', () => {
        const grid = build().generateGrid();
        expect(grid).toHaveLength(defaultFactoryOptions.columns);
        grid.forEach(column => {
            expect(column).toHaveLength(defaultFactoryOptions.rows);
            column.forEach(subTile => {
                expect(subTile).toBeDefined();
                expect(Array.isArray(subTile.paths)).toBe(true);
            });
        });
    });

    it('always generates a winnable board (enough flows reach the right edge)', () => {
        // validateGrid requires at least half of the final column to carry a
        // right-bound flow; assert the generator honours that on every run.
        for (let i = 0; i < 10; i++) {
            const grid = build(`winnable-${i}`).generateGrid();
            const lastColumn = grid[grid.length - 1];
            const rightFlows = lastColumn.filter(subTile => subTile.paths.some(p => p.to === EFlowTo.Right)).length;
            expect(rightFlows).toBeGreaterThanOrEqual(lastColumn.length / 2);
        }
    });

    it('is reproducible: the same seed yields the same grid', () => {
        expect(fingerprint(build('repro').generateGrid())).toBe(fingerprint(build('repro').generateGrid()));
    });

    it('produces different layouts for different seeds', () => {
        expect(fingerprint(build('seed-A').generateGrid())).not.toBe(fingerprint(build('seed-B').generateGrid()));
    });
});
