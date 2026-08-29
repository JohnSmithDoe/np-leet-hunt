import { ChessLayer } from './pixel-dungeon.types';

describe('ChessLayer', () => {
    it('exposes the expected semantic bands', () => {
        expect(Object.keys(ChessLayer).sort()).toEqual(['features', 'items', 'mob', 'objects', 'walls']);
    });

    it('keeps mob on the numeric band the actors are placed on', () => {
        // mob stays numeric (z = 1) to match the existing rex placement — don't change this band.
        expect(ChessLayer.mob).toBe(1);
    });

    it('assigns every layer a distinct value (a duplicate band is the silent-collision hazard)', () => {
        const values = Object.values(ChessLayer);
        expect(new Set(values).size).toBe(values.length);
    });
});
