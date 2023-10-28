import { Utils } from '../sprites/paradroid/utils';
// eslint-disable-next-line import/no-cycle
import { ParadroidFlowbar } from './paradroid.flowbar';
import { ParadroidSpecialFX } from './paradroid.specialfx';
// eslint-disable-next-line import/no-cycle
import { ParadroidTile } from './paradroid.tile';
// eslint-disable-next-line import/no-cycle
import { ParadroidTileGrid } from './paradroid.tilegrid';
import {
    CParadroidModes,
    CParadroidShapeInfo,
    EFlowbarFlow,
    EParadroidOwner,
    EParadroidShape,
    EParadroidSpecialFX,
    TParadroidShapeInfo,
} from './paradroid.types';

interface TParadroidPathInfo {
    changers: number;
    autofires: number;
    cost: number;
    activatedBy: number[];
}

export class ParadroidShape {
    private shapeInfo: TParadroidShapeInfo;
    private bars: ParadroidFlowbar[] = [];
    private isBlocked: boolean = false;
    private isChanger: boolean = false;
    private isAutofire: boolean = false;
    private specialFX: ParadroidSpecialFX;
    private outgoingOwner: EParadroidOwner;
    pathInfo: TParadroidPathInfo;

    constructor(
        public pos: Phaser.Types.Math.Vector2Like,
        public tile: ParadroidTile,
        public shapeType: EParadroidShape,
        public row: number,
        public col: number
    ) {
        this.pathInfo = { cost: 0, changers: 0, autofires: 0, activatedBy: [] };
        this.shapeInfo = CParadroidShapeInfo[shapeType];
        // this.shape = new BaseElement(stage, {
        //     anchor: 0.5,
        //     image: this.shapeInfo.image,
        //     rotation: this.shapeInfo.rotation,
        // });
        if (!this.isEmptyShape()) {
            this.addFlowbars();
            // this.addChild(this.shape);
            if (this.isCombineShape()) {
                this.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Combine);
                // this.addChild(this.specialFX);
            }
        }
    }

    get tileGrid(): ParadroidTileGrid {
        return this.tile.tileGrid;
    }

    private addFlowbars(): void {
        if (this.shapeInfo.ins.left) {
            // left to mid
            this.bars[EFlowbarFlow.FromLeft] = new ParadroidFlowbar(this, EFlowbarFlow.FromLeft, true, true, false);
        }
        if (this.shapeInfo.ins.top) {
            // top to mid
            this.bars[EFlowbarFlow.FromTop] = new ParadroidFlowbar(this, EFlowbarFlow.FromTop, true, false, true);
        }
        if (this.shapeInfo.ins.bottom) {
            // bot to mid
            this.bars[EFlowbarFlow.FromBottom] = new ParadroidFlowbar(
                this,
                EFlowbarFlow.FromBottom,
                true,
                false,
                false
            );
        }
        if (this.shapeInfo.outs.top) {
            // mid to top
            this.bars[EFlowbarFlow.ToTop] = new ParadroidFlowbar(this, EFlowbarFlow.ToTop, false, false, true);
        }
        if (this.shapeInfo.outs.bottom) {
            // mid to bot
            this.bars[EFlowbarFlow.ToBottom] = new ParadroidFlowbar(this, EFlowbarFlow.ToBottom, false, false, false);
        }
        if (this.shapeInfo.outs.right) {
            // mid to right
            this.bars[EFlowbarFlow.ToRight] = new ParadroidFlowbar(this, EFlowbarFlow.ToRight, false, true, false);
        }
    }

    updateIncomingFlow(incomingFlow: EFlowbarFlow, owner: EParadroidOwner): void {
        this.bars[incomingFlow].setOwner(owner);
    }

    updateOutgoingFlow(): void {
        if (!this.isEmptyShape()) {
            const incomingOwners: boolean[] = [];
            let incomingOwner: EParadroidOwner = EParadroidOwner.Nobody;
            this.bars.forEach((bar: ParadroidFlowbar): void => {
                if (bar.incoming) {
                    incomingOwner = bar.owner;
                    incomingOwners[incomingOwner] = true;
                }
            });
            const incomingOwnerCount: number = Object.keys(incomingOwners).length;
            if (incomingOwnerCount === 0) {
                throw new Error('Incoming Flow is not set');
            } else if (incomingOwnerCount >= 2) {
                incomingOwner = EParadroidOwner.Nobody;
            }
            this.outgoingOwner = this.isChanger ? ParadroidFlowbar.getOppositeOwner(incomingOwner) : incomingOwner;
            this.isBlocked = this.outgoingOwner === EParadroidOwner.Nobody;
            this.bars.forEach((bar: ParadroidFlowbar): void => {
                if (!bar.incoming) {
                    bar.setOwner(this.outgoingOwner);
                    const next: ParadroidShape = this.tileGrid.getNextShape(this, bar.flow);
                    if (next) {
                        next.updateIncomingFlow(ParadroidFlowbar.getOppositeFlow(bar.flow), this.outgoingOwner);
                    }
                }
            });
        }
    }

    initBefore(): void {
        if (!this.isEmptyShape() && this.shapeType !== EParadroidShape.Deadend && !this.specialFX) {
            if (!this.shapeInfo.ins.bottom) {
                if (Utils.rngPercentageHit(CParadroidModes[this.tileGrid.difficulty].changerRate)) {
                    this.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Changer);
                    this.isChanger = true;
                    this.pathInfo.changers++;
                    // this.addChild(this.specialFX);
                }
            }
        }
    }

    initAfter(): void {
        if (!this.isEmptyShape() && this.shapeType !== EParadroidShape.Deadend && !this.specialFX) {
            if (!this.shapeInfo.ins.bottom) {
                if (Utils.rngPercentageHit(CParadroidModes[this.tileGrid.difficulty].autofireRate)) {
                    if (this.pathInfo.changers === 0) {
                        if (this.pathInfo.autofires === 0) {
                            this.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Autofire);
                            this.isAutofire = true;
                            // this.addChild(this.specialFX);
                        }
                    }
                }
            }
        }
    }

    // TODO combine with update flow
    updatePathInfo(): void {
        this.pathInfo.autofires = this.isAutofire ? 1 : 0;
        this.pathInfo.changers = this.isChanger ? 1 : 0;
        this.pathInfo.cost = 0;
        this.bars.forEach((bar: ParadroidFlowbar): void => {
            if (bar.incoming) {
                const last: ParadroidShape = this.tileGrid.getNextShape(this, bar.flow);
                if (last) {
                    this.pathInfo.changers += last.pathInfo.changers;
                    this.pathInfo.autofires += last.pathInfo.autofires;

                    if (this.isCombineShape()) {
                        this.pathInfo.cost += last.pathInfo.cost;
                    } else if (this.isExpandShape()) {
                        this.pathInfo.cost = last.pathInfo.cost / this.tile.info.rows;
                    } else {
                        this.pathInfo.cost = last.pathInfo.cost;
                    }
                    if (this.outgoingOwner !== EParadroidOwner.Nobody && this.pathInfo.autofires === 0) {
                        this.pathInfo.activatedBy = Utils.mergeArrays(
                            this.pathInfo.activatedBy,
                            last.pathInfo.activatedBy
                        );
                    } else {
                        this.pathInfo.activatedBy = [];
                    }
                } else {
                    this.pathInfo.cost = Math.pow(2, this.tileGrid.columns / 2);
                    this.pathInfo.activatedBy = [this.row];
                }
            }
        });
        if (this.outgoingOwner === EParadroidOwner.Nobody) {
            this.pathInfo.activatedBy = [];
        }
    }

    update(): void {
        if (this.pathInfo.cost !== 0) {
            // this._debug(Math.trunc(this.pathInfo.cost) + '', true);
            // this._debug(this.pathInfo.activatedBy.toString() + '', true);
        }
        // return;
        if (!this.isEmptyShape()) {
            if (this.allInGatesAreActive() || this.isAutofire) {
                this.activateOutGates();
            } else if (this.oneInGateIsWaiting()) {
                this.deActivateOutGates();
            }
            if (this.hasOutGates()) {
                if (this.allOutGatesAreActive()) {
                    this.activateNextShapes();
                } else if (this.allOutGatesAreWaiting()) {
                    this.deactivateNextShapes();
                }
            }
        }
    }

    activateBar(flow: EFlowbarFlow): void {
        this.bars[flow].activateBar();
    }

    deactivateBar(flow: EFlowbarFlow): void {
        this.bars[flow].deactivateBar();
    }

    canActivate(flow: EFlowbarFlow): boolean {
        return this.bars[flow].isDeactive();
    }

    canDeActivate(flow: EFlowbarFlow): boolean {
        return this.bars[flow].isActive() && !this.isAutofire;
    }

    getOwner(flow: EFlowbarFlow): EParadroidOwner {
        return this.bars[flow].owner;
    }

    isCombineShape(): boolean {
        return (
            [
                EParadroidShape.XShapeCombine,
                EParadroidShape.TShapeUpDownCombine,
                EParadroidShape.TShapeUpCombine,
                EParadroidShape.TShapeDownCombine,
            ].indexOf(this.shapeType) >= 0
        );
    }

    isExpandShape(): boolean {
        return (
            [
                EParadroidShape.XShapeExpand,
                EParadroidShape.TShapeUpDownExpand,
                EParadroidShape.TShapeUpExpand,
                EParadroidShape.TShapeDownExpand,
            ].indexOf(this.shapeType) >= 0
        );
    }

    private isEmptyShape(): boolean {
        return this.shapeType === EParadroidShape.Empty;
    }

    private allInGatesAreActive(): boolean {
        return this.bars.filter((bar: ParadroidFlowbar) => bar.incoming && !bar.isActive()).length === 0;
    }

    private hasOutGates(): boolean {
        return this.bars.filter((bar: ParadroidFlowbar) => !bar.incoming).length > 0;
    }

    private allOutGatesAreActive(): boolean {
        return this.bars.filter((bar: ParadroidFlowbar) => !bar.incoming && !bar.isActive()).length === 0;
    }

    private allOutGatesAreWaiting(): boolean {
        return this.bars.filter((bar: ParadroidFlowbar) => !bar.incoming && !bar.isDeactive()).length === 0;
    }

    private oneInGateIsWaiting(): boolean {
        return this.bars.filter((bar: ParadroidFlowbar) => bar.incoming && bar.isDeactive()).length > 0;
    }

    private activateOutGates(): void {
        this.bars.forEach((bar: ParadroidFlowbar) => {
            if (!bar.incoming && !this.isBlocked) {
                bar.activateBar();
            }
        });
    }

    private deActivateOutGates(): void {
        this.bars.forEach((bar: ParadroidFlowbar) => {
            if (!bar.incoming && !this.isAutofire) {
                bar.deactivateBar();
            }
        });
    }

    private activateNextShapes(): void {
        let shape: ParadroidShape;
        if (this.shapeInfo.outs.top) {
            shape = this.tileGrid.getShape(this.col, this.row - 1);
            shape.activateBar(EFlowbarFlow.FromBottom); // from below
        }
        if (this.shapeInfo.outs.bottom) {
            shape = this.tileGrid.getShape(this.col, this.row + 1);
            shape.activateBar(EFlowbarFlow.FromTop); // from top
        }
        if (this.shapeInfo.outs.right) {
            if (!this.isBlocked) {
                if (this.col + 1 < this.tileGrid.columns) {
                    shape = this.tileGrid.getShape(this.col + 1, this.row);
                    shape.activateBar(EFlowbarFlow.FromLeft); // from left
                } else {
                    this.tileGrid.onFlowReachedMiddleRow.emit(this);
                }
            }
        }
    }

    private deactivateNextShapes(): void {
        let shape: ParadroidShape;
        if (this.shapeInfo.outs.top) {
            shape = this.tileGrid.getShape(this.col, this.row - 1);
            shape.deactivateBar(EFlowbarFlow.FromBottom); // from below
        }
        if (this.shapeInfo.outs.bottom) {
            shape = this.tileGrid.getShape(this.col, this.row + 1);
            shape.deactivateBar(EFlowbarFlow.FromTop); // from top
        }
        if (this.shapeInfo.outs.right) {
            if (this.col + 1 < this.tileGrid.columns) {
                shape = this.tileGrid.getShape(this.col + 1, this.row);
                shape.deactivateBar(EFlowbarFlow.FromLeft); // from left
            }
        }
    }

    canBeActivated(): boolean {
        return !!this.pathInfo.activatedBy.length;
    }

    hasFlow(flow: EFlowbarFlow): boolean {
        return typeof this.bars[flow] !== 'undefined';
    }

    outgoingOwnerIs(owner: EParadroidOwner): boolean {
        return this.outgoingOwner === owner;
    }

    public addFlowbar(param: ParadroidFlowbar) {
        console.log(param);
    }
}
