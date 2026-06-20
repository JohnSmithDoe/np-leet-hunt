import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';
import StateManager from 'phaser4-rex-plugins/plugins/logic/statemanager/StateManager';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonPathfinder } from '../core/pixel-dungeon.pathfinder';
import { PixelDungeonLevel } from '../dungeon/pixel-dungeon.level';
import { PixelDungeonEnemy } from '../sprites/pixel-dungeon.enemy';
import { EMobInfoType, PixelDungeonInfoText } from '../sprites/pixel-dungeon.info-text';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';
import { EndGameState } from './states/end-game.state';
import { HandleActionState } from './states/handle-action.state';
import { StartGameState } from './states/start-game.state';
import { States } from './states/states';

export class PixelDungeonEngine extends StateManager {
    player!: PixelDungeonPlayer;
    mobs!: PixelDungeonMob[];
    #pathfinder!: PixelDungeonPathfinder;
    #level!: PixelDungeonLevel;

    constructor(public scene: NPSceneWithBoard) {
        super({ scene, eventEmitter: false });
        this.#setup();
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
        this.#pathfinder = new PixelDungeonPathfinder(this, this.level.board);
        this.#addMobs();

        this.updateFoV();
    }

    #addMobs() {
        // Place mobs on distinct walkable tiles of the starting room (player first) instead of a
        // blind vertical line, which could otherwise drop mobs onto walls or stack them.
        const spots = this.level.spawnTiles(this.mobs.length);
        this.mobs.forEach((mob, i) => {
            const spot = spots[i] ?? spots[spots.length - 1];
            this.level.addMob(mob, spot.x, spot.y);
        });
        // needs to be added to the board to work... Field of view needs it
        this.mobs.forEach(mob => mob.create());

        this.mobs.forEach(mob => {
            mob.setDepth(5);
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

    /**
     * Refresh vision after a mob stepped. Only the player's move changes the player's field of view
     * (and thus tile lighting); an enemy's move can only change that enemy's own visibility, so we
     * skip the full recompute for enemies and just re-evaluate their alpha.
     */
    onMobMoved(mob: PixelDungeonMob) {
        if (mob === this.player) {
            this.updateFoV();
        } else {
            mob.alpha = this.player.vision.canSee(mob.tile) ? 1 : 0.2;
        }
    }

    startUP() {
        this.goto(States.StartGame);
    }

    gainEnergy() {
        let canAct = false;
        this.mobs.forEach(mob => (canAct = mob.activity.gainEnergy() || canAct));
        return canAct;
    }

    startTurn() {
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
