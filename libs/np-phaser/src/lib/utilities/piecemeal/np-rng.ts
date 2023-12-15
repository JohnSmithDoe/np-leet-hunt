import * as Phaser from 'phaser';

// The Random Number God: deliverer of good and ill fortune alike.
// https://github.com/munificent/piecemeal
export class NPRng {
    readonly #seed: string;
    readonly #rng: Phaser.Math.RandomDataGenerator;

    constructor(seed: string) {
        this.#seed = seed;
        this.#rng = new Phaser.Math.RandomDataGenerator(this.#seed);
        this.#rng.sow([this.#seed]);
    }

    /**
     * Returns a random integer between start (inclusive) and end (inclusive)
     * If end is not given start is 0
     */
    inRange(minOrMax: number, max?: number) {
        if (!max) {
            max = minOrMax;
            minOrMax = 0;
        }
        return this.#rng.integerInRange(minOrMax, max);
    }

    /// Returns `true` if a random int chosen between 1 and chance was 1.
    oneIn(chance: number) {
        return this.inRange(chance) === 0;
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
        return array[this.inRange(array.length - 1)];
    }

    /**
     * Returns a random element from the array and removes it
     */
    spliceOne<T>(array: T[]): T {
        const idx = this.inRange(array.length - 1);
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
        return this.inRange(100) <= percent;
    }

    reset() {
        this.#rng.sow([`${Date.now()}`]);
    }
}

// Global random generator
export const NPRNG = new NPRng(`${Date.now()}`);
