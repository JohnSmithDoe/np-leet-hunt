import * as Phaser from 'phaser';

import { poissonDiscSampler } from '../../../../np-phaser/src/lib/utilities/np-phaser-utils';

export interface StarmapConfig {
    planets: number;
    width: number;
    height: number;
    outerSpaceDim: number;
    minDistance: number;
    maxDistance?: number;
}

export interface Starmap {
    inner?: Phaser.Geom.Rectangle;
    width: number;
    height: number;
    coords: {
        planets: Phaser.Types.Math.Vector2Like[];
        outerSpace: Phaser.Types.Math.Vector2Like[];
        start: Phaser.Types.Math.Vector2Like;
        end: Phaser.Types.Math.Vector2Like;
    };
}

export class StarmapFactory {
    static create(config: StarmapConfig) {
        const map: Starmap = {
            ...config,
            coords: {
                planets: poissonDiscSampler(config.width, config.height, config.minDistance, config.maxDistance),
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 },
                outerSpace: [],
            },
        };
        if (config.outerSpaceDim > 0) {
            const w = config.outerSpaceDim + config.width + config.outerSpaceDim;
            const h = config.outerSpaceDim + config.height + config.outerSpaceDim;
            const inner = new Phaser.Geom.Rectangle(
                config.outerSpaceDim - config.minDistance,
                config.outerSpaceDim - config.minDistance,
                config.width + 2 * config.minDistance,
                config.height + 2 * config.minDistance
            );
            map.inner = new Phaser.Geom.Rectangle(
                -config.minDistance,
                -config.minDistance,
                config.width + 2 * config.minDistance,
                config.height + 2 * config.minDistance
            );
            map.coords.outerSpace = poissonDiscSampler(w, h, config.minDistance * 2, undefined, (p: number[]) => {
                const x = p[0];
                const y = p[1];
                return inner.contains(x, y) ? 0 : 1;
            })
                .filter(p => !inner.contains(p.x, p.y))
                .map(p => p.setTo(p.x - config.outerSpaceDim, p.y - config.outerSpaceDim));
        }

        return map;
    }
}
