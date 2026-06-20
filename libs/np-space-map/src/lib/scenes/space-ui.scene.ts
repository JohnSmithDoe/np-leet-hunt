import { NPScene } from '@shared/np-phaser';
import type { GameState, Sector } from '@shared/np-state';
import { SECTOR_COUNT } from '@shared/np-state';
import * as Phaser from 'phaser';
import { Subscription } from 'rxjs';

import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { FrontAdvancedPayload, SPACE_EVENTS } from '../space.events';

const BAR = { x: 60, y: 64, w: 520, h: 34 };

/** Fixed map HUD: how far reality has closed in, and how many jumps it took. */
export class SpaceUiScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-ui-scene';
    #bar!: Phaser.GameObjects.Graphics;
    #title!: Phaser.GameObjects.Text;
    #jumps!: Phaser.GameObjects.Text;
    #stats!: Phaser.GameObjects.Text;
    #banner!: Phaser.GameObjects.Text;
    #fraction = 0;
    #state: GameState;
    #sector: Sector;
    #stateSub?: Subscription;
    /** Last seen meter values, to diff each `changes$` snapshot into gain/loss floaters. */
    #prevResources?: { hull: number; heart: number; marbles: number };

    constructor(state: GameState, sector: Sector) {
        super({ key: SpaceUiScene.key });
        this.#state = state;
        this.#sector = sector;
    }

    /** Refresh the HUD for a new sector (the scene is persistent, so create() doesn't re-run). */
    loadSector(sector: Sector): void {
        this.#sector = sector;
        this.#title.setText(this.#titleText());
        this.#banner.setText(''); // clear the "JUMPED OUT" banner from the sector we just left
        this.#fraction = 0; // front starts fresh; the build's FRONT_ADVANCED will confirm it
        this.#drawBar();
    }

    /** 'home-reach' (sector 2) → 'SECTOR 2/5  —  HOME REACH'. */
    #titleText(): string {
        return `SECTOR ${this.#sector.number}/${SECTOR_COUNT}  —  ${this.#sector.id.replace(/-/g, ' ').toUpperCase()}`;
    }

    setupComponents() {
        // HUD is built in create(): it needs no preloaded assets, only text + graphics.
    }

    override create() {
        super.create();
        const text = (x: number, y: number, value: string, size: number, color: string) =>
            this.add
                .text(x, y, value, { fontFamily: 'sans-serif', fontSize: `${size}px`, color })
                .setScrollFactor(0)
                .setDepth(100);

        this.#title = text(BAR.x, BAR.y - 64, this.#titleText(), 24, '#e7ecff');
        text(BAR.x, BAR.y - 32, 'REALITY CLOSING IN', 22, '#cfd8ff');
        this.#bar = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.#jumps = text(BAR.x, BAR.y + BAR.h + 8, 'JUMPS  0', 20, '#9fb0d0');
        this.#stats = text(BAR.x, BAR.y + BAR.h + 36, 'HULL 10   HEART 10   MARBLES 0', 20, '#9fb0d0');
        this.#banner = this.add
            .text(960, 540, '', { fontFamily: 'sans-serif', fontSize: '64px', color: '#ff8a8a' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        this.#drawBar();

        this.game.events.on(SPACE_EVENTS.FRONT_ADVANCED, (payload: FrontAdvancedPayload) => {
            this.#fraction = payload.closedFraction;
            this.#jumps.setText(`JUMPS  ${payload.jumps}`);
            this.#drawBar();
        });
        // Read the run store directly: its BehaviorSubject replays the current resources on subscribe
        // and pushes every change, so the HUD needs no RESOURCES_CHANGED event bus. Diff each snapshot
        // against the last to float a gain/loss number per changed meter (event outcomes & answer costs).
        this.#stateSub = this.#state.changes$.subscribe(({ resources }) => {
            this.#stats.setText(`HULL ${resources.hull}   HEART ${resources.heart}   MARBLES ${resources.marbles}`);
            if (this.#prevResources) this.#showResourceDeltas(this.#prevResources, resources);
            this.#prevResources = { hull: resources.hull, heart: resources.heart, marbles: resources.marbles };
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.#stateSub?.unsubscribe());
        this.game.events.on(SPACE_EVENTS.REALITY_SNAPBACK, () => {
            this.#fraction = 1;
            this.#drawBar();
            this.#banner.setColor('#ff8a8a').setText('REALITY SNAPPED BACK');
        });
        this.game.events.on(SPACE_EVENTS.SECTOR_EXIT, () => {
            this.#banner.setColor('#8affc8').setText('JUMPED OUT — SECTOR LEFT');
        });
    }

    /** Float a "+/- N" number per meter that changed, and give the stats line a quick pop. */
    #showResourceDeltas(
        prev: { hull: number; heart: number; marbles: number },
        next: { hull: number; heart: number; marbles: number }
    ) {
        const meters: { label: string; delta: number }[] = [
            { label: 'HULL', delta: next.hull - prev.hull },
            { label: 'HEART', delta: next.heart - prev.heart },
            { label: 'MARBLES', delta: next.marbles - prev.marbles },
        ];
        let row = 0;
        for (const meter of meters) {
            if (meter.delta !== 0) this.#floatDelta(meter.label, meter.delta, row++);
        }
        if (row > 0) {
            // A brief scale pop on the readout itself, so the change reads even off-screen of the floater.
            this.tweens.add({
                targets: this.#stats,
                scale: { from: 1.18, to: 1 },
                duration: 280,
                ease: 'Quad.easeOut',
            });
        }
    }

    /** One rising, fading gain/loss number, stacked to the right of the stats readout (clear of the text). */
    #floatDelta(label: string, delta: number, row: number) {
        const gain = delta > 0;
        const color = gain ? '#8affc8' : '#ff8a8a'; // same green/red as the front bar + snapback banner
        const sign = gain ? '+' : '-';
        const floater = this.add
            .text(BAR.x + 360, BAR.y + BAR.h + 36 + row * 26, `${label} ${sign}${Math.abs(delta)}`, {
                fontFamily: 'sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color,
            })
            .setScrollFactor(0)
            .setDepth(102)
            .setScale(1.15);
        this.tweens.add({
            targets: floater,
            y: floater.y - 44,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => floater.destroy(),
        });
    }

    #drawBar() {
        const f = Phaser.Math.Clamp(this.#fraction, 0, 1);
        const fill = f < 0.5 ? 0x6fcf97 : f < 0.8 ? 0xf2c94c : 0xeb5757; // green → amber → red as it closes
        this.#bar.clear();
        this.#bar.fillStyle(0x10131c, 0.85).fillRoundedRect(BAR.x, BAR.y, BAR.w, BAR.h, 8);
        const fillWidth = (BAR.w - 6) * f;
        if (fillWidth > 1) {
            this.#bar.fillStyle(fill, 1).fillRect(BAR.x + 3, BAR.y + 3, fillWidth, BAR.h - 6);
        }
        this.#bar.lineStyle(2, 0x3a4255, 1).strokeRoundedRect(BAR.x, BAR.y, BAR.w, BAR.h, 8);
    }
}
