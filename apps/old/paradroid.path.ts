export class ParadroidPath {
    // #paths: TParadroidPath[];
    // #subTileGrid: TParadroidSubTile[][];
    //
    // updatePathInfoOnSubTile(subTile: TParadroidSubTile): void {
    //     // subTile.pathInfo.autofires = subTile.isAutofire ? 1 : 0;
    //     // subTile.pathInfo.changers = subTile.isChanger ? 1 : 0;
    //     // subTile.pathInfo.cost = 0;
    //     // subTile.bars.forEach((bar: ParadroidFlowbar): void => {
    //     //     if (bar.incoming) {
    //     //         const last = this.#getNextSubTile(subTile, bar.flow);
    //     //         if (last) {
    //     //             subTile.pathInfo.changers += last.pathInfo.changers;
    //     //             subTile.pathInfo.autofires += last.pathInfo.autofires;
    //     //
    //     //             if (subTile.outgoingOwner !== EParadroidOwner.Nobody && subTile.pathInfo.autofires === 0) {
    //     //                 subTile.pathInfo.activatedBy = Utils.mergeArrays(
    //     //                     subTile.pathInfo.activatedBy,
    //     //                     last.pathInfo.activatedBy
    //     //                 );
    //     //             } else {
    //     //                 subTile.pathInfo.activatedBy = [];
    //     //             }
    //     //         } else {
    //     //             subTile.pathInfo.cost = Math.pow(2, this.columns / 2);
    //     //             subTile.pathInfo.activatedBy = [subTile.row];
    //     //         }
    //     //     }
    //     // });
    //     // if (subTile.outgoingOwner === EParadroidOwner.Nobody) {
    //     //     subTile.pathInfo.activatedBy = [];
    //     // }
    // }
    //
    // generateGridStructure(): void {
    //     // initialize all paths before the structure is created
    //     // this.updatePathInfo(column);
    //     // for (let col: number = 1, j: number = this.tileGrid.length; col < j; col++) {
    //     //     for (let row: number = 0, l: number = this.tileGrid[col].length; row < l; row++) {
    //     //         const subTile = this.getSubTile(col, row);
    //     //         this.initBefore(subTile);
    //     //     }
    //     //     this.updatePathInfo(col - 1);
    //     // }
    //     // the first col is allways a fromLeft toRight Flow only shape (initialize GridAccess takes care of that)
    //     // so set the owner of the shape to the tile grid owner
    //     // for (let row: number = 0, l: number = this.rows; row < l; row++) {
    //     //     const shape = this.getSubTile(0, row);
    //     //     this.updateIncomingFlow(shape, EFlow.FromLeft, this.owner);
    //     // }
    //     // then walk through the shapes and update their owner accordingly
    //     // for (let col: number = 0, j: number = this.columns; col < j; col++) {
    //     //     const combines: TParadroidSubTile[] = [];
    //     //     const others: TParadroidSubTile[] = [];
    //     //     // first update all expanding shapes and collect combining and other shapes during iteration
    //     //     for (let row: number = 0, l: number = this.rows; row < l; row++) {
    //     //         const subTile = this.getSubTile(col, row);
    //     //         if (isExpandShape(subTile.shape)) {
    //     //             this.updateOutgoingFlow(subTile);
    //     //         } else if (isCombineShape(subTile.shape)) {
    //     //             combines.push(subTile);
    //     //         } else {
    //     //             others.push(subTile);
    //     //         }
    //     //     }
    //     //     // then update the flow of the not combining shapes
    //     //     others.forEach((subTile): void => {
    //     //         this.updateOutgoingFlow(subTile);
    //     //     });
    //     //     // after every other shape is updated update the combining shapes
    //     //     combines.forEach((subTile): void => {
    //     //         this.updateOutgoingFlow(subTile);
    //     //     });
    //     // }
    //     // // then initialize all SpecialFX that need to be created after the structure is created
    //     // for (let col = 1, j = this.columns; col < j; col++) {
    //     //     for (let row = 0, l = this.rows; row < l; row++) {
    //     //         const subTile = this.getSubTile(col, row);
    //     //         this.initAfter(subTile);
    //     //         this.updatePathInfo(col - 1);
    //     //     }
    //     // }
    // }
    //
    // /**
    //  * Iterate the first column and update the path info from there
    //  */
    // private updatePathInfo(minCol: number): void {
    //     // const expands: TParadroidSubTile[] = [];
    //     // const combines: TParadroidSubTile[] = [];
    //     // const others: TParadroidSubTile[] = [];
    //     //
    //     // for (let col = minCol, j = this.columns; col < j; col++) {
    //     //     // first update all expanding shapes and collect combining and other shapes during iteration
    //     //     for (let row: number = 0, l: number = this.rows; row < l; row++) {
    //     //         const subTile = this.#getSubTile(col, row);
    //     //         if (isExpandShape(subTile.shape)) {
    //     //             this.updatePathInfoOnSubTile(subTile);
    //     //         } else if (isCombineShape(subTile.shape)) {
    //     //             combines.push(subTile);
    //     //         } else {
    //     //             others.push(subTile);
    //     //         }
    //     //     }
    //     //     // then update the flow of the not combining shapes
    //     //     others.forEach((subTile): void => {
    //     //         this.updatePathInfoOnSubTile(subTile);
    //     //     });
    //     //     // after every other shape is updated -> update the combining shapes
    //     //     combines.forEach((subTile): void => {
    //     //         this.updatePathInfoOnSubTile(subTile);
    //     //     });
    //     // }
    // }
    //
    // updateOutgoingFlow(subTile: TParadroidSubTile): void {
    //     // if (!isEmptyShape(subTile.shape)) {
    //     //     const incomingOwners: boolean[] = [];
    //     //     let incomingOwner: EParadroidOwner = EParadroidOwner.Nobody;
    //     //     subTile.bars.forEach((bar: ParadroidFlowbar): void => {
    //     //         if (bar.incoming) {
    //     //             incomingOwner = bar.owner;
    //     //             incomingOwners[incomingOwner] = true;
    //     //         }
    //     //     });
    //     //     const incomingOwnerCount: number = Object.keys(incomingOwners).length;
    //     //     if (incomingOwnerCount === 0) {
    //     //         throw new Error('Incoming Flow is not set');
    //     //     } else if (incomingOwnerCount >= 2) {
    //     //         incomingOwner = EParadroidOwner.Nobody;
    //     //     }
    //     //     subTile.outgoingOwner = subTile.isChanger
    //     //         ? ParadroidFlowbar.getOppositeOwner(incomingOwner)
    //     //         : incomingOwner;
    //     //     subTile.isBlocked = subTile.outgoingOwner === EParadroidOwner.Nobody;
    //     //     subTile.bars.forEach((bar: ParadroidFlowbar): void => {
    //     //         if (!bar.incoming) {
    //     //             bar.setOwner(subTile.outgoingOwner);
    //     //             const next = this.#getNextSubTile(subTile, bar.flow);
    //     //             if (next) {
    //     //                 this.updateIncomingFlow(
    //     //                     next,
    //     //                     ParadroidFlowbar.getOppositeFlow(bar.flow),
    //     //                     subTile.outgoingOwner
    //     //                 );
    //     //             }
    //     //         }
    //     //     });
    //     // }
    // }
    //
    // updateIncomingFlow(subTile: TParadroidSubTile, incomingFlow: EFlow, owner: EParadroidOwner): void {
    //     subTile.flow[incomingFlow].owner = owner;
    // }
}
