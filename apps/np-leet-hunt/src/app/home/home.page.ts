/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, inject, OnInit } from '@angular/core';
import { NPBaseSubscriber } from '@shared/np-library';
import { StageService } from '@shared/np-phaser';
import { filter } from 'rxjs';

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
                this.#stage.startScene('spacemap');
            })
        );
        console.log('HomePageComponent', 'ngOnInit');
    }
}
