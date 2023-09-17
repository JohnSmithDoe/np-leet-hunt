import { inject, Injectable } from '@angular/core';
import { PhaserService, SpaceScene } from '@shared/phaser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StageService {
    #phaser = inject(PhaserService);
    #initialized = new BehaviorSubject(false);
    initialized$ = this.#initialized.asObservable();

    startScene(sceneKey: string) {
        console.log('14:startScene-');
        this.#phaser.game.scene.add(sceneKey, new SpaceScene(this), true);
    }

    async initStage(stageContainer: HTMLElement) {
        console.log('init stage');
        await this.#phaser.init(stageContainer);
        this.#initialized.next(true);
    }

    destroyStage(): void {
        console.log('DESTROY GAME');
        this.#phaser.destroyActiveGame();
        this.#initialized.next(false);
    }
}
