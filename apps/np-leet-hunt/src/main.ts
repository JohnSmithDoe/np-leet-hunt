import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { nyanConsole } from '@shared/np-library';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}
nyanConsole('Welcome to Leet-Hunt :)');
bootstrapApplication(AppComponent, appConfig).catch(err => console.log(err));
