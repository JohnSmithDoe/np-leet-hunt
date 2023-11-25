import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export class GainEnergyState extends PixelDungeonState {
    name = States.GainEnergy;
    next = () => (this.engine.gainEnery() ? States.HandleAction : States.GainEnergy);
}
