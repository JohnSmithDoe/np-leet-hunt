import { PixelDungeonEngine } from '../pixel-dungeon.engine';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class StartTurnState extends PixelDungeonState {
    name = States.StartTurn;
    next = States.GainEnergy;

    enter(engine: PixelDungeonEngine) {
        super.enter(engine);
    }
}
