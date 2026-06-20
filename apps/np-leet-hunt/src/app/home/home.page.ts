import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
} from '@ionic/angular/standalone';
import { StageComponent, StageService } from '@shared/np-phaser';
import { EventDialogComponent, PlanetInfoComponent } from '@shared/np-space-map';
import { GameStateService, RunPhase } from '@shared/np-state';

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
        IonTitle,
        IonContent,
        StageComponent,
        PlanetInfoComponent,
        EventDialogComponent,
    ],
})
export class HomePageComponent {
    #stage = inject(StageService);
    #game = inject(GameStateService);
    #conductor = inject(RunConductorService);

    constructor() {
        // Composition root: once the stage is up, hand it to the conductor. The run FSM starts in the
        // hangar; the conductor renders each phase as a scene, so StageService stays domain-free and the
        // FSM is the single source of truth for the active mode. The hangar's "Launch run" begins the run.
        effect(() => {
            if (this.#stage.initialized()) this.#conductor.start();
        });
    }

    // Debug toolbar: each button is a run-phase *intent* — the conductor turns the phase into a scene
    // swap. Illegal transitions (e.g. duel → dungeon directly) are ignored; bounce via the map first.
    public toMap(): void {
        this.#toPhase('sector');
    }
    public toEvent(): void {
        this.#toPhase('event');
    }
    public toDuel(): void {
        this.#toPhase('duel');
    }
    public toDungeon(): void {
        this.#toPhase('dungeon');
    }
    public toBoarding(): void {
        this.#toPhase('boarding');
    }
    public toGuardian(): void {
        this.#toPhase('guardian');
    }

    #toPhase(phase: RunPhase): void {
        if (this.#game.fsm.can(phase)) this.#game.fsm.to(phase);
    }
}
