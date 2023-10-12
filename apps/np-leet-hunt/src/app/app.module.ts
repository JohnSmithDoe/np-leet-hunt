import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { PhaserModule, StageComponent } from '@shared/np-phaser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePageComponent } from './home/home.page';
import { ReversePipe } from './pipes/reverse.pipe';

@NgModule({
    declarations: [AppComponent, HomePageComponent, ReversePipe],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            animated: true,
            mode: 'ios',
        }),
        PhaserModule.forRoot(),
        AppRoutingModule,
        StageComponent,
    ],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent],
})
export class AppModule {}
