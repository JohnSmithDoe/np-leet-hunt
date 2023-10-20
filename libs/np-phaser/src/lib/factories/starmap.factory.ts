import PoissonDiskSampling from 'poisson-disk-sampling';

export interface StarmapConfig {
    planets: number;
    width: number;
    height: number;
}

export class StarmapFactory {
    static create(config: StarmapConfig) {
        const map = {
            ...config,
            coords: {
                planets: [],
            },
        };
        const points = StarmapFactory.poissonDiscSampler(map.width, map.height, 20, 20);
        console.log(points);

        //map.coords.planets.push(...StarmapFactory.distributePointsInRectangle(map.planets, map.width, map.height));
        map.coords.planets.push(...points);
        return map;
    }

    static distributePointsInRectangle(n, w, h) {
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
    }

    static distributePointsInRectangle2(n, w, h) {
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
    }

    static poissonDiscSampler(width: number, height: number, radius: number, k: number = 30) {
        // Poisson disk sampling in a 2D square
        const minDistance = Math.sqrt((width * height) / k);
        const pds = new PoissonDiskSampling({
            shape: [width, height],
            minDistance,
            // maxDistance: minDistance,
            tries: 10,
        });
        console.log(pds);
        return pds.fill().map(p => new Phaser.Geom.Point(p[0], p[1]));
    }
}
