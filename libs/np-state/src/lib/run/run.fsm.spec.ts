import { RUN_TRANSITIONS, RunFsm, RunPhase } from './run.fsm';

describe('RunFsm', () => {
    it('starts in the hangar', () => {
        expect(new RunFsm().current).toBe('hangar');
    });

    it('allows a transition the table lists and updates the current phase', () => {
        const fsm = new RunFsm();
        expect(fsm.to('sector')).toBe('sector');
        expect(fsm.current).toBe('sector');
    });

    it('throws on a forbidden transition and leaves the phase unchanged', () => {
        const fsm = new RunFsm();
        expect(() => fsm.to('ending')).toThrow(/Illegal run transition/);
        expect(fsm.current).toBe('hangar');
    });

    it('reset returns to the hangar from anywhere', () => {
        const fsm = new RunFsm('ending');
        fsm.reset();
        expect(fsm.current).toBe('hangar');
    });

    it('every transition target is itself a known phase (no typos in the table)', () => {
        const phases = Object.keys(RUN_TRANSITIONS) as RunPhase[];
        for (const [from, targets] of Object.entries(RUN_TRANSITIONS)) {
            for (const target of targets) {
                expect(phases).toContain(target);
                expect(new RunFsm(from as RunPhase).can(target)).toBe(true);
            }
        }
    });

    it('emits the current phase on subscribe and on each change', () => {
        const fsm = new RunFsm();
        const seen: RunPhase[] = [];
        fsm.current$.subscribe(phase => seen.push(phase));
        fsm.to('sector');
        expect(seen).toEqual(['hangar', 'sector']);
    });
});
