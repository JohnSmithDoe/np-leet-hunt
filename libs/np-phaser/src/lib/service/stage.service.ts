import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

import { NPScene } from '../scenes/np-scene';
import { PhaserService } from './phaser.service';

@Injectable({
    providedIn: 'root',
})
export class StageService {
    #phaser = inject(PhaserService);
    #initialized = new BehaviorSubject(false);
    initialized$ = this.#initialized.asObservable();

    startScene(sceneKey: string, scene: NPScene) {
        console.log('14:startScene-');
        this.#phaser.game.scene.add(sceneKey, scene, true);
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
