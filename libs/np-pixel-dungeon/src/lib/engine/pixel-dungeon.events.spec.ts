import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonEvents } from './pixel-dungeon.events';

// The emitter is type-erased at runtime, so a minimal cast stands in for a real (Phaser-bound) mob —
// this keeps the spec headless, in the same plain-Vitest style as pixel-dungeon.factory.spec.ts.
const fakeMob = { name: 'skeleton' } as unknown as PixelDungeonMob;
const movedPayload = { mob: fakeMob, from: { x: 1, y: 1 }, to: { x: 2, y: 1 } };

describe('PixelDungeonEvents', () => {
    let events: PixelDungeonEvents;

    beforeEach(() => {
        events = new PixelDungeonEvents();
    });

    it('delivers the typed payload to a handler registered with on()', () => {
        const handler = vi.fn();
        events.on('mob:moved', handler);

        events.emit('mob:moved', movedPayload);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(movedPayload);
    });

    it('calls every handler subscribed to the same event', () => {
        const first = vi.fn();
        const second = vi.fn();
        events.on('turn:started', first);
        events.on('turn:started', second);

        events.emit('turn:started', { turn: 7 });

        expect(first).toHaveBeenCalledWith({ turn: 7 });
        expect(second).toHaveBeenCalledWith({ turn: 7 });
    });

    it('fires a once() handler exactly once', () => {
        const handler = vi.fn();
        events.once('turn:started', handler);

        events.emit('turn:started', { turn: 1 });
        events.emit('turn:started', { turn: 2 });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ turn: 1 });
    });

    it('stops delivery once the on() unsubscribe function is called', () => {
        const handler = vi.fn();
        const unsubscribe = events.on('mob:entered-tile', handler);

        events.emit('mob:entered-tile', { mob: fakeMob, tile: { x: 3, y: 3 } });
        unsubscribe();
        events.emit('mob:entered-tile', { mob: fakeMob, tile: { x: 4, y: 4 } });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('stops delivery after off() removes the handler', () => {
        const handler = vi.fn();
        events.on('turn:started', handler);

        events.off('turn:started', handler);
        events.emit('turn:started', { turn: 1 });

        expect(handler).not.toHaveBeenCalled();
    });

    it('removes every handler on clear()', () => {
        const moved = vi.fn();
        const turn = vi.fn();
        events.on('mob:moved', moved);
        events.on('turn:started', turn);

        events.clear();
        events.emit('mob:moved', movedPayload);
        events.emit('turn:started', { turn: 1 });

        expect(moved).not.toHaveBeenCalled();
        expect(turn).not.toHaveBeenCalled();
    });

    it('isolates a throwing handler: siblings still fire and emit() does not throw', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const boom = vi.fn(() => {
            throw new Error('bad subscriber');
        });
        const after = vi.fn();
        events.on('turn:started', boom);
        events.on('turn:started', after);

        expect(() => events.emit('turn:started', { turn: 1 })).not.toThrow();
        expect(boom).toHaveBeenCalledTimes(1);
        expect(after).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
    });

    it('is a silent no-op when emitting an event with no listeners', () => {
        expect(() => events.emit('turn:started', { turn: 1 })).not.toThrow();
    });
});
