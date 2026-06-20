import { RunContext } from '../model/run-context';
import { describeEnding, EndingKind } from './ending';

const ctx = (over: Partial<RunContext> = {}): RunContext => ({
    resources: { hull: 4, heart: 7, marbles: 12 },
    items: [],
    flags: [],
    crew: [],
    sector: 'ember-belt',
    sectorNumber: 3,
    ...over,
});

describe('describeEnding', () => {
    const kinds: EndingKind[] = ['rescued', 'snapback', 'bail', 'wiped'];

    it('gives each exit its own headline', () => {
        const titles = kinds.map(kind => describeEnding(kind, ctx()).title);
        expect(new Set(titles).size).toBe(kinds.length);
    });

    it('reads the carried run state — sector reached and marbles', () => {
        const lines = describeEnding('snapback', ctx({ sectorNumber: 3, sector: 'ember-belt' })).lines;
        expect(lines).toContain('Reached sector 3 of 5 — Ember Belt.');
        expect(lines).toContain('Marbles gathered: 12.');
    });

    it('notes empty crew bays when no one was rescued', () => {
        const lines = describeEnding('bail', ctx({ crew: [] })).lines;
        expect(lines.some(line => /crew bays stand empty/.test(line))).toBe(true);
    });

    it('lists the rescued family when crew is aboard', () => {
        const lines = describeEnding('wiped', ctx({ crew: ['mom', 'grandpa'] })).lines;
        expect(lines).toContain('Home safe: Mom, Grandpa.');
    });

    it('bail still banks rescues already made (Leet-34: bail keeps prior crew)', () => {
        const lines = describeEnding('bail', ctx({ crew: ['grandma'] })).lines;
        expect(lines).toContain('Home safe: Grandma.');
    });

    it("the rescued ending opens the way to the Hush", () => {
        const ending = describeEnding('rescued', ctx({ crew: ['grandma', 'grandpa', 'dad', 'mom', 'sibling'] }));
        expect(ending.title).toBe('The last gate opened');
        expect(ending.lines.some(line => /Hush/.test(line))).toBe(true);
    });
});
