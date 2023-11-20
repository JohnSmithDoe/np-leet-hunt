// eslint-disable-next-line max-classes-per-file
import { NPSceneComponent } from '@shared/np-phaser';
import StateManager from 'phaser3-rex-plugins/plugins/logic/statemanager/StateManager';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEnemy } from '../sprites/pixel-dungeon.enemy';
import { PixelDungeonMap } from '../sprites/pixel-dungeon.map';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';

export enum States {
    StartTurn = 'start',
    PlayersTurn = 'player',
    MobsTurn = 'mobs',
    EndTurn = 'end',
}

export class PixelDungeonState implements StateManager.IState {
    name: string;
}

export class StartTurnState extends PixelDungeonState {
    name = States.StartTurn;
    next = States.PlayersTurn;

    public enter() {
        console.log('enter start turn');
        // apply stuff that happens when the players turn start
        // e.g. oxygen is running out
        // could be done in start turn
        // how do i wait for stuff?
    }

    public exit(p0) {
        console.log(p0, 'exit start turn');
    }

    public update(engine: PixelDungeonEngine) {
        console.log('update start turn', engine);
        engine.next();
    }
}

export class PlayerState extends PixelDungeonState {
    name = States.PlayersTurn;
    next = States.MobsTurn;

    public enter() {
        console.log('enter players turn');
        // apply stuff that happens when the players turn start
        // e.g. oxygen is running out
        // could be done in start turn
        // how do i wait for stuff?
    }

    public exit() {
        console.log('exit players turn');
    }

    public update() {
        console.log('update players turn');
    }
}

export class PixelDungeonEngine extends StateManager implements NPSceneComponent {
    map: PixelDungeonMap;
    player: PixelDungeonPlayer;
    enemy: PixelDungeonEnemy;
    enemy2: PixelDungeonEnemy;

    constructor(public scene: NPSceneWithBoard) {
        super({ scene, eventEmitter: false });
        this.addStates([new StartTurnState(), new PlayerState()]);
        this.setupComponents();
    }

    private setupComponents() {
        this.map = new PixelDungeonMap(this, { height: 151, width: 51, seed: '##' }, 'example');
        this.player = new PixelDungeonPlayer(this, { fovRange: 10, fovConeAngle: 245 });
        this.enemy = new PixelDungeonEnemy(this, { moveSpeed: 50, type: 'skeleton' });
        this.enemy2 = new PixelDungeonEnemy(this, { moveSpeed: 50, type: 'skeleton' });

        this.scene.addComponent([this.map, this.player, this.enemy, this.enemy2]);
        this.scene.addComponent(this);
    }

    public create(): void {
        this.player.addToMap(this.map, this.map.start);
        this.enemy.addToMap(this.map, { x: this.map.start.x - 1, y: this.map.start.y - 1 });
        this.enemy2.addToMap(this.map, { x: this.map.start.x - 1, y: this.map.start.y - 2 });
        this.scene.add.existing(this.player);
        this.scene.add.existing(this.enemy);
        this.scene.add.existing(this.enemy2);
    }

    startTurn() {
        this.start(States.StartTurn);
    }
}
