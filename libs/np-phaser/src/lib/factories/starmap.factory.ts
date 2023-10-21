import { poissonDiscSampler } from '../utilities/np-phaser-utils';

export interface StarmapConfig {
    planets: number;
    width: number;
    height: number;
    minDistance: number;
    maxDistance?: number;
}

export class StarmapFactory {
    static create(config: StarmapConfig) {
        const map = {
            ...config,
            coords: {
                planets: [],
            },
        };
        const points = poissonDiscSampler(map.width, map.height, map.minDistance, map.maxDistance);
        console.log(points);

        map.coords.planets.push(...points);
        return map;
    }
}
