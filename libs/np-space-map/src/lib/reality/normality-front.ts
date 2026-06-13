export interface FrontPoint {
    x: number;
    y: number;
}

export interface NormalityFrontConfig {
    /** Fixed anchor the sweep is measured from; node distances are projected relative to it. */
    origin: FrontPoint;
    /** Direction the front sweeps — toward still-distorted space. The grey lies on the opposite side. Need not be unit length. */
    axis: FrontPoint;
    /** Front offset at sector entry — behind every live node, so nothing starts greyed. */
    initialPosition: number;
    /** The front never sweeps past this, leaving a sliver of distorted space (the safe core). */
    maxPosition: number;
    /** How far the front advances along the axis on each jump. */
    step: number;
}

/**
 * The normality front, as plain geometry: a straight line sweeping in from one side (the Hush greying
 * the map "one layer at a time"). Everything behind the line — on the far side of the sweep axis — has
 * snapped back to mundane reality. The front advances one step per jump. This module is deliberately
 * Phaser-free so the swallow maths is unit-testable without booting a scene; the `Reality` game object
 * renders it as a diagonal veil.
 */
export class NormalityFront {
    readonly origin: FrontPoint;
    /** Unit sweep axis (the constructor normalises whatever vector it's given). */
    readonly axis: FrontPoint;
    readonly initialPosition: number;
    readonly maxPosition: number;
    readonly step: number;
    #position: number;

    constructor(config: NormalityFrontConfig) {
        this.origin = config.origin;
        this.axis = normalize(config.axis);
        this.initialPosition = config.initialPosition;
        this.maxPosition = config.maxPosition;
        this.step = config.step;
        this.#position = config.initialPosition;
    }

    /** How far the front has swept along the axis from the origin. */
    get position(): number {
        return this.#position;
    }

    /** 0 at sector entry, 1 when fully swept to the safe core — the "reality closing in" meter. */
    get closedFraction(): number {
        const span = this.maxPosition - this.initialPosition;
        if (span <= 0) return 1;
        return clamp((this.#position - this.initialPosition) / span, 0, 1);
    }

    /** Distance of a point along the sweep axis, relative to the origin. */
    #project(point: FrontPoint): number {
        return (point.x - this.origin.x) * this.axis.x + (point.y - this.origin.y) * this.axis.y;
    }

    /** A point is still in distorted space while it sits ahead of (or on) the advancing front. */
    contains(point: FrontPoint): boolean {
        return this.#project(point) >= this.#position;
    }

    /** Every point that has fallen behind the front (caller diffs against what it already knew). */
    swallowed<T extends FrontPoint>(points: T[]): T[] {
        return points.filter(point => !this.contains(point));
    }

    /** Sweep the front forward by `steps` jumps, clamped at the safe core. Returns the new position. */
    advance(steps = 1): number {
        this.#position = Math.min(this.maxPosition, this.#position + this.step * steps);
        return this.#position;
    }

    /** Distortion-battery pushback (§4): feed the distortion to push the front back, capped at entry. */
    pushFront(amount = this.step): number {
        this.#position = Math.max(this.initialPosition, this.#position - amount);
        return this.#position;
    }

    /**
     * Projection bounds of `points` onto `axis` from `origin`, expanded by `margin` on each side.
     * `{ min }` sits behind the rearmost node (front entry); `{ max }` sits ahead of the foremost.
     */
    static enclosingBounds(
        origin: FrontPoint,
        axis: FrontPoint,
        points: FrontPoint[],
        margin = 0
    ): { min: number; max: number } {
        const a = normalize(axis);
        const projections = points.map(p => (p.x - origin.x) * a.x + (p.y - origin.y) * a.y);
        return { min: Math.min(...projections) - margin, max: Math.max(...projections) + margin };
    }
}

// Local helpers so this module stays free of any Phaser import.
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalize = (v: FrontPoint): FrontPoint => {
    const length = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / length, y: v.y / length };
};
