import Rand from 'rand-seed';

// The Random Number God: deliverer of good and ill fortune alike.
// https://github.com/munificent/piecemeal
export class NPRng {
    readonly #rand: Rand;
    readonly #seed: string;

    constructor(seed: string) {
        this.#seed = seed;
        this.#rand = new Rand(this.#seed);
    }

    /**
     * Returns a random integer between start (inclusive) and end (inclusive)
     * If end is not given start is 0
     */
    rng = (start: number, end?: number) => {
        const range: number = end ? end - start + 1 : start + 1;
        return Math.floor(this.#rand.next() * range) + (end ? start : 0);
    };

    range(minOrMax: number, max?: number) {
        if (!max) {
            max = minOrMax;
            minOrMax = 0;
        }
        return this.rng(max - minOrMax) + minOrMax;
    }

    /// Gets a random int within a given range. If [max] is given, then it is
    /// in the range `[minOrMax, max]`. Otherwise, it is `[0, minOrMax]`. In
    /// other words, `inclusive(2)` returns a `0`, `1`, or `2`, and
    /// `inclusive(2, 4)` returns `2`, `3`, or `4`.
    inclusive(minOrMax: number, max?: number) {
        if (!max) {
            max = minOrMax;
            minOrMax = 0;
        }
        max++;
        return this.rng(max - minOrMax) + minOrMax;
    }

    /// Calculate a random number with a normal distribution.
    ///
    /// Note that this means results may be less than -1.0 or greater than 1.0.
    ///
    /// Uses https://en.wikipedia.org/wiki/Marsaglia_polar_method.
    normal() {
        let u: number;
        let v: number;
        let lengthSquared: number;
        do {
            u = this.#rand.next() * 2 - 1; // -1 , 1
            v = this.#rand.next() * 2 - 1; // -1 , 1
            lengthSquared = u * u + v * v;
        } while (lengthSquared >= 1.0);

        return u * Math.sqrt((-2.0 * Math.log(lengthSquared)) / lengthSquared);
    }

    /// Returns `true` if a random int chosen between 1 and chance was 1.
    oneIn(chance: number) {
        return this.range(chance) === 0;
    }

    /// Returns `true` [chance] percent of the time.
    percent(chance: number) {
        return this.range(100) < chance;
    }

    /// Rounds [value] to a nearby integer, randomly rounding up or down based
    /// on the fractional value.
    ///
    /// For example, `round(3.2)` has a 20% chance of returning 3, and an 80%
    /// chance of returning 4.
    round(value: number) {
        let result = Math.floor(value);
        if (value - result > 1.0) result++;
        return result;
    }

    /**
     * Returns a random element from the array
     */
    item<T>(array: T[]): T {
        return array[this.rng(array.length - 1)];
    }

    /**
     * Returns a random element from the array and removes it
     */
    spliceOne<T>(array: T[]): T {
        const idx = this.rng(array.length - 1);
        return array.splice(idx, 1).pop();
    }

    /**
     * Returns a random element from the dictionary
     */
    itemFromDict<T>(dict: Record<never, T>): T {
        return this.item(Object.values(dict));
    }

    /**
     * Returns if a 100 percent roll is lower than the given percentage
     */
    percentageHit(percent: number) {
        return this.rng(100) <= percent;
    }
}

// Global random generator
export const npRng = new NPRng(`${Date.now()}`);
