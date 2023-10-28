import { Utils } from '../sprites/paradroid/utils';
import { EFlowbarFlow, EParadroidDifficulty, EParadroidOwner } from './paradroid.consts';
import { ParadroidCounter } from './paradroid.counter';
import { ParadroidMiddle } from './paradroid.middle';
import { ParadroidShape } from './paradroid.shape';
import { ParadroidTileGrid } from './paradroid.tilegrid';
import { TParadroidPlayer } from './paradroid.types';

export class ParadroidEngine {
    private tilegrids: [ParadroidTileGrid, ParadroidTileGrid] = [null, null];
    private counter: ParadroidCounter;
    private middle: ParadroidMiddle[] = [];
    private middleContainer: ParadroidMiddle[];
    private triggeredBy: number[][] = [];
    private triggers: number[][] = [];

    constructor(
        public cols: number,
        public rows: number,
        public shapeSize: number,
        public difficulty: EParadroidDifficulty
    ) {
        this.tilegrids[EParadroidOwner.Player] = new ParadroidTileGrid(
            this,
            EParadroidOwner.Player,
            difficulty,
            cols,
            rows,
            shapeSize
        );
        this.tilegrids[EParadroidOwner.Droid] = new ParadroidTileGrid(
            this,
            EParadroidOwner.Droid,
            difficulty,
            cols,
            rows,
            shapeSize
        );
        this.player_grid.onFlowReachedMiddleRow.subscribe(this.onFlowReachedMiddleRow);
        this.droid_grid.onFlowReachedMiddleRow.subscribe(this.onFlowReachedMiddleRow);
        this.middleContainer = [];
        for (let i: number = 0; i < this.rows; i++) {
            const pos: Phaser.Types.Math.Vector2Like = { x: 0, y: i * this.shapeSize };
            const paradroidMiddle: ParadroidMiddle = new ParadroidMiddle(pos);
            this.middleContainer.push(paradroidMiddle);
            this.middle.push(paradroidMiddle);
        }
        this.counter = new ParadroidCounter(this.middle);
    }

    private onFlowReachedMiddleRow(sender: ParadroidShape): void {
        this.middle[sender.row].updateMiddle(sender.getOwner(EFlowbarFlow.ToRight));
        this.counter.updateCounter();
    }

    get player_grid(): ParadroidTileGrid {
        return this.tilegrids[EParadroidOwner.Player];
    }

    get droid_grid(): ParadroidTileGrid {
        return this.tilegrids[EParadroidOwner.Droid];
    }

    resetTileGrids(): void {
        this.player_grid.reset();
        this.droid_grid.reset();
    }

    checkGridStructure(owner: TParadroidPlayer): boolean {
        return this.tilegrids[owner].checkGridStructure();
    }

    createTileGrid(owner: TParadroidPlayer): void {
        this.tilegrids[owner].createTileGrid();
        this.tilegrids[owner].ready();
    }

    update(): void {
        const delay: number = 3000;
        this.tilegrids[EParadroidOwner.Player].activeRows.forEach((startTime: number, row: number): void => {
            if (Date.now() - startTime >= delay) {
                this.deactivateRow(row, EParadroidOwner.Player);
            }
        });
        this.tilegrids[EParadroidOwner.Droid].activeRows.forEach((startTime: number, row: number): void => {
            if (Date.now() - startTime >= delay) {
                this.deactivateRow(row, EParadroidOwner.Droid);
            }
        });
    }

    activateRow(row: number, owner: TParadroidPlayer): void {
        this.tilegrids[owner].activeRows[row] = Date.now();
        this.tilegrids[owner].activateFlow(0, row);
        const len = this.tilegrids[owner].shots.length;
        const last = this.tilegrids[owner].shots[len - 1];
        if (last) {
            this.tilegrids[owner].shots.pop();
        }
    }

    deactivateRow(row: number, owner: TParadroidPlayer): void {
        delete this.tilegrids[owner].activeRows[row];
        this.tilegrids[owner].deactivateFlow(0, row);
    }

