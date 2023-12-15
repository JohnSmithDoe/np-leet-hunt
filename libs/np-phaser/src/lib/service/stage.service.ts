import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
import { NPScene } from '../scenes/np-scene';
import { PhaserService } from './phaser.service';

@Injectable({
    providedIn: 'root',
})
export class StageService {
    #phaser = inject(PhaserService);
    #initialized = new BehaviorSubject(false);
    initialized$ = this.#initialized.asObservable();
    #current: NPScene;
    #currentKey: string;

    public get phaser(): PhaserService {
        return this.#phaser;
    }

    startScene(key: string, scene: NPScene) {
        console.log('14:startScene-');
        if (key === this.#currentKey) return;
        this.phaser.game.scene.dump();
        if (this.#current) {
            new Observable(sub => {
                this.#current.cameras.cameras.forEach(cam => {
                    cam.fade(1000, 0, 0, 0, false, (cama: NPFullscreenCamera, percent: number) => {
                        if (percent === 1) {
                            sub.next(true);
                            sub.complete();
                        }
                    });
                });
            })
                .pipe(take(1))
                .subscribe(() => {
                    console.log('fade done remove scene', this.#currentKey);
                    // this.#phaser.game.scene.stop(this.#currentKey);
                    this.#phaser.game.scene.remove(this.#currentKey);
                    this.#phaser.game.scene.dump();

                    this.#current = null;
                    this.startScene(key, scene);
                });
        } else {
            this.#current = scene;
            this.#currentKey = key;
            console.log(this.#currentKey);
            this.#phaser.game.scene.dump();
            console.log(this.phaser.game.scene.getScenes());
            this.#phaser.game.scene.add(this.#currentKey, scene, true);
        }
    }

    initStage(stageContainer: HTMLElement) {
        console.log('init stage');
        return this.#phaser.init(stageContainer).pipe(tap(isReady => this.#initialized.next(isReady)));
    }

    destroyStage(): void {
        console.log('DESTROY GAME');
        this.#phaser.destroyActiveGame();
    }
}
