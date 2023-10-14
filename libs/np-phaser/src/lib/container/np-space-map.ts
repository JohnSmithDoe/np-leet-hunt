import { NPSceneComponent, NPSceneContainer } from '../scenes/np-scene-component';
import { Planet } from '../sprites/planet/planet';
import { Space } from '../sprites/space/space';

export class NPSpaceMap extends NPSceneContainer<NPSceneComponent> {
    init = () => {
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 1, 'bg');
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 2, 'fg');
        console.log('add a planet');
        this.addSpace();
        this.addPlanet();
        super.init();
    };

    private addPlanet() {
        const planet = new Planet(this.scene, 'planetBlue');
        this.add(planet);
    }
    private addSpace() {
        const space = new Space(this.scene, 'space4');
        this.add(space);
    }
}
