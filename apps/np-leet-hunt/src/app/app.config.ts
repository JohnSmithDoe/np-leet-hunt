import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { PERSISTENCE_PORT } from '@shared/np-state';

import { routes } from './app.routes';
import { CapacitorPersistence } from './persistence/capacitor-persistence';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular({
            animated: true,
            mode: 'ios',
        }),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        // Back the meta save with Capacitor Preferences (np-state defaults to in-memory otherwise).
        { provide: PERSISTENCE_PORT, useFactory: () => new CapacitorPersistence() },
    ],
};
