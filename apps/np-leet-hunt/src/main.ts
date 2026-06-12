import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { nyanConsole } from '@shared/np-library';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}
nyanConsole('Welcome to Leet-Hunt :)');
platformBrowser()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
