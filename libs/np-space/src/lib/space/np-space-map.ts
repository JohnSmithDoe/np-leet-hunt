import { createRectangle } from '../../../../np-phaser/src/lib/factories/graphics.factory';
import { NPSceneComponent, NPSceneContainer } from '../../../../np-phaser/src/lib/scenes/np-scene-component';
import { DashedLine } from '../../../../np-phaser/src/lib/sprites/dashed-line/dashed-line';
import { getClosest } from '../../../../np-phaser/src/lib/utilities/np-phaser-utils';
import { Planet } from '../planet/planet';
import { Space } from './space';
import { StarmapFactory } from './starmap.factory';

export class NPSpaceMap extends NPSceneContainer<NPSceneComponent> {
    init = () => {
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 1, 'bg');
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 2, 'fg');
        console.log('add a planet');
        this.addSpace();
        const map = StarmapFactory.create({
            planets: 12,
            width: 15000,
            height: 15000,
            minDistance: 1750,
            outerSpaceDim: 5000,
        });
        const rectInner = createRectangle(this.scene, map.inner);
        const rectMap = createRectangle(this.scene, new Phaser.Geom.Rectangle(0, 0, map.width, map.height));
        const rectOuter = createRectangle(
            this.scene,
            new Phaser.Geom.Rectangle(-5000, -5000, map.width + 10e3, map.height + 10e3)
        );
        this.scene.addToLayer('np', rectInner);
        this.scene.addToLayer('np', rectMap);
        this.scene.addToLayer('np', rectOuter);
        this.scene.debugOut(`planets ${map.coords.planets.length}`);
        const vector2Likes = [...map.coords.planets, ...map.coords.outerSpace];
        for (const coords of vector2Likes) {
            const connections = map.coords.outerSpace.includes(coords) ? 2 : 3;
            const closest = getClosest(coords, vector2Likes, connections);
            for (const target of closest) {
                const line = new DashedLine(this.scene, 'dashedLineRed', coords, target);
                this.add(line);
            }
        }
        for (const coords of map.coords.planets) {
            this.addPlanet(coords);
        }
        for (const coords of map.coords.outerSpace) {
            const planet = new Planet(this.scene, 'planetSun');
            planet.setPosition(coords.x, coords.y).setScale(6);
            this.add(planet);
        }
        super.init();
    };

    private addPlanet(coords: Phaser.Types.Math.Vector2Like) {
        const type = Planet.getRandom();
        const planet = new Planet(this.scene, type);
        planet.setPosition(coords.x, coords.y);
        this.add(planet);
    }

    private addSpace() {
        const space = new Space(this.scene, Space.getRandom());
        this.add(space);
    }
}
