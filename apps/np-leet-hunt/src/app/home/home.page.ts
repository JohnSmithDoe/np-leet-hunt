import { Component, inject, OnInit } from '@angular/core';
import { NPBaseSubscriber } from '@shared/np-library';
import { ParadroidScene } from '@shared/np-paradroid';
import { StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import { SpaceMapScene, SpaceScene, SpaceUiScene } from '@shared/np-space-map';
import { filter } from 'rxjs';

@Component({
    selector: 'np-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false,
})
export class HomePageComponent extends NPBaseSubscriber implements OnInit {
    #stage = inject(StageService);

    async ngOnInit(): Promise<void> {
        this.listen(
            this.#stage.initialized$.pipe(filter(isInitialized => isInitialized)).subscribe(() => {
                this.goToSpace();
            })
        );
        console.log('HomePageComponent', 'ngOnInit');
    }

    public goToSpace() {
        this.#stage.phaser.game.scene.add(SpaceScene.key, new SpaceScene(), true);
        this.#stage.phaser.game.scene.add(SpaceMapScene.key, new SpaceMapScene(), true);
        this.#stage.phaser.game.scene.add(SpaceUiScene.key, new SpaceUiScene(), true);
        // this.#stage.startScene(SpaceScene.key, new SpaceScene());
    }

    public goToPixeldungeon() {
        this.#stage.startScene(PixelDungeonScene.key, new PixelDungeonScene());
    }

    public goToParadroid() {
        this.#stage.startScene(ParadroidScene.key, new ParadroidScene());
    }
}
