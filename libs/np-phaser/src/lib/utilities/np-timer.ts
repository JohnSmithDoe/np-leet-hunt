export class NPTimer {
    #timer: number;

    waitFor(time: number): boolean {
        if (!this.#timer) {
            this.#timer = Date.now();
        }
        const waitedLongEnough: boolean = Date.now() - this.#timer >= time;
        if (waitedLongEnough) {
            this.#resetWait();
        }
        return waitedLongEnough;
    }

    #resetWait(): void {
        this.#timer = undefined;
    }
}
