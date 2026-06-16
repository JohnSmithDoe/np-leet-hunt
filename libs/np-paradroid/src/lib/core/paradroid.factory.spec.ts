import { CParadroidModes, EFlowTo, EParadroidDifficulty } from '../@types/paradroid.consts';
import { TParadroidSubTile } from '../@types/paradroid.types';
import { defaultFactoryOptions, factoryOptionsForDifficulty, ParadroidFactory } from './paradroid.factory';

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

describe('factoryOptionsForDifficulty', () => {
    it('sources the tileSet and fx rates from the difficulty mode', () => {
        const mode = CParadroidModes[EParadroidDifficulty.Easy];
        const opts = factoryOptionsForDifficulty(EParadroidDifficulty.Easy);
        expect(opts.tileSet).toBe(mode.tileSet);
        expect(opts.changerRate).toBe(mode.changerRate);
        expect(opts.autoFireRate).toBe(mode.autoFireRate);
    });

    it('applies overrides on top of the mode defaults', () => {
        const opts = factoryOptionsForDifficulty(EParadroidDifficulty.Normal, { seed: 'fixed', columns: 4 });
        expect(opts.seed).toBe('fixed');
        expect(opts.columns).toBe(4);
        expect(opts.changerRate).toBe(CParadroidModes[EParadroidDifficulty.Normal].changerRate);
    });

    it('defaultFactoryOptions derives its rates from the Brutal mode', () => {
        const brutal = CParadroidModes[EParadroidDifficulty.Brutal];
        expect(defaultFactoryOptions.changerRate).toBe(brutal.changerRate);
        expect(defaultFactoryOptions.autoFireRate).toBe(brutal.autoFireRate);
        expect(defaultFactoryOptions.tileSet).toBe(brutal.tileSet);
    });
});
