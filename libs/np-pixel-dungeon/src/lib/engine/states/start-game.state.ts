import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class StartGameState extends PixelDungeonState {
    name = States.StartGame;
    next = States.HandleAction;
}
