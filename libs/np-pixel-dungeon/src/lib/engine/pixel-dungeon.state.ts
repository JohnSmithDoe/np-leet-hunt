import StateManager from 'phaser3-rex-plugins/plugins/logic/statemanager/StateManager';

import { PixelDungeonEngine } from './pixel-dungeon.engine';

export abstract class PixelDungeonState implements StateManager.IState {
    name: string;
    protected engine: PixelDungeonEngine;

    enter(engine: PixelDungeonEngine) {
        console.log('enter ' + this.name);

        this.engine = engine;
    }

    // in update, we don't have a "this" reference
    // we call engine next and handle the state change in the next call
    // in the next call we don't have the engine
    // for this we save the engine in the enter state
    public update(engine: PixelDungeonEngine) {
        engine.next();
    }
}
