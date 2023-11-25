import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class EndTurnState extends PixelDungeonState {
    name = States.EndTurn;
    next = States.StartTurn;
}
