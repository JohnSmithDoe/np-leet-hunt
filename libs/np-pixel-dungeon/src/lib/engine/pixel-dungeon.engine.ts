// eslint-disable-next-line max-classes-per-file
import { mapToRexPluginDirection } from '@shared/np-library';
import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import FieldOfView from 'phaser3-rex-plugins/plugins/board/fieldofview/FieldOfView';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';
import StateManager from 'phaser3-rex-plugins/plugins/logic/statemanager/StateManager';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEnemy } from '../sprites/pixel-dungeon.enemy';
import { PixelDungeonMap } from '../sprites/pixel-dungeon.map';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';

export enum States {
    StartTurn = 'start',
    PlayersTurn = 'player',
    MobsTurn = 'mobs',
    EndTurn = 'end',
}

export abstract class PixelDungeonState implements StateManager.IState {
    name: string;
    protected engine: PixelDungeonEngine;

    abstract next: string | (() => string);

    enter(engine: PixelDungeonEngine) {
        this.engine = engine;
    }

    // in update we dont have a this reference
    // so we call engine next and handle the state change in the next call
    // for this we save the engine in the enter state
    public update(engine: PixelDungeonEngine) {
        engine.next();
    }
}

export class StartTurnState extends PixelDungeonState {
    name = States.StartTurn;
    next = States.PlayersTurn;
}

export class MobsState extends PixelDungeonState {
    name = States.MobsTurn;
    // next = States.PlayersTurn;
    private mobs: PixelDungeonEnemy[];
    private current?: PixelDungeonEnemy;
    private player: PixelDungeonPlayer;

    next = () => {
        if (!this.current) {
            return States.PlayersTurn;
        } else {
            if (this.current.isNotMoving()) {
                if (this.engine.canSee(this.current)) {
                    this.current.moveOnRandomTile();
                    this.current.onceMoved(() => {
                        if (this.engine.canSee(this.current)) this.engine.updateFoV();
                        this.current = this.mobs.shift();
                    });
                } else {
                    this.current.moveOnRandomTile(true);
                    if (this.engine.canSee(this.current)) this.engine.updateFoV();
                    this.current = this.mobs.shift();
                    if (!this.current) {
                        return States.PlayersTurn;
                    }
                }
            }
        }
        return States.MobsTurn;
    };

    public enter(engine: PixelDungeonEngine) {
        super.enter(engine);
        console.log('enter start turn enemies');
        this.mobs = [engine.enemy, engine.enemy2];
        this.current = this.mobs.shift();
        this.player = engine.player;
    }

    public exit(p0) {
        console.log(p0, 'exit enemies turn');
    }
}

export class PlayerState extends PixelDungeonState {
    name = States.PlayersTurn;

    private hasMoved = false;
    next = () => {
        const player = this.engine.player;
        if (player.isMoving()) {
            this.hasMoved = true;
            return States.PlayersTurn;
        }
        // has more moving to do in the next round
        if (player.hasMoves() || this.hasMoved) return States.MobsTurn;
        // nothing to move -> wait for input
        return States.PlayersTurn;
    };

    public enter(engine: PixelDungeonEngine) {
        super.enter(engine);
        console.log('enter players turn', engine.player, this);
        this.hasMoved = false;
        const player = this.engine.player;
        if (player.hasMoves()) {
            player.moveToNext();
        }
        // apply stuff that happens when the players turn start
        // e.g. oxygen is running out
        // could be done in start turn
        // how do i wait for stuff?
    }

    public exit() {
        console.log('exit players turn');
    }
}

export class PixelDungeonEngine extends StateManager implements NPSceneComponent {
    map: PixelDungeonMap;
    player: PixelDungeonPlayer;
    enemy: PixelDungeonEnemy;
    enemy2: PixelDungeonEnemy;
    #pathfinder: PathFinder;
    #pathGraphics: Phaser.GameObjects.Graphics;
    #fieldOfView: FieldOfView<Phaser.GameObjects.GameObject>;
    #currentView: TileXYType[];

    constructor(public scene: NPSceneWithBoard) {
        super({ scene, eventEmitter: false });
        this.addStates([new StartTurnState(), new PlayerState(), new MobsState()]);
        this.setupComponents();
    }

