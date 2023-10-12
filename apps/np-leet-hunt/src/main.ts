import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { nyanConsole } from '@shared/np-library';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}
nyanConsole('Welcome to Leet-Hunt :)');
platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
