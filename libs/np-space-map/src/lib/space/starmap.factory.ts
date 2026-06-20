import { poissonDiscSampler } from '@shared/np-phaser';
import * as Phaser from 'phaser';

export interface StarmapConfig {
    /** Inner travel-graph planets to keep (selected, well-spread, from the Poisson candidates). */
    planets: number;
    /** Rim boundary suns (bail-exits) to keep, spread around the rim. */
    exits: number;
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

/**
 * Greedily pick `count` of `points` that are maximally spread (farthest-point sampling): start from the
 * first point, then repeatedly add the candidate farthest from everything chosen so far. Deterministic,
 * and returns all points when there are fewer than `count`. This turns "planet count" / "exits" into a
 * real generation parameter while reusing the Poisson candidates' even spacing.
 */
const selectSpread = (points: Phaser.Types.Math.Vector2Like[], count: number): Phaser.Types.Math.Vector2Like[] => {
    if (count <= 0) return [];
    if (points.length <= count) return points;
    const dist2 = (a: Phaser.Types.Math.Vector2Like, b: Phaser.Types.Math.Vector2Like) =>
        (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    const chosen: Phaser.Types.Math.Vector2Like[] = [points[0]];
    while (chosen.length < count) {
        let best = points[0];
        let bestDistance = -1;
        for (const point of points) {
            if (chosen.includes(point)) continue;
            const nearest = Math.min(...chosen.map(c => dist2(c, point)));
            if (nearest > bestDistance) {
                bestDistance = nearest;
                best = point;
            }
        }
        chosen.push(best);
    }
    return chosen;
};

export class StarmapFactory {
    static create(config: StarmapConfig) {
        const planetCandidates = poissonDiscSampler(
            config.width,
            config.height,
            config.minDistance,
            config.maxDistance
        );
        const map: Starmap = {
            ...config,
            coords: {
                planets: selectSpread(planetCandidates, config.planets),
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
            const outerCandidates = poissonDiscSampler(w, h, config.minDistance * 2, undefined, (p: number[]) => {
                const x = p[0];
                const y = p[1];
                return inner.contains(x, y) ? 0 : 1;
            })
                .filter(p => !inner.contains(p.x, p.y))
                .map(p => p.setTo(p.x - config.outerSpaceDim, p.y - config.outerSpaceDim));
            map.coords.outerSpace = selectSpread(outerCandidates, config.exits);
        }

        return map;
    }
}
