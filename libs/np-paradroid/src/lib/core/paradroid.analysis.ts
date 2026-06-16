import { EFlowFrom, EFlowTo, EParadroidOwner } from '../@types/paradroid.consts';
import { TParadroidPath, TParadroidSubTile } from '../@types/paradroid.types';

/** Who lights a middle row in a resolved outcome. `both` = player and droid flows both reach it. */
export type TMiddleOwner = 'none' | 'player' | 'droid' | 'both';

const isIncoming = (path: TParadroidPath): boolean => path.to === EFlowTo.Mid;

/**
 * Steady-state simulation of "which middle rows light, and for whom, if these column-0 buttons are
 * held". A pure, Phaser-free mirror of the runtime flow in {@link ParadroidEngine}/{@link ParadroidField},
 * used by the droid AI to score moves and directly unit-testable.
 *
 * It is a monotone boolean fixpoint over the path graph:
 * - **sources** are the col-0 Left-incoming paths of `pressedRows`, plus every `fx-autofire` path
 *   (those self-activate in the real game regardless of their field).
 * - an **incoming** path (`to === Mid`) is active when it is a source or any of its `prev` is active.
 * - a **field** is active only when *all* its incoming paths are active (this models combine tiles).
 * - an **outgoing** path (`to !== Mid`) is active when its field is active (expand tiles fan out to
 *   several outgoing paths) — or when it is itself an autofire source.
 *
 * A terminal active outgoing path (`next.length === 0`) lights its field's row for `path.owner`
 * — exactly the condition under which the engine emits `EVENT_ACTIVATE_MIDDLE`. `path.owner` already
 * encodes `fx-changer` flips, so a droid flow routed through a changer correctly resolves to `player`.
 */
export const analyzeOutcome = (grid: TParadroidSubTile[][], pressedRows: number[]): Map<number, TMiddleOwner> => {
    const pressed = new Set(pressedRows);
    const isSource = (path: TParadroidPath): boolean =>
        path.fx === 'fx-autofire' ||
        (path.subTile.col === 0 && path.from === EFlowFrom.Left && isIncoming(path) && pressed.has(path.subTile.row));

    const active = new Map<TParadroidPath, boolean>();
    for (const column of grid) {
        for (const sub of column) {
            for (const path of sub.paths) active.set(path, isSource(path));
        }
    }

    // Relax to a fixpoint: each pass turns on any path whose precondition is now met. Monotone
    // (flags only ever flip false→true), so it converges in at most (graph depth) passes.
    let changed = true;
    while (changed) {
        changed = false;
        for (const column of grid) {
            for (const sub of column) {
                const incoming = sub.paths.filter(isIncoming);
                const fieldActive = incoming.length > 0 && incoming.every(p => active.get(p));
                for (const path of sub.paths) {
                    if (active.get(path)) continue;
                    const turnOn = isIncoming(path) ? path.prev.some(p => active.get(p)) : fieldActive;
                    if (turnOn) {
                        active.set(path, true);
                        changed = true;
                    }
                }
            }
        }
    }

    const outcome = new Map<number, TMiddleOwner>();
    for (const column of grid) {
        for (const sub of column) {
            for (const path of sub.paths) {
                if (isIncoming(path) || path.next.length !== 0 || !active.get(path)) continue;
                const owner = path.owner === EParadroidOwner.Droid ? 'droid' : 'player';
                const current = outcome.get(sub.row) ?? 'none';
                outcome.set(sub.row, current === 'none' || current === owner ? owner : 'both');
            }
        }
    }
    return outcome;
};

/** How many middle rows a resolved outcome lights for the droid (`droid` or shared `both`). */
export const droidScore = (outcome: Map<number, TMiddleOwner>): number => {
    let score = 0;
    for (const owner of outcome.values()) {
        if (owner === 'droid' || owner === 'both') score++;
    }
    return score;
};
