import {
    CParadroidShapeInfo,
    EParadroidOwner,
    EParadroidShape,
} from '../../libs/np-phaser/src/lib/paradroid/paradroid.tiles-and-shapes.definitions';
import { TParadroidShape } from '../../libs/np-phaser/src/lib/paradroid/paradroid.types';
import { Utils } from '../../libs/np-phaser/src/lib/sprites/paradroid/utils';
import { ParadroidFlowbar } from './paradroid.flowbar';
import { ParadroidSpecialFX } from './paradroid.specialfx';
import { ParadroidTile } from './paradroid.tile';
import { ParadroidTileGrid } from './paradroid.tilegrid';

interface TParadroidPathInfo {
    changers: number;
    autofires: number;
    cost: number;
    activatedBy: number[];
}

export class ParadroidShape {
    private shapeInfo: TParadroidShape;
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
                // this.specialFX = new ParadroidSpecialFX(this.EParadroidSpecialFX.Combine);
                // this.addChild(this.specialFX);
            }
        }
    }

    get tileGrid(): ParadroidTileGrid {
        return this.tile.tileGrid;
    }

    private addFlowbars(): void {
        // if (this.shapeInfo.input.left) {
        //     // left to mid
        //     this.bars[EFlow.FromLeft] = new ParadroidFlowbar(this, EFlow.FromLeft, true, true, false);
        // }
        // if (this.shapeInfo.input.top) {
        //     // top to mid
        //     this.bars[EFlow.FromTop] = new ParadroidFlowbar(this, EFlow.FromTop, true, false, true);
        // }
        // if (this.shapeInfo.input.bottom) {
        //     // bot to mid
        //     this.bars[EFlow.FromBottom] = new ParadroidFlowbar(this, EFlow.FromBottom, true, false, false);
        // }
        // if (this.shapeInfo.output.top) {
        //     // mid to top
        //     this.bars[EFlow.ToTop] = new ParadroidFlowbar(this, EFlow.ToTop, false, false, true);
        // }
        // if (this.shapeInfo.output.bottom) {
        //     // mid to bot
        //     this.bars[EFlow.ToBottom] = new ParadroidFlowbar(this, EFlow.ToBottom, false, false, false);
        // }
        // if (this.shapeInfo.output.right) {
        //     // mid to right
        //     this.bars[EFlow.ToRight] = new ParadroidFlowbar(this, EFlow.ToRight, false, true, false);
        // }
    }

    // updateIncomingFlow(incomingFlow: EFlow, owner: EParadroidOwner): void {
    //     this.bars[incomingFlow].setOwner(owner);
    // }
    //
    // updateOutgoingFlow(): void {
    //     if (!this.isEmptyShape()) {
    //         const incomingOwners: boolean[] = [];
    //         let incomingOwner: EParadroidOwner = EParadroidOwner.Nobody;
    //         this.bars.forEach((bar: ParadroidFlowbar): void => {
    //             if (bar.incoming) {
    //                 incomingOwner = bar.owner;
    //                 incomingOwners[incomingOwner] = true;
    //             }
    //         });
    //         const incomingOwnerCount: number = Object.keys(incomingOwners).length;
    //         if (incomingOwnerCount === 0) {
    //             throw new Error('Incoming Flow is not set');
    //         } else if (incomingOwnerCount >= 2) {
    //             incomingOwner = EParadroidOwner.Nobody;
    //         }
    //         this.outgoingOwner = this.isChanger ? getOppositeOwner(incomingOwner) : incomingOwner;
    //         this.isBlocked = this.outgoingOwner === EParadroidOwner.Nobody;
    //         this.bars.forEach((bar: ParadroidFlowbar): void => {
    //             if (!bar.incoming) {
    //                 bar.setOwner(this.outgoingOwner);
    //                 const next: ParadroidShape = this.tileGrid.getNextShape(this, bar.flow);
    //                 if (next) {
    //                     next.updateIncomingFlow(getOppositeFlow(bar.flow), this.outgoingOwner);
    //                 }
    //             }
    //         });
    //     }
    // }

    initBefore(): void {
        // if (!this.isEmptyShape() && this.shapeType !== EParadroidShape.Deadend && !this.specialFX) {
        //     if (!this.shapeIn    fo.input.bottom) {
        //         if (Utils.rngPercentageHit(CParadroidModes[this.tileGrid.difficulty].changerRate)) {
        //             this.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Changer);
        //             this.isChanger = true;
        //             this.pathInfo.changers++;
        //             // this.addChild(this.specialFX);
        //         }
        //     }
        // }
    }

    initAfter(): void {
        // if (!this.isEmptyShape() && this.shapeType !== EParadroidShape.Deadend && !this.specialFX) {
        //     if (!this.shapeInfo.input.bottom) {
        //         if (Utils.rngPercentageHit(CParadroidModes[this.tileGrid.difficulty].autofireRate)) {
        //             if (this.pathInfo.changers === 0) {
        //                 if (this.pathInfo.autofires === 0) {
        //                     this.specialFX = new ParadroidSpecialFX(EParadroidSpecialFX.Autofire);
        //                     this.isAutofire = true;
        //                     // this.addChild(this.specialFX);
        //                 }
        //             }
        //         }
        //     }
        // }
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
                        const rows = this.tile.info.incoming.bot ? 3 : this.tile.info.incoming.mid ? 2 : 1;
                        this.pathInfo.cost = last.pathInfo.cost / rows;
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

    // activateBar(flow: EFlow): void {
    //     this.bars[flow].activateBar();
    // }
    //
    // deactivateBar(flow: EFlow): void {
    //     this.bars[flow].deactivateBar();
    // }
    //
    // canActivate(flow: EFlow): boolean {
    //     return this.bars[flow].isDeactive();
    // }
    //
    // canDeActivate(flow: EFlow): boolean {
    //     return this.bars[flow].isActive() && !this.isAutofire;
    // }
    //
    // getOwner(flow: EFlow): EParadroidOwner {
    //     return this.bars[flow].owner;
    // }

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
        // let shape: ParadroidShape;
        // if (this.shapeInfo.output.top) {
        //     shape = this.tileGrid.getShape(this.col, this.row - 1);
        //     shape.activateBar(EFlow.FromBottom); // from below
        // }
        // if (this.shapeInfo.output.bottom) {
        //     shape = this.tileGrid.getShape(this.col, this.row + 1);
        //     shape.activateBar(EFlow.FromTop); // from top
        // }
        // if (this.shapeInfo.output.right) {
        //     if (!this.isBlocked) {
        //         if (this.col + 1 < this.tileGrid.columns) {
        //             shape = this.tileGrid.getShape(this.col + 1, this.row);
        //             shape.activateBar(EFlow.FromLeft); // from left
        //         } else {
        //             this.tileGrid.onFlowReachedMiddleRow.emit(this);
        //         }
        //     }
        // }
    }

    private deactivateNextShapes(): void {
        // let shape: ParadroidShape;
        // if (this.shapeInfo.output.top) {
        //     shape = this.tileGrid.getShape(this.col, this.row - 1);
        //     shape.deactivateBar(EFlow.FromBottom); // from below
        // }
        // if (this.shapeInfo.output.bottom) {
        //     shape = this.tileGrid.getShape(this.col, this.row + 1);
        //     shape.deactivateBar(EFlow.FromTop); // from top
        // }
        // if (this.shapeInfo.output.right) {
        //     if (this.col + 1 < this.tileGrid.columns) {
        //         shape = this.tileGrid.getShape(this.col + 1, this.row);
        //         shape.deactivateBar(EFlow.FromLeft); // from left
        //     }
        // }
    }

    canBeActivated(): boolean {
        return !!this.pathInfo.activatedBy.length;
    }

    // hasFlow(flow: EFlow): boolean {
    //     return typeof this.bars[flow] !== 'undefined';
    // }

    outgoingOwnerIs(owner: EParadroidOwner): boolean {
        return this.outgoingOwner === owner;
    }

    public addFlowbar(param: ParadroidFlowbar) {
        if (param.flow % 0 > 1) console.log(param);
    }
}
