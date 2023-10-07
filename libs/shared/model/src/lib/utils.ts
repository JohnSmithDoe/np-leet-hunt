// export const PI: number = Math.PI;
// export const PIQuart: number = Math.PI / 4;
// export const PIHalf: number = Math.PI / 2;
// export const PIDouble: number = Math.PI * 2;
// export const OneDegInRad: number = Utils.PIDouble / 360;
// export const DIR_RIGHT: number = Utils.PIHalf;
// export const DIR_LEFT: number = Utils.PI + Utils.PIHalf;
// export const DIR_UP: number = 0;
// export const DIR_DOWN: number = Utils.PI;
//
// public static shuffle<T>(array: T[]): T[] {
//     let currentIndex: number = array.length;
//     let temporaryValue: T;
//     let randomIndex: number;
//     // While there remain elements to shuffle...
//     while (currentIndex !== 0) {
//         // Pick a remaining element...
//         randomIndex = Math.floor(Math.random() * currentIndex);
//         currentIndex -= 1;
//         // And swap it with the current element.
//         temporaryValue = array[currentIndex];
//         array[currentIndex] = array[randomIndex];
//         array[randomIndex] = temporaryValue;
//     }
//
//     return array;
// }
//
// // // Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
// // // Output: [1, 2, 3, 101, 10]
// // public static mergeArrays<T extends unknown[]>(...arr: T[]): unknown[] {
// //     return [...new Set<T>([].concat(...arr))];
// // }
// //
// // public static flatmerge<T>(x: T, y?: T): T {
// //     if (!y) {
// //         return x;
// //     }
// //     for (const prop in y) {
// //         if (y.hasOwnProperty(prop)) {
// //             x[prop] = y[prop];
// //         }
// //     }
// //     return x;
// // }
// //
// // /**
// //  * Creates a uuid
// //  */
// // public static generateUUID(): string {
// //     let d: number = new Date().getTime();
// //     if (window.performance && typeof window.performance.now === 'function') {
// //         d += performance.now(); // use high-precision timer if available
// //     }
// //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string): string => {
// //         // eslint-disable-next-line no-bitwise
// //         const r: number = (d + Math.random() * 16) % 16 | 0;
// //         d = Math.floor(d / 16);
// //         // eslint-disable-next-line eqeqeq,no-bitwise
// //         return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
// //     });
// // }
// //
// // /**
// //  * @param angleRad angle in radian
// //  * @param precision the number precidion (digits after dot)
// //  */
// // public static normalizeAngleRad(angleRad: number, precision?: number): number {
// //     if (angleRad > Utils.PIDouble) {
// //         angleRad = Utils.normalizeAngleRad(angleRad - Utils.PIDouble);
// //     }
// //     if (angleRad < 0) {
// //         angleRad = Utils.normalizeAngleRad(angleRad + Utils.PIDouble);
// //     }
// //     precision = precision || 4;
// //     const value: number = Math.pow(10, precision);
// //     return Math.round(angleRad * value) / value;
// // }
// //
// // /**
// //  * idx -1,-11,-21 = 9 when ringlength 10
// //  */
// // public static getRingIndex(idx: number, ringLength: number): number {
// //     if (!ringLength) {
// //         return -1;
// //     }
// //     idx = idx % ringLength;
// //     return idx + (idx < 0 ? ringLength : 0);
// // }
// //
// // /**
// //  * Returns the number of decimals after the dot
// //  * 0.45 = 2 0.001 = 3 ...
// //  */
// // public static getPrecision(value: number): number {
// //     const sp: string[] = `${value}`.split('.');
// //     if (sp[1] !== undefined) {
// //         return sp[1].length;
// //     } else {
// //         return 0;
// //     }
// // }
// //
// // /**
// //  * Returns the diffence between the 2 angels in RAD
// //  */
// // public static getAngleDiff(angle1: number, angle2: number, precision: number): number {
// //     const norm1: number = Utils.normalizeAngleRad(angle1, precision);
// //     const norm2: number = Utils.normalizeAngleRad(angle2, precision);
// //     let diff: number = Math.abs(norm1 - norm2);
// //     precision = precision || 2;
// //     if (diff > Utils.PI) {
// //         diff = Utils.normalizeAngleRad(Utils.PIDouble - diff, precision);
// //     }
// //     return diff;
// // }
// //
// // /**
// //  * Angelediff in epsilon surrounding
// //  */
// // public static anglesInEpsilon(angle1: number, angle2: number, epsilon: number): boolean {
// //     const precision: number = Utils.getPrecision(epsilon);
// //     const diff: number = Utils.getAngleDiff(angle1, angle2, precision);
// //     return diff < epsilon;
// // }
// //
// // /**
// //  * DEG to RAD
// //  */
// // public static angleRadToDeg(angleRad: number): number {
// //     return angleRad / (Math.PI / 180);
// // }
// //
// // /**
// //  * RAD to DEG
// //  */
// // public static angleDegToRad(angleDeg: number): number {
// //     return angleDeg * (Math.PI / 180);
// // }
// //
// // /**
// //  */
// // // public static getAngleBetweenPoints(p1: Point | ObservablePoint, p2: Point | ObservablePoint, offset?: number): number {
// // //     return Utils.normalizeAngleRad(Math.atan2(p2.y - p1.y, p2.x - p1.x) + Utils.PIHalf + (offset || 0));
// // // }
// // //
// // // /**
// // //  * Returns the distance between two points
// // //  */
// // // public static getDistance(start: Point | ObservablePoint, target: Point | ObservablePoint): number {
// // //     const a: number = start.x - target.x;
// // //     const b: number = start.y - target.y;
// // //     return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
// // // }
// // //
// // // /**
// // //  * Target in range of start
// // //  */
// // // public static inRange(start: Point | ObservablePoint, target: Point | ObservablePoint, range: number): boolean {
// // //     return target ? Utils.getDistance(start, target) <= range : false;
// // // }
// // //
// // // public static getPositionForAngle(start: Point | ObservablePoint, angleRad: number, speed: number): Point {
// // //     return new Point(start.x + Math.sin(angleRad) * speed, start.y - Math.cos(angleRad) * speed);
// // // }
// // //
// // // /**
// // //  */
// // // public static moveTowardsAngle(element: DisplayObject, angleRad: number, speed: number): void {
// // //     const target: Point = Utils.getPositionForAngle(element.position, angleRad, speed);
// // //     element.position.set(target.x, target.y);
// // // }
// // //
// // // /**
// // //  * Move element towards target position.
// // //  * Return true if reached the target position false otherwise
// // //  */
// // // public static moveTowardsPosition(element: DisplayObject, target: Point, speed: number): boolean {
// // //     if (Utils.inRange(element.position, target, speed)) {
// // //         element.position.set(target.x, target.y);
// // //         return true;
// // //     }
// // //     const angleRad: number = Utils.getAngleBetweenPoints(element.position, target);
// // //     Utils.moveTowardsAngle(element, angleRad, speed);
// // //     return false;
// // // }
// // //
// // // /**
// // //  * Moves the element into the direction of its rotation with the given speed
// // //  */
// // // public static moveElement(element: DisplayObject, speed: number): void {
// // //     Utils.moveTowardsAngle(element, element.rotation, speed);
// // // }
// // //
// // // /**
// // //  * Rotatates the element towards the given position
// // //  */
// // // public static turnToPosition(element: DisplayObject, pos: Point): void {
// // //     element.rotation = Utils.getAngleBetweenPoints(pos, element.position);
// // // }
// // //
// // // public static hitTestRectangle(r1: Rectangle, r2: Rectangle): boolean {
// // //     // Define the letiables we'll need to calculate
// // //     let hit: boolean;
// // //     let combinedHalfWidths: number;
// // //     let combinedHalfHeights: number;
// // //     let vx: number;
// // //     let vy: number;
// // //     // hit will determine whether there's a collision
// // //     hit = false;
// // //     // Find the center points of each sprite
// // //     // Find the half-widths and half-heights of each sprite
// // //     const c1: THitTestCenter = {
// // //         centerX: r1.x + r1.width / 2,
// // //         centerY: r1.y + r1.height / 2,
// // //         halfWidth: r1.width / 2,
// // //         halfHeight: r1.height / 2,
// // //     };
// // //     const c2: THitTestCenter = {
// // //         centerX: r2.x + r2.width / 2,
// // //         centerY: r2.y + r2.height / 2,
// // //         halfWidth: r2.width / 2,
// // //         halfHeight: r2.height / 2,
// // //     };
// // //     // Calculate the distance vector between the sprites
// // //     vx = c1.centerX - c2.centerX;
// // //     vy = c1.centerY - c2.centerY;
// // //     // Figure out the combined half-widths and half-heights
// // //     combinedHalfWidths = c1.halfWidth + c2.halfWidth;
// // //     combinedHalfHeights = c1.halfHeight + c2.halfHeight;
// // //     // Check for a collision on the x axis
// // //     if (Math.abs(vx) < combinedHalfWidths) {
// // //         // A collision might be occuring. Check for a collision on the y axis
// // //         hit = Math.abs(vy) < combinedHalfHeights;
// // //     } else {
// // //         // There's no collision on the x axis
// // //         hit = false;
// // //     }
// // //     // `hit` will be either `true` or `false`
// // //     return hit;
// // // }
// // //
// // // public static checkCollision(elem1: DisplayObject, elem2: DisplayObject): boolean {
// // //     if (elem1.hitArea && elem2.hitArea) {
// // //         return Utils.hitTestRectangle(elem1.getBounds(), elem2.getBounds());
// // //     }
// // //
// // //     // let globalPos = sprite.worldTransform.translate(sprite.hitArea.x, sprite.hitArea.y);
// // //     // if(PIXI.SHAPES.RECT == elem1.type){
// // //     //     return hitTestRectangle(elem1.getBounds(), elem2.getBounds());
// // //     // }
// // //     return false;
// // // }
// // //
// // // /**
// // //  *
// // //  * @param contentWidth
// // //  * @param contentHeight
// // //  * @param maxWidth
// // //  * @param maxHeight
// // //  * @return {}
// // //  */
// // // public static calcContentSize(contentWidth: number, contentHeight: number, maxWidth: number, maxHeight: number): TContentSize {
// // //     const ratioContent: number = contentWidth / contentHeight;
// // //     const ratioMax: number = maxWidth / maxHeight;
// // //     let finalWidth: number = maxWidth;
// // //     let finalHeight: number = maxHeight;
// // //     if (ratioMax >= 1) {
// // //         finalWidth = maxHeight * ratioContent;
// // //         if (finalWidth > maxWidth) {
// // //             finalWidth = maxWidth;
// // //             finalHeight = maxWidth / ratioContent;
// // //         }
// // //     } else {
// // //         finalHeight = maxWidth / ratioContent;
// // //         if (finalHeight > maxHeight) {
// // //             finalHeight = maxHeight;
// // //             finalWidth = maxHeight * ratioContent;
// // //         }
// // //     }
// // //
// // //     return {
// // //         width: finalWidth,
// // //         height: finalHeight,
// // //         scalefactor: finalWidth / contentWidth,
// // //         left: (maxWidth - finalWidth) / 2,
// // //         top: (maxHeight - finalHeight) / 2,
// // //         applyValues(displayObject: DisplayObject, mask: boolean): void {
// // //             displayObject.scale.set(this.scalefactor);
// // //             displayObject.position.set(this.left, this.top);
// // //             if (mask) {
// // //                 displayObject.mask.scale.set(this.scalefactor);
// // //                 displayObject.mask.position.set(this.left, this.top);
// // //             }
// // //         },
// // //     };
// // // }
// //
// // /**
// //  * Returns a random integer between start (inclusive) and end (inclusive)
// //  * If end is not given start is 0
// //  */
// // public static rng(start: number, end?: number): number {
// //     const range: number = end ? end - start + 1 : start + 1;
// //     return Math.floor(Math.random() * range) + (end ? start : 0);
// // }
// //
// // /**
// //  * If a random (100) is smaller then the given percentage this returns true
// //  *
// //  * @param percent
// //  * @return
// //  */
// // static rngPercentageHit(percent: number): boolean {
// //     return Utils.rng(100) <= percent;
// // }
// //
// // // TODO: is this working ??? changed from string to number ....
// // public static randomHexColor(): number {
// //     return Math.floor(Math.random() * 16777215);
// //     // return '0x' + Math.floor(Math.random() * 16777215).toString(16);
// // }
// //
// // public static hexColor(r: string, g: string, b: string): number {
// //     return Number.parseInt('0x' + r + g + b);
// // }
// //
// // /**
// //  * time in ms
// //  */
// // public static getTimeInFPS(time: number, fps: number): number {
// //     return Math.floor((time / 1000) * fps);
// // }
// //
// // // public static addBoundsToElement(element: Container): void {
// // //     function addBounds(_element: Container): void {
// // //         let g: Graphics = new Graphics();
// // //         g.clear();
// // //         g.lineStyle(3, 0xffff00, 1);
// // //         const b: Rectangle = _element.getLocalBounds();
// // //         g.drawRect(b.x, b.y, b.width, b.height);
// // //         _element.addChild(g);
// // //         const hitArea: Rectangle = _element.getLocalBounds(_element.hitArea as Rectangle); // TODO: this has to be a rectangle ??
// // //         // let hitArea = _element.getBounds(_element.hitArea);
// // //         if (hitArea) {
// // //             if (hitArea.type === SHAPES.CIRC) {
// // //                 g = new Graphics();
// // //                 g.clear();
// // //                 g.lineStyle(3, 0xff00ff, 1);
// // //                 g.drawCircle(hitArea.x, hitArea.y, 10); // hitArea.radius); // TODO: this has to be a rectangle ??
// // //                 _element.addChild(g);
// // //             }
// // //             if (hitArea.type === SHAPES.RECT) {
// // //                 g = new Graphics();
// // //                 g.clear();
// // //                 g.lineStyle(3, 0xff00ff, 1);
// // //                 g.drawRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
// // //                 _element.addChild(g);
// // //             }
// // //         }
// // //     }
// // //
// // //     addBounds(element);
// // //     for (let i: number = 0, j: number = element.children.length; i < j; i++) {
// // //         const child: DisplayObject = element.children[i];
// // //         if (child instanceof Container) {
// // //             addBounds(child);
// // //         }
// // //     }
// // // }
// // //
// // // /**
// // //  * Get speed input from keys and gamepad.
// // //  * Gamepad is prefered.
// // //  * FIXME: IKeyboardState
// // //  */
// // // public static getSpeedFromInput(keys: KeyboardInput, gamepad: GamepadInput, maxMoveSpeed: number, maxRotateSpeed: number): TMoveSpeed {
// // //     let moveSpeed: number = 0;
// // //     let rotateSpeed: number = 0;
// // //
// // //     if (keys.up.pressed) {
// // //         moveSpeed = maxMoveSpeed;
// // //     } else if (keys.down.pressed) {
// // //         moveSpeed = -maxMoveSpeed;
// // //     }
// // //     if (keys.left.pressed) {
// // //         rotateSpeed = -maxRotateSpeed;
// // //     } else if (keys.right.pressed) {
// // //         rotateSpeed = maxRotateSpeed;
// // //     }
// // //
// // //     if (gamepad) {
// // //         let speed: number = gamepad.leftAxis.yaxis;
// // //         speed = Math.round(speed * 10) / 10;
// // //         if (Math.abs(speed) > 0.3) {
// // //             moveSpeed = speed * maxMoveSpeed;
// // //         }
// // //         speed = gamepad.leftAxis.xaxis;
// // //         speed = Math.round(speed * 10) / 10;
// // //         if (Math.abs(speed) > 0.3) {
// // //             rotateSpeed = speed * maxRotateSpeed;
// // //         }
// // //     }
// // //     return { move: moveSpeed, rotate: rotateSpeed };
// // // }
// // //
// // // public static p2Str(point: Point | ObservablePoint, keepPrecision?: boolean): string {
// // //     const x: number = keepPrecision ? point.x : Math.trunc(point.x);
// // //     // noinspection JSSuspiciousNameCombination
// // //     const y: number = keepPrecision ? point.y : Math.trunc(point.y);
// // //     return '(x: ' + x + ', y: ' + y + ')';
// // // }
// // //
// // // /**
// // //  * @param widHei
// // //  * @return
// // //  */
// // // public static getCenterPoint(widHei: Point): Point {
// // //     return new Point(widHei.x / 2, widHei.y / 2);
// // // }
// // //
// // // static valueAsPercentage(maxValue: number, value: number): number {
// // //     return (100 / maxValue) * value;
// // // }
// // //
// // // static bounds2Str(localBounds: PIXI.Rectangle): string {
// // //     return `
// // // 	x: ${localBounds.x}
// // // 	y: ${localBounds.y}
// // // 	wid: ${localBounds.width}
// // // 	hei: ${localBounds.height}
// // // 	top: ${localBounds.top}
// // // 	bot: ${localBounds.bottom}
// // // 	left: ${localBounds.left}
// // // 	right: ${localBounds.right}`;
// // // }
// //
// // static rngElement<T>(array: T[]): T {
// //     return array[Utils.rng(array.length - 1)];
// // }
// //
// // static rngElementDict<T>(array: T[]): T {
// //     const tmp: T[] = [];
// //     array.forEach((item: T): void => {
// //         tmp.push(item);
// //     });
// //     return tmp[Utils.rng(tmp.length - 1)];
// // }
