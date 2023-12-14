// eslint-disable-next-line max-classes-per-file
import { NPSceneComponent } from '@shared/np-phaser';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';
import StateManager from 'phaser3-rex-plugins/plugins/logic/statemanager/StateManager';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonPathfinder } from '../core/pixel-dungeon.pathfinder';
import { PixelDungeonLevel } from '../dungeon/levels/pixel-dungeon.level';
import { PixelDungeonEnemy } from '../sprites/pixel-dungeon.enemy';
import { EMobInfoType, PixelDungeonInfoText } from '../sprites/pixel-dungeon.info-text';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';
import { EndGameState } from './states/end-game.state';
import { HandleActionState } from './states/handle-action.state';
import { StartGameState } from './states/start-game.state';
import { States } from './states/states';

export class PixelDungeonEngine extends StateManager implements NPSceneComponent {
    player: PixelDungeonPlayer;
    mobs: PixelDungeonMob[];
    #pathfinder: PixelDungeonPathfinder;
    #level: PixelDungeonLevel;

    constructor(public scene: NPSceneWithBoard) {
        super({ scene, eventEmitter: false });
        this.#setup();
    }

    update(time: number, delta: number) {
        if (this.scene.game.loop.actualFps < 58) {
            console.log('40:update-laaag:', this.scene.game.loop.actualFps);
        }
        // console.log('update cycle', this.player.x, this.player.y, this.scene.game.loop.actualFps);
        super.update(time, delta);
    }

    #setup() {
        const options = { height: 25, width: 25, seed: '<#.#>' };
        this.#level = new PixelDungeonLevel(this, options);
        this.player = new PixelDungeonPlayer(this, { visionRange: 10, key: 'brawler' });
        this.mobs = [this.player];
        for (let i = 0; i < 3; i++) {
            this.mobs.push(new PixelDungeonEnemy(this, { type: 'skeleton', key: 'skeleton' }));
        }
        this.addStates([new StartGameState(), new HandleActionState(this.player), new EndGameState()]);
    }

    preload(): void {
        this.level.preload();
        this.mobs.forEach(mob => mob.preload());
    }

    create(): void {
        this.level.create();
        const start = this.level.start;
        for (let i = 0; i < this.mobs.length; i++) {
            this.level.addMob(this.mobs[i], start.x, start.y - i);
        }

        this.mobs.forEach(mob => mob.create());

        this.#pathfinder = new PixelDungeonPathfinder(this);

        this.updateFoV();
        this.mobs.forEach(mob => {
            this.scene.add.existing(mob);
        });
    }

    updateFoV() {
        const vision = this.player.vision;
        this.level.loseVision(vision.currentView);
        this.player.lookAround();
        this.level.gainVision(vision.currentView);
        this.mobs.forEach(mob => (mob.alpha = vision.canSee(mob.tile) ? 1 : 0.2));
    }

    startUP() {
        this.goto(States.StartGame);
    }

    gainEnergy() {
        let canAct = false;
        this.mobs.forEach(mob => (canAct = mob.activity.gainEnergy() || canAct));
        return canAct;
    }

    endTurn() {
        // console.log('end turn on cycle');
    }

    startTurn() {
        // console.log('start turn on cycle');
        this.mobs.forEach(mob => mob.startTurn());
        this.level.doors(this.mobs);
    }

    displayText(msg: string, tile: TileXYType, type: EMobInfoType) {
        this.scene.add.existing(new PixelDungeonInfoText(this, tile, msg, type));
    }

    public movePlayer(targetTile: TileXYType) {
        const mob = this.level.getMobAt(targetTile);
        if (mob) {
            this.player.attack(mob as PixelDungeonMob);
        } else {
            const pathToMove = this.#pathfinder.findPath({ x: targetTile.x, y: targetTile.y });
            this.player.movement.moveOnPath(pathToMove);
        }
    }

    get level() {
        return this.#level;
    }
}
