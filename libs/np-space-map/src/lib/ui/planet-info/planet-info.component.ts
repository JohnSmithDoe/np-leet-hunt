import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NPBaseSubscriber } from '@shared/np-library';
import { StageService } from '@shared/np-phaser';
import type * as Phaser from 'phaser';
import { filter } from 'rxjs';

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
export class PlanetInfoComponent extends NPBaseSubscriber implements OnInit, OnDestroy {
    #stage = inject(StageService);
    readonly info = signal<PlanetInfo | null>(null);

    #events?: Phaser.Events.EventEmitter;
    #onSelected = (info: PlanetInfo) => this.info.set(info);
    #onDeselected = () => this.info.set(null);

    ngOnInit(): void {
        this.listen(
            this.#stage.initialized$.pipe(filter(Boolean)).subscribe(() => {
                this.#events = this.#stage.phaser.game.events;
                this.#events.on(SPACE_EVENTS.PLANET_SELECTED, this.#onSelected);
                this.#events.on(SPACE_EVENTS.PLANET_DESELECTED, this.#onDeselected);
            })
        );
    }

    override ngOnDestroy(): void {
        this.#events?.off(SPACE_EVENTS.PLANET_SELECTED, this.#onSelected);
        this.#events?.off(SPACE_EVENTS.PLANET_DESELECTED, this.#onDeselected);
        super.ngOnDestroy();
    }
}
