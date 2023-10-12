import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { PhaserService } from './service/phaser.service';

/**
 * * The PhaserInstance is a singleton that controls the Game Scene, which is the UI portion of the Game Engine
 */
@NgModule({
    imports: [CommonModule],
    declarations: [],
    exports: [],
})
export class PhaserModule {
    constructor(@Optional() @SkipSelf() parentModule?: PhaserModule) {
        if (parentModule) {
            console.error('Phaser Singleton is already loaded. Import it in the AppModule only');
        }
    }

    /**
     * * This function is required for singleton instance
     *
     * @returns PhaserModule & List of Providers
     */
    public static forRoot(): ModuleWithProviders<PhaserModule> {
        return {
            ngModule: PhaserModule,
            providers: [PhaserService],
        };
    }
}
