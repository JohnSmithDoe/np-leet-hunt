import { NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../../../../np-phaser/src/lib/types/np-phaser';
import { FrontAdvancedPayload, ResourcesPayload, SPACE_EVENTS } from '../space.events';

const BAR = { x: 60, y: 64, w: 520, h: 34 };

/** Fixed map HUD: how far reality has closed in, and how many jumps it took. */
export class SpaceUiScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    static key = 'space-ui-scene';
    #bar!: Phaser.GameObjects.Graphics;
    #jumps!: Phaser.GameObjects.Text;
    #stats!: Phaser.GameObjects.Text;
    #banner!: Phaser.GameObjects.Text;
    #fraction = 0;

    constructor() {
        super({ key: SpaceUiScene.key });
    }

    setupComponents() {
        // HUD is built in create(): it needs no preloaded assets, only text + graphics.
    }

    create() {
        super.create();
        const text = (x: number, y: number, value: string, size: number, color: string) =>
            this.add
                .text(x, y, value, { fontFamily: 'sans-serif', fontSize: `${size}px`, color })
                .setScrollFactor(0)
                .setDepth(100);

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
        this.game.events.on(SPACE_EVENTS.RESOURCES_CHANGED, (r: ResourcesPayload) => {
            this.#stats.setText(`HULL ${r.hull}   HEART ${r.heart}   MARBLES ${r.marbles}`);
        });
        this.game.events.on(SPACE_EVENTS.REALITY_SNAPBACK, () => {
            this.#fraction = 1;
            this.#drawBar();
            this.#banner.setColor('#ff8a8a').setText('REALITY SNAPPED BACK');
        });
        this.game.events.on(SPACE_EVENTS.SECTOR_EXIT, () => {
            this.#banner.setColor('#8affc8').setText('JUMPED OUT — SECTOR LEFT');
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
