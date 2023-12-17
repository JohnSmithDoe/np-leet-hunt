import { NPScene } from '@shared/np-phaser';

import { createSpeechBubble } from '../../../../np-phaser/src/lib/factories/graphics.factory';
import { TextButton } from '../../../../np-phaser/src/lib/sprites/button/text-button';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { SPACE_EVENTS } from '../space.events';
import { Space } from '../space/space';

export class SpaceUiScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-ui-scene';
    iter = 0;
    #space: Space;

    constructor() {
        super({ key: SpaceUiScene.key });
    }

    setupComponents() {
        console.log('dont do it???????');
        // this.zoomIn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        // this.zoomOut = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // this.cameras.main.startFollow(this.rocket).setZoom(0.035);
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    create() {
        super.create();
        const zoomInTxtBtn = new TextButton(this, 500, 10, 'Zoom In');
        zoomInTxtBtn.on('pointerup', () => {
            this.game.events.emit(SPACE_EVENTS.ZOOM_IN);
        });
        this.addToLayer('ui', zoomInTxtBtn);

        const zoomOutTxtBtn = new TextButton(this, 700, 10, 'Zoom Out');
        zoomOutTxtBtn.on('pointerup', () => {
            this.game.events.emit(SPACE_EVENTS.ZOOM_OUT);
        });
        this.addToLayer('ui', zoomOutTxtBtn);
        const bubble = createSpeechBubble(
            this,
            70,
            400,
            250,
            100,
            "“And now you're a boss, too... of this pile of rubble.”"
        );
        this.addToLayer('np', bubble);
    }
}
