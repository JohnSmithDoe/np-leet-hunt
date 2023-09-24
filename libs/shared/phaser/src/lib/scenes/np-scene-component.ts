// eslint-disable-next-line import/no-cycle
import { NPScene } from './np-scene';

export class NPSceneComponent {
    protected constructor(protected scene: NPScene) {}

    init?(): void;

    preload?(): void;

    create?(): void;

    update?(time: number, delta: number): void;
}
