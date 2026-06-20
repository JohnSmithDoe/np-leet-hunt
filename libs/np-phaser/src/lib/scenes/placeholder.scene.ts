import { TextButton } from '../sprites/button/text-button';
import { NPScene } from './np-scene';

/** One choice on a placeholder screen — a label and what to do when it's picked. */
export interface PlaceholderAction {
    label: string;
    onSelect: () => void;
}

export interface PlaceholderConfig {
    title: string;
    /** Optional info lines under the title (e.g. the current run context). */
    lines?: string[];
    /** Buttons stacked under the lines, top to bottom. */
    actions: PlaceholderAction[];
}

/**
 * A domain-free stand-in scene (Leet-31): a title, optional info lines, and a vertical stack of action
 * buttons. The run conductor builds one of these for every run phase with no real scene yet (hangar,
 * guardian, boarding, ending) and wires each action to a run-FSM transition — so the whole spine is
 * traversable end-to-end before the real modes exist. No game state, no assets: just text + callbacks.
 */
export class PlaceholderScene extends NPScene {
    readonly #config: PlaceholderConfig;

    constructor(key: string, config: PlaceholderConfig) {
        super({ key });
        this.#config = config;
    }

    setupComponents(): void {
        // Nothing to preload — the UI is plain text + buttons built in create().
    }

    override create(): void {
        super.create();
        const { width, height } = this.scale.gameSize;
        const cx = width / 2;

        this.add.rectangle(cx, height / 2, width, height, 0x05070d).setOrigin(0.5);
        this.add.text(cx, height * 0.26, this.#config.title, { fontSize: '64px', color: '#cfe8ff' }).setOrigin(0.5);

        (this.#config.lines ?? []).forEach((line, i) => {
            this.add.text(cx, height * 0.4 + i * 36, line, { fontSize: '24px', color: '#7fa6c4' }).setOrigin(0.5);
        });

        this.#config.actions.forEach((action, i) => {
            const button = new TextButton(this, cx, height * 0.58 + i * 64, action.label, {
                fontSize: '34px',
                color: '#0f0',
            });
            button.setOrigin(0.5);
            button.on('pointerup', () => action.onSelect());
            this.addExisting(button);
        });
    }
}
