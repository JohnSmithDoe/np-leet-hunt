// eslint-disable-next-line import/no-cycle
import { NPScene } from './np-scene';

export interface NPBaseComponent {
    scene: NPScene;

    init?(): void;
}

export interface NPSceneComponent extends NPBaseComponent {
    preload?(): void;

    create?(): void;

    update?(time: number, delta: number): void;
}
