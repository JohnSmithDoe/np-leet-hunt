import { PixelDungeonEngine } from '../pixel-dungeon.engine';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

/**
 * Terminal state of the turn loop (Leet F1). Reached only via {@link PixelDungeonEngine.endGame}; on enter
 * it reports the recorded outcome back to the run (once), then halts: `update` is a deliberate no-op (it
 * does NOT call `engine.next()`), so the simulation stops cleanly on game-over instead of self-looping.
 */
export class EndGameState extends PixelDungeonState {
    name = States.EndGame;

    override enter(engine: PixelDungeonEngine) {
        super.enter(engine);
        engine.reportResult();
    }

    override update() {
        // No-op on purpose: a game-over freezes the simulation. Crucially we do NOT call `engine.next()`
        // here — pumping it is what made this state dead self-looping code before; halting is correct.
        return;
    }
}
