import * as Phaser from 'phaser';
import PoissonDiskSampling from 'poisson-disk-sampling';

export const isLayer = (value: unknown): value is Phaser.GameObjects.Layer => value instanceof Phaser.GameObjects.Layer;

export const vectorToStr = (vector: Phaser.Math.Vector2) => `(${vector.x}, ${vector.y})`;

export const maxDistance = (width: number, height: number, k: number) => Math.sqrt((width * height) / k);

// Poisson disk sampling in a 2D square
export const poissonDiscSampler = (width: number, height: number, minRadius: number, maxRadius?: number) => {
    const pds = new PoissonDiskSampling({
        shape: [width, height],
        minDistance: minRadius,
        maxDistance: maxRadius,
        tries: 10,
    });
    return pds.fill().map(p => new Phaser.Geom.Point(p[0], p[1]));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const distributePointsInRectangle = (n, w, h) => {
    const points: { x: number; y: number }[] = [];

    // Calculate the minimum distance between points
    const minDistance = Math.sqrt((w * h) / n) / 2;
    console.log(minDistance);

    points.push({ x: Math.random() * w, y: Math.random() * h });

    for (let i = 0; i < n; i++) {
        // Generate random positions for each point, while ensuring they are at least minDistance apart
        let x;
        let y;
        let allSpaced = false;
        let count = 0;
        do {
            count++;
            x = Math.random() * w;
            y = Math.random() * h;
            allSpaced = points.every(point => {
                console.log(Math.hypot(point.x - x, point.y - y), point, x, y);

                return Math.hypot(point.x - x, point.y - y) > minDistance;
            });
            console.log(allSpaced);
        } while (!allSpaced || count > 100);
        console.log(count > 99 ? 'not found' : count);

        points.push({ x, y });
        console.log(points);
    }

    return points;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const distributePointsInRectangle2 = (n, w, h) => {
    const points: { x: number; y: number }[] = [];

    // Calculate the number of rows and columns in the grid
    const numRows = Math.floor(Math.sqrt(n * (h / w)));
    const numCols = Math.ceil(n / numRows);

    // Calculate the horizontal and vertical spacing between points
    const dx = w / numCols;
    const dy = h / numRows;

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (points.length < n) {
                const x = j * dx + dx / 2;
                const y = i * dy + dy / 2;
                points.push({ x, y });
            }
        }
    }

    return points;
};
