import { Component, inject, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Event, Warrior } from '@shared/model';
import { StageService } from '@shared/phaser';

import { ShopPageComponent } from './shop/shop.component';

@Component({
    selector: 'np-app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
    public actionsHistoryRef: string[] = []; // * Store all actions on home screen for printing
    public warriors: Warrior[] = []; // * Array of Warriors since they don't currently have a graphic associated
    public npStage = inject(StageService);
    // * for our app template to use the actions History
    constructor(public modalController: ModalController) {}

    public async openShop(): Promise<void> {
        const modal = await this.modalController.create({
            component: ShopPageComponent,
            cssClass: 'fullscreen',
        });
        return await modal.present();
    }

    /**
     * * Creates a warrior to be placed on scene
     */
    public async createWarrior(): Promise<void> {
        console.log('createWarrior()');
        this.npStage.startScene('spacemap');
    }

    /**
     * * Creates a Event and applies it to the Warrior
     *
     * @param _warrior Warrior
     */
    public async doPushUps(_warrior: Warrior): Promise<void> {
        await _warrior.doPushUps();
    }

    /**
     * * Creates a Event and applies it to a random Warrior
     */
    public async createEvent(): Promise<void> {
        // * This function creates an 'experience' event that modifies the Warrior
        const xpEvent = new Event();
        console.log('createEvent()', 'value = ', xpEvent.value);
    }

    /**
     * * Need to handle the destroy method so we dont lock up our computer!
     */
    ngOnDestroy(): void {
        console.warn('this.npStage.ngOnDestroy();');
    }
}
