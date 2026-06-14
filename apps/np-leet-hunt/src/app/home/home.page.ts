import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonTitle,
    IonToolbar,
} from '@ionic/angular/standalone';
import { NPBaseSubscriber } from '@shared/np-library';
import { ParadroidScene } from '@shared/np-paradroid';
import { StageComponent, StageService } from '@shared/np-phaser';
import { PixelDungeonScene } from '@shared/np-pixel-dungeon';
import {
    EventDialogComponent,
    PlanetInfoComponent,
    SpaceMapScene,
    SpaceScene,
    SpaceUiScene,
} from '@shared/np-space-map';
import { GameStateService } from '@shared/np-state';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { filter } from 'rxjs';

@Component({
    selector: 'np-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonHeader,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonButton,
        IonIcon,
        IonTitle,
        IonContent,
        StageComponent,
        PlanetInfoComponent,
        EventDialogComponent,
    ],
})
export class HomePageComponent extends NPBaseSubscriber implements OnInit {
    #stage = inject(StageService);
    #gameState = inject(GameStateService);

    constructor() {
        super();
        addIcons({ heart });
    }

    async ngOnInit(): Promise<void> {
        this.listen(
            this.#stage.initialized$.pipe(filter(isInitialized => isInitialized)).subscribe(() => {
                this.goToSpace();
            })
        );
        console.log('HomePageComponent', 'ngOnInit');
    }

    public goToSpace() {
        // The app is the composition root: inject the run-state store and hand it (typed `GameState`)
        // into the map scene, which threads it down to NPSpaceMap. StageService stays domain-free.
        this.#stage.startScene(
            { key: SpaceScene.key, scene: new SpaceScene(), persistent: true },
            { key: SpaceMapScene.key, scene: new SpaceMapScene(this.#gameState.run), persistent: true },
            { key: SpaceUiScene.key, scene: new SpaceUiScene(), persistent: true }
        );
    }

    public goToPixeldungeon() {
        this.#stage.startScene({ key: PixelDungeonScene.key, scene: new PixelDungeonScene() });
    }

    public goToParadroid() {
        this.#stage.startScene({ key: ParadroidScene.key, scene: new ParadroidScene() });
    }
}
