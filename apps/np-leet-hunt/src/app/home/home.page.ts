import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
} from '@ionic/angular/standalone';
import { NpAudioService } from '@shared/np-audio';
import { StageComponent } from '@shared/np-phaser';
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
    #game = inject(GameStateService);
    #audio = inject(NpAudioService);
    /**
     * Composition root: injecting the conductor wires it to the stage + run FSM (see its constructor). It
     * waits for the stage to boot, then renders each FSM phase as a scene — so StageService stays
     * domain-free and the FSM is the single source of truth for the active mode. The run opens on the
     * intro crawl, then the hangar, whose "Launch run" begins the run. Kept as a field so the debug
     * toolbar can drive it.
     */
    #conductor = inject(RunConductorService);

    /**
     * Boot gate. The browser blocks audio until a user gesture, so the game opens on a title screen whose
     * audio choice (play with sound / muted) is that gesture; choosing reveals the game and rolls the
     * one-time intro crawl (a Phaser scene), which then hands off to the hangar — guaranteeing the hangar
     * (the "main menu") always has music. `'title'` → `'game'` (the crawl + hangar are Phaser scenes).
     */
    readonly boot = signal<'title' | 'game'>('title');
    /** Mirrors the audio mute state for the toolbar toggle. */
    readonly muted = this.#audio.muted;

    /**
     * Leave the title screen via the audio choice (the gesture that unlocks audio): play with sound, or
     * muted. Either way we unlock — `unlock` honours the mute flag, so a later un-mute still works — then
     * reveal the stage and start the intro crawl. The conductor queued the `intro.crawl` fanfare (the run
     * FSM opens on `intro`), so unlocking starts the music in step with the crawl it now begins.
     */
    public enter(withSound: boolean): void {
        this.#audio.setMuted(!withSound);
        void this.#audio.unlock();
        this.boot.set('game');
        this.#conductor.beginIntro();
    }

    public toggleMute(): void {
        this.#audio.toggleMute();
    }

    /** Debug: load and play the bundled `song.strudel`. Needs its samples dropped in (see SAMPLES.md). */
    public playTheme(): void {
        void this.#audio.music.playSong('np-audio/song.strudel');
    }

    /** Debug: fire a one-shot SFX to test the SFX path. */
    public playSfx(): void {
        this.#audio.sfx.play('weapon.shoot');
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

    /** Debug: open the grey-fight colony — a clockless side game outside the run FSM (GDD §4). */
    public toColony(): void {
        this.#conductor.beginColony();
    }

    // Debug: jump straight to a deeper sector to test its larger map + scaled-up duel board (Leet-38).
    public toSector3(): void {
        this.#conductor.debugJumpToSector(3);
    }
    public toSector5(): void {
        this.#conductor.debugJumpToSector(5);
    }

    #toPhase(phase: RunPhase): void {
        if (this.#game.fsm.can(phase)) this.#game.fsm.to(phase);
    }
}
