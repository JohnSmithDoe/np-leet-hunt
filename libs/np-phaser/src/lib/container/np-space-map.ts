import { StarmapFactory } from '../factories/starmap.factory';
import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { DashedLine } from '../sprites/dashed-line/dashed-line';
import { Planet } from '../sprites/planet/planet';
import { Space } from '../sprites/space/space';
import { getClosest } from '../utilities/np-phaser-utils';

export class NPSpaceMap extends NPSceneContainer<NPSceneComponent> {
    init = () => {
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 1, 'bg');
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 2, 'fg');
        console.log('add a planet');
        this.addSpace();
        const map = StarmapFactory.create({ planets: 12, width: 15000, height: 15000, minDistance: 1750 });
        this.scene.debugOut(`planets ${map.planets} points ${map.coords.planets.length}`);
        for (const coords of map.coords.planets) {
            const closest = getClosest(coords, map.coords.planets);
            for (const target of closest) {
                const line = new DashedLine(this.scene, 'dashedLineRed', coords, target);
                this.add(line);
            }
        }
        for (const coords of map.coords.planets) {
            this.addPlanet(coords);
        }
        super.init();
    };

    private addPlanet(coords: { x; y }) {
        const type = Planet.getRandom();
        const planet = new Planet(this.scene, type);
        planet.setPosition(coords.x, coords.y);
        this.add(planet);
    }

    private addSpace() {
        const type = Space.getRandom();
        const space = new Space(this.scene, type);
        this.add(space);
    }
}
