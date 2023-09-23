import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { PhaserModule } from '@shared/phaser';

import { StageComponent } from '../../../../libs/shared/components/src/lib/basics/stage/stage.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePageComponent } from './home/home.page';
import { ReversePipe } from './pipes/reverse.pipe';
import { ShopPageComponent } from './shop/shop.component';

@NgModule({
    declarations: [AppComponent, ShopPageComponent, HomePageComponent, ReversePipe],
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
