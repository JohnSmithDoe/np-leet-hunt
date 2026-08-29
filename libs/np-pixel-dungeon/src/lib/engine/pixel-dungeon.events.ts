import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

// Type-only imports: these modules transitively import the engine (which owns this bus), so importing
// them as values would close a runtime require-cycle and trip this project's documented "Class extends
// undefined" boot bug. `import type` is erased at compile time, so the cycle never forms at runtime.
import type { PixelDungeonLevel } from '../dungeon/pixel-dungeon.level';
import type { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

/**
 * The single source of truth for in-dungeon signals — the extension point for the RPG roadmap.
 *
 * Each entry maps an event name to its payload shape. As later tasks add real emit sites, new RPG
 * events (e.g. `mob:attacked`, `mob:damaged`, `mob:died`, `item:picked-up`, `trap:triggered`,
 * `game:over`) get one line here. The rule: never declare an event that nothing emits yet — every
 * key below has a concrete `emit(...)` site in the engine or a mob trait.
 */
export interface PixelDungeonEventMap {
    /** A mob finished a step — a render/vision concern (drives the field-of-view refresh). */
    'mob:moved': { mob: PixelDungeonMob; from: TileXYType; to: TileXYType };
    /** A mob settled onto a tile — the gameplay-trigger hook for future traps / auto-pickup / stairs. */
    'mob:entered-tile': { mob: PixelDungeonMob; tile: TileXYType };
    /** A new turn began (the player is ready to act again). */
    'turn:started': { turn: number };
    /** The level finished building and is ready to play. */
    'level:created': { level: PixelDungeonLevel };
}

type Handler<K extends keyof PixelDungeonEventMap> = (payload: PixelDungeonEventMap[K]) => void;

/**
 * A tiny, dependency-light, fully-typed event emitter for the dungeon engine. Deliberately not rex's
 * or Phaser's emitter: keeping it a plain class makes it pure and headless-testable (like the
 * generation factory), and lets the typed event map enforce payload shapes at every call site.
 */
export class PixelDungeonEvents {
    // One handler set per event name; a Set gives O(1) add/remove and natural de-duplication.
    readonly #handlers = new Map<keyof PixelDungeonEventMap, Set<Handler<keyof PixelDungeonEventMap>>>();

    /**
     * Subscribe to an event. Returns an unsubscribe function — call it to stop receiving the event
     * (more convenient than holding onto the handler reference for a later `off`).
     */
    on<K extends keyof PixelDungeonEventMap>(event: K, handler: Handler<K>): () => void {
        let handlers = this.#handlers.get(event);
        if (!handlers) {
            handlers = new Set();
            this.#handlers.set(event, handlers);
        }
        handlers.add(handler as Handler<keyof PixelDungeonEventMap>);
        return () => this.off(event, handler);
    }

    /**
     * Subscribe for a single delivery: the handler fires at most once, then unsubscribes itself. The
     * returned function unsubscribes early (before the first fire) if you no longer want it.
     */
    once<K extends keyof PixelDungeonEventMap>(event: K, handler: Handler<K>): () => void {
        const unsubscribe = this.on(event, payload => {
            unsubscribe();
            handler(payload);
        });
        return unsubscribe;
    }

    /** Remove a previously-registered handler. A no-op if it was never subscribed. */
    off<K extends keyof PixelDungeonEventMap>(event: K, handler: Handler<K>): void {
        const handlers = this.#handlers.get(event);
        if (!handlers) return;
        handlers.delete(handler as Handler<keyof PixelDungeonEventMap>);
        if (handlers.size === 0) this.#handlers.delete(event);
    }

    /**
     * Deliver a payload to every handler of an event. Emitting with no listeners is a silent no-op.
     *
     * Each handler is wrapped in try/catch: one buggy subscriber can never throw out of `emit` and
     * wedge the 60 fps turn loop, nor stop its sibling handlers from running. We iterate a snapshot so
     * a handler that subscribes/unsubscribes during dispatch can't disturb the in-flight loop.
     */
    emit<K extends keyof PixelDungeonEventMap>(event: K, payload: PixelDungeonEventMap[K]): void {
        const handlers = this.#handlers.get(event);
        if (!handlers || handlers.size === 0) return;
        for (const handler of [...handlers]) {
            try {
                handler(payload);
            } catch (error) {
                console.error(`PixelDungeonEvents: handler for "${String(event)}" threw`, error);
            }
        }
    }

    /** Drop every handler for every event — used on scene teardown so nothing leaks across runs. */
    clear(): void {
        this.#handlers.clear();
    }
}
