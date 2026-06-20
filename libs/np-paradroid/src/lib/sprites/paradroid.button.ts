import { NPButton, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { ParadroidField } from './paradroid.field';

export class ParadroidButton extends NPButton {
    #field: ParadroidField;
    #debounce?: Phaser.Time.TimerEvent;

    constructor(scene: NPScene, field: ParadroidField, config = { width: 64, height: 64 }) {
        // Centre the (origin-0.5) button on the middle of its row — field.y is the row's top edge.
        super(scene, 0, field.y + field.tileHeight / 2, config);
        this.#field = field;
        this.on(NPButton.EVENT_CLICK, () => this.#onClick());
    }

    /** The board row this button activates — how the droid AI addresses its buttons. */
    get row() {
        return this.#field.row;
    }

    /** Trigger this button programmatically (the droid AI's "click"); same path as a human press. */
    press() {
        this.emit(NPButton.EVENT_CLICK, this);
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
