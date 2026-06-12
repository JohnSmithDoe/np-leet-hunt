import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    IonApp,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonMenu,
    IonRouterOutlet,
    IonSplitPane,
    IonTitle,
    IonToolbar,
} from '@ionic/angular/standalone';
import { StageService } from '@shared/np-phaser';

@Component({
    selector: 'np-app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        IonApp,
        IonSplitPane,
        IonMenu,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonItemDivider,
        IonLabel,
        IonButton,
        IonList,
        IonItem,
        IonRouterOutlet,
        RouterLink,
    ],
})
export class AppComponent implements OnDestroy {
    public actionsHistoryRef: string[] = []; // * Store all actions on home screen for printing
    // public warriors: Warrior[] = []; // * Array of Warriors since they don't currently have a graphic associated
    public npStage = inject(StageService);

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
