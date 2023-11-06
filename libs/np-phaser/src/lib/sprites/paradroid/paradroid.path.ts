// noinspection JSSuspiciousNameCombination

import * as Phaser from 'phaser';

import { EFlowFrom, EFlowTo, EParadroidOwner } from '../../paradroid/paradroid.consts';
import { TParadroidPath, TParadroidPlayer } from '../../paradroid/paradroid.types';
import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';
import { ParadroidField } from './paradroid.field';
import { PI, PIAndAHalf, PIHalf } from './utils';

const SHEET = { key: 'pipes-paths', url: 'np-phaser/paradroid/assets/paths.png', frameWidth: 32, frameHeight: 16 };

export enum EVENTS {
    ACTIVATED = 'activated',
    DEACTIVATED = 'deactivated',
}

export class ParadroidPath extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    #state: 'inactive' | 'activating' | 'deactivating' | 'active' = 'inactive';

    #field: ParadroidField;
    #path: TParadroidPath;

    #pos: { rot: number; x: number; width: number; y: number; height: number };

    constructor(public scene: NPScene, field: ParadroidField, path: TParadroidPath) {
        super(scene, field.x, field.y, '');
        this.#field = field;
        this.#path = path;
    }

    preload(): void {
        if (!this.scene.textures.exists(SHEET.key)) {
            this.scene.load.spritesheet(SHEET.key, SHEET.url, SHEET);
        }
    }

    create(): void {
        this.setTexture(SHEET.key, this.owner === EParadroidOwner.Droid ? 0 : 1);
        this.#setActivatingOrientation();
        const size = 16;
        const center = this.getCenter();
        const x = center.x - size / 2;
        const y = center.y - size / 2;
        let g: Phaser.GameObjects.Graphics;

        switch (this.#path.fx) {
            case 'none':
                g = this.scene.make.graphics({ fillStyle: { alpha: 0.15, color: 0xff0000 } });
                break;
            case 'fx-autofire':
                g = this.scene.make.graphics({ fillStyle: { alpha: 1, color: 0x00ff00 } });
                break;
            case 'fx-changer':
                g = this.scene.make.graphics({ fillStyle: { alpha: 1, color: 0x0000ff } });
                break;
        }
        g.fillRect(x, y, size, size);
        // set to inactive state -> comment to see the full path net
        this.setDisplaySize(0, this.#pos.height);
        if (this.#path.fx === 'fx-autofire') this.activate(); // probably not here
        this.scene.addToLayer('ui', this);
        this.scene.addToLayer('ui', g);
    }

    update(...args) {
        super.update(...args);

        if (this.#pos) {
            switch (this.#state) {
                case 'activating':
                    this.displayWidth += 160 / 60;
                    if (this.displayWidth >= this.#pos.width) {
                        this.displayWidth = this.#pos.width;
                        this.#state = 'active';
                        this.emit(EVENTS.ACTIVATED, this);
                    }
                    break;
                case 'deactivating':
                    this.displayWidth -= 60 / 60;
                    if (Math.round(this.displayWidth) === 0) {
                        this.displayWidth = 0;
                        this.#state = 'inactive';
                        this.emit(EVENTS.DEACTIVATED, this);
                    }
                    break;
                case 'active':
                case 'inactive':
                    break;
            }
        }
    }

    activate() {
        this.#setActivatingOrientation();
        this.#state = 'activating';
    }

    deactivate() {
        if (this.#path.fx === 'fx-autofire') return;
        this.#setDeactivatingOrientation();
        this.#state = 'deactivating';
    }

    get next() {
        return this.#path.next;
    }

    get from() {
        return this.#path.from;
    }

    get to() {
        return this.#path.to;
    }

    get isIncoming() {
        return this.#path.to === EFlowTo.Mid;
    }

    get isActive() {
        return this.#state === 'active';
    }

    get owner(): TParadroidPlayer {
        return this.#path.owner;
    }

    set owner(value: TParadroidPlayer) {
        this.#path.owner = value;
    }

    #setActivatingOrientation() {
        let pos = { x: 0, y: 0, rot: 0, width: 32, height: SHEET.frameHeight };
        switch (this.#path.from) {
            case EFlowFrom.Top:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 0,
                    rot: PIHalf,
                    width: pos.width + SHEET.frameHeight / 2,
                };
                break;
            case EFlowFrom.Bottom:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 64,
                    rot: PIAndAHalf,
                    width: pos.width + SHEET.frameHeight / 2,
                };
                break;
            case EFlowFrom.Left:
                pos = {
                    ...pos,
                    x: 0,
                    y: 0.5 * 64,
                    width: pos.width + SHEET.frameHeight / 2,
                };
                break;
            case EFlowFrom.Mid:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 0.5 * 64,
                    rot: 0,
                    width: pos.width - SHEET.frameHeight / 2,
                };
                switch (this.#path.to) {
                    case EFlowTo.Top:
                        pos.y -= SHEET.frameHeight / 2;
                        pos.rot = PIAndAHalf;
                        break;
                    case EFlowTo.Right:
                        pos.x += SHEET.frameHeight / 2;
                        break;
                    case EFlowTo.Bottom:
                        pos.y += SHEET.frameHeight / 2;
                        pos.rot = PIHalf;
                        break;
                }
                break;
        }

        this.setOrigin(0, 0.5);
        this.setRotation(pos.rot);
        this.#pos = pos;
        this.setPosition(this.#field.x + pos.x, this.#field.y + pos.y);
    }

    #setDeactivatingOrientation() {
        let pos = { x: 0, y: 0, rot: 0, width: 32, height: SHEET.frameHeight };
        switch (this.#path.from) {
            case EFlowFrom.Top:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 0.5 * 64 + SHEET.frameHeight / 2,
                    rot: PIAndAHalf,
                    width: pos.width,
                };
                break;
            case EFlowFrom.Bottom:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 0.5 * 64 - SHEET.frameHeight / 2,
                    rot: PIHalf,
                    width: pos.width - SHEET.frameHeight / 2,
                };
                break;
            case EFlowFrom.Left:
                pos = {
                    ...pos,
                    x: 0.5 * 64 + SHEET.frameHeight / 2,
                    y: 0.5 * 64,
                    width: pos.width + SHEET.frameHeight / 2,
                    rot: PI,
                };
                break;
            case EFlowFrom.Mid:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 0.5 * 64,
                    rot: 0,
                    width: pos.width - SHEET.frameHeight / 2,
                };
                switch (this.#path.to) {
                    case EFlowTo.Top:
                        pos = {
                            ...pos,
                            x: 0.5 * 64,
                            y: 0,
                            rot: PIHalf,
                            width: pos.width - SHEET.frameHeight / 2,
                        };
                        break;
                    case EFlowTo.Right:
                        pos.x = 64;
                        pos.rot = PI;
                        break;
                    case EFlowTo.Bottom:
                        pos.y = 64;
                        pos.rot = PIAndAHalf;
                        break;
                }
                break;
        }
        this.setRotation(pos.rot);
        this.#pos = pos;
        this.setPosition(this.#field.x + pos.x, this.#field.y + pos.y);
    }
}
