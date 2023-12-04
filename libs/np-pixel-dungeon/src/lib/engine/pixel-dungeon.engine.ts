// eslint-disable-next-line max-classes-per-file
import { NPSceneComponent } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import StateManager from 'phaser3-rex-plugins/plugins/logic/statemanager/StateManager';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonEnemy } from '../sprites/pixel-dungeon.enemy';
import { EMobInfoType, PixelDungeonInfoText } from '../sprites/pixel-dungeon.info-text';
import { PixelDungeonMap } from '../sprites/pixel-dungeon.map';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';
import { EndGameState } from './states/end-game.state';
import { HandleActionState } from './states/handle-action.state';
import { StartGameState } from './states/start-game.state';
import { States } from './states/states';

export class PixelDungeonEngine extends StateManager implements NPSceneComponent {
    map: PixelDungeonMap;
    player: PixelDungeonPlayer;
    mobs: PixelDungeonMob[];
    #board: BoardPlugin.Board;
    #openTileIdx: number[];
    #pathfinder: PathFinder;
    #pathGraphics: Phaser.GameObjects.Graphics;

    constructor(public scene: NPSceneWithBoard) {
        super({ scene, eventEmitter: false });
        this.addStates([new StartGameState(), new HandleActionState(), new EndGameState()]);
        this.setupComponents();
    }

    get board() {
        return this.#board;
    }

    update(time: number, delta: number) {
        console.log('update cycle', this.player.x, this.player.y); // this.scene.game.loop.actualFps
        super.update(time, delta);
    }

    private setupComponents() {
        this.map = new PixelDungeonMap(this, { height: 151, width: 51, seed: '##' }, 'example');
        this.player = new PixelDungeonPlayer(this, { visionRange: 10, fovConeAngle: 210 });
        this.mobs = [this.player];
        for (let i = 0; i < 5; i++) {
            this.mobs.push(new PixelDungeonEnemy(this, { type: 'skeleton' }));
        }
    }

    init(): void {
        this.map.init();
        this.mobs.forEach((mob: NPSceneComponent) => (mob.init ? mob.init() : null));
    }

    preload(): void {
        this.map.preload();
        this.mobs.forEach(mob => mob.preload());
    }

    public create(): void {
        this.map.create();
        this.#createBoard();
        this.mobs.forEach(mob => mob.create());
        this.#createPathfinder();
        this.updateFoV();

        this.#pathGraphics = this.scene.add.graphics({ lineStyle: { width: 3 } });
        this.mobs.forEach(mob => {
            this.scene.add.existing(mob);
        });
    }

    #createBoard() {
        this.#openTileIdx = [6, 7, 8, 26, ...this.map.tileLayer.tileset.getTileIndexes('DOOR')];
        // this.#tilelayer.setCollisionByExclusion([6, 7, 8, 26, ...this.#tileset.getTileIndexes('DOOR')]);

        this.#board = this.scene.rexBoard.createBoardFromTilemap(this.map.tileMap);
        // TODO: Grid can not publicly set the direction mode afterwards. Is there a reason for that?
        (this.#board.grid as unknown as { setDirectionMode: (mode: '4dir' | '8dir') => void }).setDirectionMode('8dir');
        for (let i = 0; i < this.mobs.length; i++) {
            this.#board.addChess(this.mobs[i], this.map.start.x, this.map.start.y - i, 1);
        }
    }

    #createPathfinder() {
        this.#pathfinder = this.scene.rexBoard.add.pathFinder(this.player, {
            pathMode: 'A*-line', // only works with adjusted plugin tileXYToWroldX
            blockerTest: true,
            occupiedTest: true,
            costCallback: curTile => this.costs(curTile),
        });
    }

    updateFoV() {
        this.map.loseVision(this.player.vision);
        this.player.updateVision();
        this.map.gainVision(this.player.vision);
        this.mobs.forEach(mob => (mob.alpha = this.player.canSee(mob) ? 1 : 0.3));
    }

    startUP() {
        this.goto(States.StartGame);
    }

    findPath(endTileXY: TileXYType) {
        const pathToMove = this.#pathfinder.findPath(endTileXY);
        // debug
        ((path?: PathFinder.NodeType[]) => {
            if (path && path.length) {
                this.#pathGraphics.clear();
                const p = path
                    .map(tile => this.map.tileMap.tileToWorldXY(tile.x, tile.y))
                    .map(pv => pv.add({ x: 8, y: 8 }));
                this.#pathGraphics.strokePoints(p);
            }
        })(pathToMove);
        return pathToMove;
    }

    costs(tileXY: PathFinder.NodeType | TileXYType): number | PathFinder.BLOCKER | PathFinder.INFINITY {
        const tile = this.map.tileMap.getTileAt(tileXY.x, tileXY.y, true);
        const occupied = !this.#board.isEmptyTileXYZ(tileXY.x, tileXY.y, 1);
        return this.#openTileIdx.includes(tile.index) && !occupied ? 1 : null;
    }

    preTestCallback(a: TileXYType[], fovRange: number) {
        const first = a[0];
        const target = a[a.length - 1];
        const distance = Phaser.Math.Distance.Snake(first.x, first.y, target.x, target.y);
        let lastWasOccupied = false;
        if (a.length > 2) {
            const preLast = a[a.length - 2];
            lastWasOccupied = !this.#board.isEmptyTileXYZ(preLast.x, preLast.y, 1);
        }
        return !lastWasOccupied && distance <= fovRange;
    }

    gainEnergy() {
        let canAct = false;
        this.mobs.forEach(mob => (canAct = mob.gainEnergy() || canAct));
        return canAct;
    }

    endTurn() {
        // console.log('end turn on cycle');
    }

    startTurn() {
        // console.log('start turn on cycle');
        this.mobs.forEach(mob => mob.startTurn());
    }

    displayText(msg: string, tile: TileXYType, type: EMobInfoType) {
        this.scene.add.existing(new PixelDungeonInfoText(this, tile, msg, type));
    }

    public getMobAt(tile: TileXYType) {
        return this.board.tileXYZToChess(tile.x, tile.y, 1) as PixelDungeonMob;
    }

    public movePlayer(targetTile: TileXYType) {
        const mob = this.getMobAt(targetTile);
        if (mob) {
            this.player.attack(mob);
        } else {
            const pathToMove = this.findPath({ x: targetTile.x, y: targetTile.y });
            this.player.moveOnPath(pathToMove);
        }
    }
}
