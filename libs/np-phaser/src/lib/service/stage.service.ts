import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, take, tap } from 'rxjs';

import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
import { NPScene } from '../scenes/np-scene';
import { PhaserService } from './phaser.service';

export interface NPSceneEntry {
    key: string;
    scene: NPScene;
    /**
     * `true`  — the scene is kept on leave (slept: no update, no render) and resumed with its full
     *           state on return. Use for the persistent overworld (the space map scenes).
     * `false` / omitted — the scene is removed on leave and rebuilt fresh on the next entry.
     *           Use for transient modes (a Paradroid fight, a dungeon run).
     */
    persistent?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class StageService {
    #phaser = inject(PhaserService);
    #initialized = new BehaviorSubject(false);
    initialized$ = this.#initialized.asObservable();
    #active: NPSceneEntry[] = [];
    #switching = false;

    public get phaser(): PhaserService {
        return this.#phaser;
    }

    /**
     * Switch the visible mode to the given scene(s). The current mode fades to black first, then
     * persistent scenes are slept (state kept) and transient ones removed; the new scenes are woken
     * (if a persistent one was slept earlier) or added fresh. Pass several entries for a multi-scene
     * mode (e.g. the three space scenes). Only one mode is awake/visible at a time.
     */
    startScene(...entries: NPSceneEntry[]) {
        const nextKeys = entries.map(entry => entry.key);
        if (this.#isCurrent(nextKeys) || this.#switching) return;

        this.#switching = true;
        this.#fadeOutCurrent()
            .pipe(take(1))
            .subscribe(() => {
                // Leave the current mode: keep persistent scenes alive, drop transient ones.
                this.#active.forEach(({ key, persistent }) =>
                    persistent ? this.#phaser.game.scene.sleep(key) : this.#phaser.game.scene.remove(key)
                );
                this.#active = entries;
                // Enter the next mode: a slept persistent scene still exists → wake + fade it back in;
                // otherwise add + start it fresh (NPScene.create fades itself in). Order = render order.
                entries.forEach(({ key, scene }) => {
                    if (this.#phaser.game.scene.getScene(key)) {
                        this.#phaser.game.scene.wake(key);
                        this.#fadeIn(key);
                    } else {
                        this.#phaser.game.scene.add(key, scene, true);
                    }
                });
                this.#switching = false;
            });
    }

    /**
     * Run `apply` between a fade-out and fade-in of the active scenes — without swapping, restarting, or
     * removing them. Use to mutate the *content* of the live persistent mode (e.g. rebuild the map for
     * the next sector): the scenes keep running, so their input, cameras, and cached textures stay intact
     * across the change. `apply` performs the rebuild; this only owns the transition.
     */
    fadeTransition(apply: () => void) {
        if (this.#switching) return;
        this.#switching = true;
        this.#fadeOutCurrent()
            .pipe(take(1))
            .subscribe(() => {
                apply();
                this.#active.forEach(({ key }) => this.#fadeIn(key));
                this.#switching = false;
            });
    }

    initStage(stageContainer: HTMLElement) {
        return this.#phaser.init(stageContainer).pipe(tap(isReady => this.#initialized.next(isReady)));
    }

    destroyStage(): void {
        this.#phaser.destroyActiveGame();
    }

    /** True when the requested keys are exactly the mode already on stage (order-independent). */
    #isCurrent(keys: string[]): boolean {
        return keys.length === this.#active.length && keys.every(key => this.#active.some(entry => entry.key === key));
    }

    /** Fades every camera of every active scene to black; completes once all fades finish. */
    #fadeOutCurrent(): Observable<unknown> {
        const fades = this.#active
            .map(({ key }) => this.#phaser.game.scene.getScene(key) as NPScene | null)
            .filter((scene): scene is NPScene => !!scene)
            .flatMap(scene =>
                scene.cameras.cameras.map(
                    cam =>
                        new Observable(sub => {
                            cam.fade(1000, 0, 0, 0, false, (_cam: NPFullscreenCamera, percent: number) => {
                                if (percent === 1) {
                                    sub.next(true);
                                    sub.complete();
                                }
                            });
                        })
                )
            );
        return fades.length ? forkJoin(fades) : of(true);
    }

    /** Fades a freshly woken scene's cameras back in from black (wake does not re-run create). */
    #fadeIn(key: string) {
        const scene = this.#phaser.game.scene.getScene(key) as NPScene | null;
        scene?.cameras.cameras.forEach(cam => cam.fadeIn(1000, 0, 0, 0));
    }
}
