export interface FrontPoint {
    x: number;
    y: number;
}

export interface NormalityFrontConfig {
    /** Where the bubble of still-distorted space collapses toward. */
    center: FrontPoint;
    /** Radius at sector entry — large enough to enclose every live node. */
    initialRadius: number;
    /** How far the radius shrinks on each jump (the front advances only on jumps). */
    step: number;
    /** The radius never shrinks below this — the shrinking safe core. */
    minRadius: number;
}

/**
 * The normality front, as plain geometry: a circle of still-distorted space that collapses inward
 * one step per jump. Everything outside the circle has snapped back to mundane reality. This module
 * is deliberately Phaser-free so the swallow maths is unit-testable without booting a scene; the
 * `Reality` game object renders it.
 */
export class NormalityFront {
    readonly center: FrontPoint;
    readonly initialRadius: number;
    readonly step: number;
    readonly minRadius: number;
    #radius: number;

    constructor(config: NormalityFrontConfig) {
        this.center = config.center;
        this.initialRadius = config.initialRadius;
        this.step = config.step;
        this.minRadius = config.minRadius;
        this.#radius = config.initialRadius;
    }

    get radius(): number {
        return this.#radius;
    }

    /** 0 at sector entry, 1 when fully collapsed to the core — the "reality closing in" meter. */
    get closedFraction(): number {
        const span = this.initialRadius - this.minRadius;
        if (span <= 0) return 1;
        return clamp((this.initialRadius - this.#radius) / span, 0, 1);
    }

    /** A point is still in distorted space while it sits inside (or on) the bubble. */
    contains(point: FrontPoint): boolean {
        return Math.hypot(point.x - this.center.x, point.y - this.center.y) <= this.#radius;
    }

    /** Every point that has fallen outside the bubble (caller diffs against what it already knew). */
    swallowed<T extends FrontPoint>(points: T[]): T[] {
        return points.filter(point => !this.contains(point));
    }

    /** Collapse the front inward by `steps` jumps, clamped at the safe core. Returns the new radius. */
    advance(steps = 1): number {
        this.#radius = Math.max(this.minRadius, this.#radius - this.step * steps);
        return this.#radius;
    }

    /** Distortion-battery pushback (§4): feed the distortion to grow the bubble back, capped at entry. */
    pushFront(amount = this.step): number {
        this.#radius = Math.min(this.initialRadius, this.#radius + amount);
        return this.#radius;
    }

    /** Smallest radius around `center` that still encloses every point, plus a margin. */
    static enclosingRadius(center: FrontPoint, points: FrontPoint[], margin = 0): number {
        const max = points.reduce((m, p) => Math.max(m, Math.hypot(p.x - center.x, p.y - center.y)), 0);
        return max + margin;
    }
}

// Local clamp so this module stays free of any Phaser import.
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