    private setupComponents() {
        this.map = new PixelDungeonMap(this, { height: 151, width: 51, seed: '##' }, 'example');
        this.player = new PixelDungeonPlayer(this, { fovRange: 10, fovConeAngle: 210 });
        this.enemy = new PixelDungeonEnemy(this, { moveSpeed: 50, type: 'skeleton' });
        this.enemy2 = new PixelDungeonEnemy(this, { moveSpeed: 50, type: 'skeleton' });

        this.scene.addComponent([this.map, this.player, this.enemy, this.enemy2]);
        this.scene.addComponent(this);
    }

    public create(): void {
        this.enemy.addToMap(this.map, { x: this.map.start.x - 1, y: this.map.start.y - 1 });
        this.enemy2.addToMap(this.map, { x: this.map.start.x - 1, y: this.map.start.y - 2 });
        this.player.addToMap(this.map, this.map.start);

        this.#createPathfinder();
        this.#createFieldOfView();
        this.scene.add.existing(this.player);
        this.scene.add.existing(this.enemy);
        this.scene.add.existing(this.enemy2);
        this.#pathGraphics = this.scene.add.graphics({ lineStyle: { width: 3 } });
    }

    #createPathfinder() {
        this.#pathfinder = this.scene.rexBoard.add.pathFinder(this.player, {
            pathMode: 'A*-line', // only works with adjusted plugin tileXYToWroldX
            blockerTest: true,
            occupiedTest: true,
            costCallback: curTile => this.costs(curTile),
        });
    }

    #createFieldOfView() {
        this.#fieldOfView = this.scene.rexBoard.add.fieldOfView(this.player, {
            preTestCallback: a => {
                const first = a[0];
                const target = a[a.length - 1];
                const distance = Phaser.Math.Distance.Snake(first.x, first.y, target.x, target.y);
                let lastWasOccupied = false;
                if (a.length > 2) {
                    const preLast = a[a.length - 2];
                    lastWasOccupied = !this.map.board.isEmptyTileXYZ(preLast.x, preLast.y, 1);
                }
                return !lastWasOccupied && distance <= this.player.options.fovRange;
            },
            costCallback: a => this.costs(a),
            coneMode: 'angle',
            cone: this.player.options.fovConeAngle,
            occupiedTest: false,
        });
        this.updateFoV();
    }

    updateFoV() {
        this.#fieldOfView.setFace(mapToRexPluginDirection(this.player.facingTo));
        this.map.loseVision(this.#currentView);
        this.#currentView = this.#fieldOfView.findFOV(this.player.options.fovRange);
        // put the players tile into vision as well hmmmmmm and the enemies... occupied seems to be blocked
        this.#currentView.push({ ...this.player.tile });
        this.map.gainVision(this.#currentView);
        [this.enemy, this.enemy2].forEach(mob => (mob.alpha = this.canSee(mob) ? 1 : 0.1));
    }

    startTurn() {
        this.start(States.StartTurn);
    }

    findPath(endTileXY: TileXYType) {
        const pathToMove = this.#pathfinder.findPath(endTileXY);
        // debug
        ((path?: PathFinder.NodeType[]) => {
            if (path && path.length) {
                this.#pathGraphics.clear();
                const p = path
                    .map(tile => this.map.map.tileToWorldXY(tile.x, tile.y))
                    .map(pv => pv.add({ x: 8, y: 8 }));
                this.#pathGraphics.strokePoints(p);
            }
        })(pathToMove);
        return pathToMove;
    }

    costs(tileXY: PathFinder.NodeType | TileXYType): number | PathFinder.BLOCKER | PathFinder.INFINITY {
        const tile = this.map.map.getTileAt(tileXY.x, tileXY.y);
        const occupied = !this.map.board.isEmptyTileXYZ(tileXY.x, tileXY.y, 1);
        return this.map.openTileIdx.includes(tile.index) && !occupied ? 1 : null;
    }

    public canSee(mob: PixelDungeonMob) {
        return this.#fieldOfView.isInLOS(mob);
    }
}
