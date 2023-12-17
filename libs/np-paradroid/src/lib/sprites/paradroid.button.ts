import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { NPButton } from '../../../../np-phaser/src/lib/sprites/button/NpButton';
import { ParadroidField } from './paradroid.field';

export class ParadroidButton extends NPButton {
    #field: ParadroidField;
    #debounce?: Phaser.Time.TimerEvent;

    constructor(scene: NPScene, field: ParadroidField, config = { width: 64, height: 64 }) {
        super(scene, 0, field.y, config);
        this.#field = field;
        this.on(NPButton.EVENT_CLICK, () => this.#onClick());
    }

    #onClick() {
        this.#field.activate();
        const config: Phaser.Types.Time.TimerEventConfig = {
            delay: 3000,
            callback: () => {
                this.#debounce = undefined;
                this.#field.deactivate();
            },
        };
        if (this.#debounce) {
            this.#debounce.reset(config);
        } else {
            this.#debounce = this.scene.time.addEvent(config);
        }
    }
}
