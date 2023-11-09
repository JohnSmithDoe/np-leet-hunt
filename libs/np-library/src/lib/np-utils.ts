export const PI: number = Math.PI;
export const PIQuart: number = Math.PI / 4;
export const PIHalf: number = Math.PI / 2;
export const PIAndAHalf: number = Math.PI / 2 + Math.PI;
export const PIDouble: number = Math.PI * 2;
export const OneDegInRad: number = PIDouble / 360;

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

// Rainbow logging
export const nyanConsole = (message: string) => {
    console.log(
        '%c ' + message,
        'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113); margin-bottom: 12px; padding: 25px'
    );
};
