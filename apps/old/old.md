## grid gen
// tests if the grid is interesting enough

## UI and splash :D

 frames: [CImages.Splash.Three, CImages.Splash.Two, CImages.Splash.One, CImages.Splash.Fight],
        
### states on scene?
states intro pause playing .... end  


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



### dungeon generator

class Rng {
/// Gets a random [Vec] within the given [Rect] (half-inclusive).
Vec vecInRect(Rect rect) {
return Vec(range(rect.left, rect.right), range(rect.top, rect.bottom));
}

/// Gets a random number centered around [center] with [range] (inclusive)
/// using a triangular distribution. For example `triangleInt(8, 4)` will
/// return values between 4 and 12 (inclusive) with greater distribution
/// towards 8.
///
/// This means output values will range from `(center - range)` to
/// `(center + range)` inclusive, with most values near the center, but not
/// with a normal distribution. Think of it as a poor man's bell curve.
///
/// The algorithm works essentially by choosing a random point inside the
/// triangle, and then calculating the x coordinate of that point. It works
/// like this:
///
/// Consider Center 4, Range 3:
///
///             *
///           * | *
///         * | | | *
///       * | | | | | *
///     --+-----+-----+--
///     0 1 2 3 4 5 6 7 8
///      -r     c     r
///
/// Now flip the left half of the triangle (from 1 to 3) vertically and move
/// it over to the right so that we have a square.
///
///         .-------.
///         |       V
///         |
///         |   R L L L
///         | . R R L L
///         . . R R R L
///       . . . R R R R
///     --+-----+-----+--
///     0 1 2 3 4 5 6 7 8
///
/// Choose a point in that square. Figure out which half of the triangle the
/// point is in, and then remap the point back out to the original triangle.
/// The result is the *x* coordinate of the point in the original triangle.
int triangleInt(int center, int range) {
if (range < 0) {
throw ArgumentError("The argument \"range\" must be zero or greater.");
}

    // Pick a point in the square.
    int x = inclusive(range);
    int y = inclusive(range);

    // Figure out which triangle we are in.
    if (x <= y) {
      // Larger triangle.
      return center + x;
    } else {
      // Smaller triangle.
      return center - range - 1 + x;
    }
}

int taper(int start, int chanceOfIncrement) {
while (oneIn(chanceOfIncrement)) {
start++;
}
return start;
}
}
