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
import { StageComponent, StageService } from '@shared/np-phaser';
import { EventDialogComponent, PlanetInfoComponent } from '@shared/np-space-map';
import { GameStateService, RunPhase } from '@shared/np-state';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { filter } from 'rxjs';

import { RunConductorService } from '../run/run-conductor.service';

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
    #game = inject(GameStateService);
    #conductor = inject(RunConductorService);

    constructor() {
        super();
        addIcons({ heart });
    }

    ngOnInit(): void {
        this.listen(
            this.#stage.initialized$.pipe(filter(isInitialized => isInitialized)).subscribe(() => {
                // Composition root: start a run (hangar → sector), then let the conductor render each
                // phase. The conductor builds scenes with the injected run store, so StageService stays
                // domain-free and the FSM is the single source of truth for the active mode.
                this.#game.startNewRun();
                this.#conductor.start();
            })
        );
    }

    // Debug toolbar: each button is a run-phase *intent* — the conductor turns the phase into a scene
    // swap. Illegal transitions (e.g. duel → dungeon directly) are ignored; bounce via the map first.
    public toSpace(): void {
        this.#toPhase('sector');
    }
    public toParadroid(): void {
        this.#toPhase('duel');
    }
    public toPixeldungeon(): void {
        this.#toPhase('dungeon');
    }

    #toPhase(phase: RunPhase): void {
        if (this.#game.fsm.can(phase)) this.#game.fsm.to(phase);
    }
}
