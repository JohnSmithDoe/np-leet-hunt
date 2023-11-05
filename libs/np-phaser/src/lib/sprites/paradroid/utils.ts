export class Utils {
    public static readonly PIQuart: number = Math.PI / 4;
    public static readonly PIHalf: number = Math.PI / 2;
    public static readonly PI: number = Math.PI;
    public static readonly PIAndAHalf: number = Math.PI / 2 + Math.PI;
    public static readonly PIDouble: number = Math.PI * 2;
    public static readonly OneDegInRad: number = Utils.PIDouble / 360;
    public static readonly DIR_RIGHT: number = Utils.PIHalf;
    public static readonly DIR_LEFT: number = Utils.PI + Utils.PIHalf;
    public static readonly DIR_UP: number = 0;
    public static readonly DIR_DOWN: number = Utils.PI;

    // Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
    // Output: [1, 2, 3, 101, 10]
    public static mergeArrays<T extends unknown[]>(...arr: T[]): unknown[] {
        return [...new Set<T>([].concat(...arr))];
    }

    static rngElement<T>(array: T[]): T {
        return array[Utils.rng(array.length - 1)];
    }

    static rngElementDict<T>(array: T[]): T {
        const tmp: T[] = [];
        array.forEach((item: T): void => {
            tmp.push(item);
        });
        return tmp[Utils.rng(tmp.length - 1)];
    }

    /**
     * Returns a random integer between start (inclusive) and end (inclusive)
     * If end is not given start is 0
     */
    public static rng(start: number, end?: number): number {
        const range: number = end ? end - start + 1 : start + 1;
        return Math.floor(Math.random() * range) + (end ? start : 0);
    }

    /**
     * If a random (100) is smaller then the given percentage this returns true
     *
     * @param percent
     * @return
     */
    static rngPercentageHit(percent: number): boolean {
        return Utils.rng(100) <= percent;
    }
}

/**
 * Returns a random integer between start (inclusive) and end (inclusive)
 * If end is not given start is 0
 */
export const rng = (start: number, end?: number) => {
    const range: number = end ? end - start + 1 : start + 1;
    return Math.floor(Math.random() * range) + (end ? start : 0);
};
/**
 * Returns if a 100 percent roll is lower than the given percentage
 */
export const rngPercentageHit = (percent: number) => rng(100) <= percent;
