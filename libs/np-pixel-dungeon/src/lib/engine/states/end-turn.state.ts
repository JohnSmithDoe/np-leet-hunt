import { PixelDungeonEngine } from '../pixel-dungeon.engine';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class EndTurnState extends PixelDungeonState {
    name = States.EndTurn;
    next = States.StartTurn;

    enter(engine: PixelDungeonEngine) {
        super.enter(engine);
    }
}
