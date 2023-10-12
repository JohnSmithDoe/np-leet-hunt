// import { IMAGES, Planet } from '../sprites/planet/planet';
//
// export interface TSectorData {
//     map: {
//         width: number;
//         height: number;
//     };
//     planets: number;
//     enemies: number;
// }
//
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// class StarmapFactory {
//     private createNewPlanets(config: TSectorData): Planet[] {
//         const isLandscape: boolean = config.map.width >= config.map.height;
//         const planetCount: number = config.planets;
//         const factor: number = Math.round(Math.sqrt(planetCount));
//         let rows: number = factor;
//         let cols: number = factor;
//         while (rows * cols < planetCount) {
//             rows = isLandscape ? rows + 1 : rows;
//             cols = isLandscape ? cols : cols + 1;
//         }
//         const colWidth: number = Math.round(config.map.width / cols);
//         const rowHeight: number = Math.round(config.map.height / rows);
//
//         let planetData = [];
//         for (let col: number = 0; col < cols; col++) {
//             for (let row: number = 0; row < rows; row++) {
//                 planetData.push({
//                     image: IMAGES,
//                     x: col * colWidth,
//                     y: row * rowHeight,
//                 });
//             }
//         }
//
//         planetData = Utils.shuffle(planetData);
//
//         // for (let col: number = 0, j: number = planetCount - 4; col < j; col++) {
//         // 	planetData.push({
//         // 		image: CImages.Planets[col % CImages.Planets.length],
//         // 		x    : (Math.floor(Math.random() * config.map.width)),
//         // 		y    : (Math.floor(Math.random() * config.map.height)),
//         // 	});
//         // }
//         for (let i: number = 0, j: number = planetCount; i < j; i++) {
//             const p1: Planet = new Planet(this.stage, planetData[i]);
//             result.addChild(p1);
//         }
//
//         return result;
//     }
//
//     private addCornerPlanets(planetData: TPlanetOptions[], config: TSectorData): void {
//         planetData.push({
//             image: CImages.Planets[0],
//             x: 0,
//             y: 0,
//         });
//         planetData.push({
//             image: CImages.Planets[1],
//             x: config.map.width,
//             y: config.map.height,
//         });
//         planetData.push({
//             image: CImages.Planets[2],
//             x: 0,
//             y: config.map.height,
//         });
//         planetData.push({
//             image: CImages.Planets[3],
//             x: config.map.width,
//             y: 0,
//         });
//     }
// }
