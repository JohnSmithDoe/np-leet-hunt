import { DuelResult, DungeonResult, isModeSuccess, ModeResult } from './mode-contract';

describe('mode-contract', () => {
    describe('isModeSuccess', () => {
        it('treats a duel win as success and a loss as failure', () => {
            expect(isModeSuccess({ kind: 'duel', outcome: 'win' })).toBe(true);
            expect(isModeSuccess({ kind: 'duel', outcome: 'lose' })).toBe(false);
        });

        it('treats a completed dungeon as success and a failed one as failure', () => {
            expect(isModeSuccess({ kind: 'dungeon', outcome: 'completed' })).toBe(true);
            expect(isModeSuccess({ kind: 'dungeon', outcome: 'failed' })).toBe(false);
        });

        it('narrows on the discriminant so each result carries its own payload', () => {
            const results: ModeResult[] = [
                { kind: 'duel', outcome: 'win', absorbedClass: 112 },
                { kind: 'dungeon', outcome: 'completed', loot: ['marble'] },
            ];
            const duel = results.find((r): r is DuelResult => r.kind === 'duel');
            const dungeon = results.find((r): r is DungeonResult => r.kind === 'dungeon');
            expect(duel?.absorbedClass).toBe(112);
            expect(dungeon?.loot).toEqual(['marble']);
        });
    });
});
