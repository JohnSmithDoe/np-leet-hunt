import { Component, inject, OnInit } from '@angular/core';
import { NPBaseSubscriber } from '@shared/np-library';
import { StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { filter } from 'rxjs';

import { NPScene } from '../../../../../libs/np-phaser/src/lib/scenes/np-scene';

@Component({
    selector: 'np-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePageComponent extends NPBaseSubscriber implements OnInit {
    #stage = inject(StageService);

    async ngOnInit(): Promise<void> {
        this.listen(
            this.#stage.initialized$.pipe(filter(isInitialized => isInitialized)).subscribe(() => {
                console.log('start', 'ngOnInit');
                // this.#stage.startScene('spacemap', new SpaceScene(this.#stage));
                this.#stage.startScene('paradroid', new PixelDungeonScene() as unknown as NPScene);
            })
        );
        console.log('HomePageComponent', 'ngOnInit');
    }
}
