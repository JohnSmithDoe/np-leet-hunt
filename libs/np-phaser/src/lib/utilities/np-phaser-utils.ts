import * as Phaser from 'phaser';
import PoissonDiskSampling from 'poisson-disk-sampling';

export const isLayer = (value: unknown): value is Phaser.GameObjects.Layer => value instanceof Phaser.GameObjects.Layer;

export const vectorToStr = (vector: Phaser.Math.Vector2) => `(${vector.x}, ${vector.y})`;

export const maxDistance = (width: number, height: number, k: number) => Math.sqrt((width * height) / k);

export const pointOnAngle = (point: Phaser.Types.Math.Vector2Like, angle: number, distance: number) =>
    Phaser.Math.RotateTo(new Phaser.Math.Vector2(), point.x, point.y, angle, distance);

export const getClosest = <T extends Phaser.Types.Math.Vector2Like>(
    target: Phaser.Types.Math.Vector2Like,
    list: T[],
    maxCount = 3
): { x: number; y: number; item: T; distance: number }[] =>
    list
        .map(p => ({ x: p.x, y: p.y, item: p, distance: Phaser.Math.Distance.BetweenPoints(target, p) }))
        .sort((a, b) => a.distance - b.distance)
        .filter(p => p.item !== target)
        .slice(0, maxCount);

/**
 * Random points scattered inside a `width` × `height` rectangle, kept at least `minSpacing` apart
 * (Poisson-disc / "blue-noise" sampling). The result looks naturally spread — random, but with no
 * clumping and no gaps — which is why it's used to place planets/stars on the star map.
 *
 * @param minSpacing minimum distance allowed between any two points
 * @param maxSpacing optional upper bound on spacing between neighbouring points
 * @param distanceFunction optional 0..1 weight per candidate to bias local density
 */
export const scatterPointsInArea = (
    width: number,
    height: number,
    minSpacing: number,
    maxSpacing?: number,
    distanceFunction?: (point: number[]) => number
): Phaser.Math.Vector2[] =>
    new PoissonDiskSampling({
        shape: [width, height],
        minDistance: minSpacing,
        maxDistance: maxSpacing,
        tries: 10,
        distanceFunction,
    })
        .fill()
        .map(point => new Phaser.Math.Vector2(point[0], point[1]));
