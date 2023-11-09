import { Component, inject, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StageService } from '@shared/np-phaser';

@Component({
    selector: 'np-app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
    public actionsHistoryRef: string[] = []; // * Store all actions on home screen for printing
    // public warriors: Warrior[] = []; // * Array of Warriors since they don't currently have a graphic associated
    public npStage = inject(StageService);
    // * for our app template to use the actions History
    constructor(public modalController: ModalController) {}

    /**
     * * Creates a warrior to be placed on scene
     */
    public async createWarrior(): Promise<void> {
        console.log('createWarrior()');
    }

    /**
     * * Need to handle the destroy method so we dont lock up our computer!
     */
    ngOnDestroy(): void {
        console.warn('this.npStage.ngOnDestroy();');
    }
}
