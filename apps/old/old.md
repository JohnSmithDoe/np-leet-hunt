## grid gen
// check each row of the last column
// true if there are more than this.rows / 2 shapes that get activated
// tests if the grid is interesting enough

## UI and splash :D
// button row
private onClicked(): void {
this.engine.activateRow(this.row, this.owner);
}
// ui
// this.recreateBtn = new Button(this.stage, { title: 'recreate' });
// this.recreateBtn.onClick.add(this.onStartCreating, this);
// this.splashVsIntro = new SplashVsElement(this.stage, { hiddenAndPaused: false }, this, this.onStartCreating);
// this.splashGo = new SplashImageElement(
//     this.stage,
//     {
//         frames: [CImages.Splash.Three, CImages.Splash.Two, CImages.Splash.One, CImages.Splash.Fight],
//         hiddenAndPaused: true,
//     },
//     this,
//     this.onStartPlaying
// );
//
// this.addChild(this.binaryTimer);
        
### states on scene?
states intro pause playing .... end  


### counter
export class ParadroidCounter {
private count: number = 0;
private owner: EParadroidOwner;


### droid
        this.initializeAI();

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
                shape.hasFlow(EFlow.ToRight) &&
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

### shots -> actions
            const shot = { x: pos.x, y: pos.y, image: CParadroidShotImages[owner] };
            this.shots.push(shot);
