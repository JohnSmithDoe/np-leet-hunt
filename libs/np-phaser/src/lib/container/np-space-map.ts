import { StarmapFactory } from '../factories/starmap.factory';
import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { Planet } from '../sprites/planet/planet';
import { Space } from '../sprites/space/space';

export class NPSpaceMap extends NPSceneContainer<NPSceneComponent> {
    init = () => {
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 1, 'bg');
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 2, 'fg');
        console.log('add a planet');
        this.addSpace();
        const map = StarmapFactory.create({ planets: 12, width: 5000, height: 5000 });
        for (const coords of map.coords.planets) {
            console.log(coords);

            this.addPlanet(coords);
        }
        super.init();
    };

    private addPlanet(coords: { x; y }) {
        const planet = new Planet(this.scene, 'planet4');
        planet.setPosition(coords.x, coords.y);
        this.add(planet);
    }

    private addSpace() {
        const space = new Space(this.scene, 'space4');
        this.add(space);
    }
}
