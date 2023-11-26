import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class EndGameState extends PixelDungeonState {
    name = States.EndGame;
    next = States.EndGame;
}