    startPlay(): void {
        // this.player_grid.buttonContainer.visible = true;
        // this.droid_grid.buttonContainer.visible = true;
        // this.middleContainer.visible = true;
        // this.counter.visible = true;
        this.initializeAI();
        // this.player_grid.resume();
        // this.droid_grid.resume();
    }

    executeAiMove(): void {
        let currentRow: number = -1;
        let triggersRows: number = 0;
        let currentRows: number[] = [];
        this.triggers.forEach((rows: number[], index: number) => {
            if (!this.droid_grid.activeRows[index]) {
                let currentTriggers: number = rows.length;
                rows.forEach((triggerRow: number) => {
                    if (this.middle[triggerRow].ownerIsDroid()) {
                        currentTriggers--;
                    }
                });
                if (currentTriggers > triggersRows) {
                    currentRow = index;
                    currentRows = rows;
                    triggersRows = currentTriggers;
                }
            }
        });
        if (currentRow > -1) {
            let activate: number[] = [];
            currentRows.forEach((row: number): void => {
                activate = Utils.mergeArrays(activate, this.triggeredBy[row]);
            });
            activate.forEach((row: number): void => {
                this.activateRow(row, EParadroidOwner.Droid);
            });
        }
    }

    private initializeAI(): void {
        this.triggeredBy = [];
        this.triggers = [];
        const lastColumn: number = this.droid_grid.columns - 1;
        for (let row: number = 0, j: number = this.droid_grid.rows; row < j; row++) {
            const shape: ParadroidShape = this.droid_grid.getShape(lastColumn, row);
            if (
                shape.canBeActivated() &&
                shape.hasFlow(EFlowbarFlow.ToRight) &&
                shape.outgoingOwnerIs(EParadroidOwner.Droid)
            ) {
                if (!this.triggeredBy[row]) {
                    this.triggeredBy[row] = [];
                }
                shape.pathInfo.activatedBy.forEach((activatedBy: number) => {
                    if (this.triggeredBy[row].indexOf(activatedBy) < 0) {
                        this.triggeredBy[row].push(activatedBy);
                    }
                    if (!this.triggers[activatedBy]) {
                        this.triggers[activatedBy] = [];
                    }
                    if (this.triggers[activatedBy].indexOf(row) < 0) {
                        this.triggers[activatedBy].push(row);
                    }
                });
            }
        }
        this.difficulty = EParadroidDifficulty.Hard;
    }

    public generateBoard() {
        const container = [];
        const gameboard = [];
        // const xOffsetButtons: number = 50;

        // this.player_grid.position.x = xOffsetButtons;
        // this.droid_grid.position.x = this.cols * this.shapeSize * 2 + this.shapeSize + xOffsetButtons;
        // this.droid_grid.scale.x = -1;

        // this.player_grid.buttonContainer.position.x = 0;
        // this.middleContainer.position.x = this.cols * this.shapeSize + xOffsetButtons;
        // this.droid_grid.buttonContainer.position.x =
        //     this.cols * this.shapeSize * 2 + this.shapeSize + xOffsetButtons * 2;
        // this.droid_grid.buttonContainer.scale.x = -1;
        //
        // this.player_grid.buttonContainer.visible = false;
        // this.droid_grid.buttonContainer.visible = false;
        // this.middleContainer.visible = false;
        // this.counter.visible = false;

        // gameboard.position.y = 64;
        // this.counter.position.x = this.cols * this.shapeSize + 32 + 25;
        // this.player_grid.shots.position.x = -32;
        // this.droid_grid.shots.position.x =
        //     this.cols * this.shapeSize * 2 + this.shapeSize + xOffsetButtons * 2 + 32 + 32;
        gameboard.push(this.player_grid);
        gameboard.push(this.droid_grid);
        gameboard.push(this.player_grid.buttonContainer);
        gameboard.push(this.droid_grid.buttonContainer);
        gameboard.push(this.player_grid.shots);
        gameboard.push(this.droid_grid.shots);
        gameboard.push(this.middleContainer);
        container.push(this.counter);
        container.push(gameboard);
        return container;
    }
}
