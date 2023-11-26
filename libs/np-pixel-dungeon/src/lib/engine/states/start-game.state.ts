import { PixelDungeonEngine } from '../pixel-dungeon.engine';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class StartGameState extends PixelDungeonState {
    name = States.StartGame;
    next = States.HandleAction;

    enter(engine: PixelDungeonEngine) {
        super.enter(engine);
    }
}
