import { Subject } from 'rxjs';

export class StateMachine {
    private noopSignal = new Subject<string>();
    private currentState: Subject<string>;
    private currentName: string;
    private nextState: Subject<string>;
    private nextName: string;
    private states: { [key: string]: Subject<string> } = {};
    private lastState: Subject<string>;
    private lastName: string;
    private hasChanged: boolean = false;
    private _timer: number;
    private frameCount: number;

    constructor() {
        this.currentState = this.noopSignal;
    }

    private sanatizeStateName(name: string | number): string {
        return typeof name === 'string' ? name : 'state' + name.toString();
    }

    protected addState(name: string | number, updatefn: (state: string) => void): this {
        name = this.sanatizeStateName(name);
        this.states[name] = new Subject<string>();
        this.states[name].subscribe(updatefn);
        return this;
    }

    protected setState(state: string | number): void {
        this.currentName = this.sanatizeStateName(state);
        this.currentState = this.states[this.currentName] || this.noopSignal;
    }

    protected setNextState(state: string | number): void {
        this.nextName = this.sanatizeStateName(state);
        this.nextState = this.states[this.nextName] || this.noopSignal;
    }

    protected advanceState(): boolean {
        const hasNext: boolean = !!this.nextState;
        if (hasNext) {
            this.setState(this.nextName);
            this.nextState = null;
            this.nextName = null;
        }
        return hasNext;
    }

    protected advanceStateOrWait(signal?: Subject<string>, state?: string): void {
        if (signal) {
            signal.next(state);
        }
        if (!this.advanceState()) {
            this.wait();
        }
    }

    protected wait(signal?: Subject<string>, state?: string): void {
        this.currentState = this.noopSignal;
        this.currentName = null;
        if (signal) {
            signal.next(state);
        }
    }

    isWaiting(): boolean {
        return this.currentState === this.noopSignal && this.currentName === null;
    }

    update(): void {
        this.lastState = this.currentState;
        this.lastName = this.currentName;
        this.currentState.next(this.currentName);
        this.hasChanged = this.lastName !== this.currentName;
    }

    isState(name: string | number): boolean {
        name = this.sanatizeStateName(name);
        return this.currentName === name;
    }

    hasStateChanged(): boolean {
        return this.hasChanged;
    }

    waitFor(time: number): boolean {
        if (!this._timer) {
            this._timer = Date.now();
        }
        const waitedLongEnough: boolean = Date.now() - this._timer >= time;
        if (waitedLongEnough) {
            this.resetWait();
        }
        return waitedLongEnough;
    }

    protected resetWait(): void {
        this._timer = undefined;
    }

    _incrementFrameCount(): void {
        this.frameCount++;
        if (this.frameCount === Number.MAX_SAFE_INTEGER) {
            this.frameCount = 0;
        }
    }
}
