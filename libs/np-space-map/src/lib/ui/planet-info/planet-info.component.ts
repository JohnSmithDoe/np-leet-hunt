import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { StageService } from '@shared/np-phaser';

import { PlanetInfo } from '../../planet/planet-info';
import { SPACE_EVENTS } from '../../space.events';

/**
 * HTML overlay that shows the selected planet's survey readout (GDD §6: text-heavy surfaces live in
 * HTML, not Phaser). It bridges the Phaser→Angular boundary through the global game event emitter and
 * drives an OnPush signal — the only change-detection mechanism that works in this zoneless app.
 */
@Component({
    selector: 'np-planet-info',
    templateUrl: './planet-info.component.html',
    styleUrls: ['./planet-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetInfoComponent {
    #stage = inject(StageService);
    readonly info = signal<PlanetInfo | null>(null);

    #onSelected = (info: PlanetInfo) => this.info.set(info);
    #onDeselected = () => this.info.set(null);

    constructor() {
        // Once the stage is up, listen for planet (de)selection on the game event bus. The effect runs
        // when `initialized` flips true; onCleanup removes the listeners on re-run and on destroy.
        effect(onCleanup => {
            if (!this.#stage.initialized()) return;
            const events = this.#stage.phaser.game.events;
            events.on(SPACE_EVENTS.PLANET_SELECTED, this.#onSelected);
            events.on(SPACE_EVENTS.PLANET_DESELECTED, this.#onDeselected);
            onCleanup(() => {
                events.off(SPACE_EVENTS.PLANET_SELECTED, this.#onSelected);
                events.off(SPACE_EVENTS.PLANET_DESELECTED, this.#onDeselected);
            });
        });
    }
}
