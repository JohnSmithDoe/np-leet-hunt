export const PI: number = Math.PI;
export const PIQuart: number = Math.PI / 4;
export const PIHalf: number = Math.PI / 2;
export const PIAndAHalf: number = Math.PI / 2 + Math.PI;
export const PIDouble: number = Math.PI * 2;
export const OneDegInRad: number = PIDouble / 360;

// Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
// Output: [1, 2, 3, 101, 10]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mergeArrays = <T extends any[]>(...arr: T[]): any[] => [...new Set<T>([].concat(...arr))];

/**
 * Returns a random integer between start (inclusive) and end (inclusive)
 * If end is not given start is 0
 */
export const rng = (start: number, end?: number) => {
    const range: number = end ? end - start + 1 : start + 1;
    return Math.floor(Math.random() * range) + (end ? start : 0);
};
/**
 * Returns a random element from the array
 */
export const rngElement = <T>(array: T[]): T => array[rng(array.length - 1)];
/**
 * Returns a random element from the dictionary
 */
export const rngElementDict = <T>(dict: Record<never, T>): T => rngElement(Object.values(dict));

/**
 * Returns if a 100 percent roll is lower than the given percentage
 */
export const rngPercentageHit = (percent: number) => rng(100) <= percent;
