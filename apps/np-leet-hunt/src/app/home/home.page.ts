import { Component, inject, OnInit } from '@angular/core';
import { NPBaseSubscriber } from '@shared/np-library';
import { ParadroidScene } from '@shared/np-paradroid';
import { StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { filter } from 'rxjs';

import { SpaceScene } from '../../../../../libs/np-space-map/src/lib/space.scene';

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
                this.goToPixeldungeon();
            })
        );
        console.log('HomePageComponent', 'ngOnInit');
    }

    public goToSpace() {
        this.#stage.startScene(SpaceScene.key, new SpaceScene());
    }

    public goToPixeldungeon() {
        this.#stage.startScene(PixelDungeonScene.key, new PixelDungeonScene());
    }

    public goToParadroid() {
        this.#stage.startScene(ParadroidScene.key, new ParadroidScene());
    }
}
