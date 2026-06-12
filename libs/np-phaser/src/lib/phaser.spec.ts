import * as Phaser from 'phaser';

import { NPScene } from './scenes/np-scene';
import { PhaserService } from './service/phaser.service';
import { StageService } from './service/stage.service';

describe('np-phaser smoke test', () => {
    it('bundles phaser', () => {
        expect(Phaser.VERSION).toBeDefined();
        expect(Phaser.Game).toBeDefined();
    });

    it('exposes the core services and scene base class', () => {
        expect(PhaserService).toBeDefined();
        expect(StageService).toBeDefined();
        expect(NPScene).toBeDefined();
    });
});
