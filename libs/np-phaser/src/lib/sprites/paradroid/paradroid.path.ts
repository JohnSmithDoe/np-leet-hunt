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

    #fullWidth: number;
    #tileWidth: number;
    #tileHeight: number;
    #thickness: number;

    constructor(public scene: NPScene, field: ParadroidField, path: TParadroidPath) {
        super(scene, field.x, field.y, '');
        this.#field = field;
        this.#path = path;
        this.#tileWidth = this.#field.tileWidth;
        this.#tileHeight = this.#field.tileHeight;
        this.#thickness = Math.min(this.#tileWidth, this.#tileHeight ?? Number.MAX_SAFE_INTEGER) / 4;
    }

    preload(): void {
        if (!this.scene.textures.exists(SHEET.key)) {
            this.scene.load.spritesheet(SHEET.key, SHEET.url, SHEET);
        }
    }

    create(container?: Phaser.GameObjects.Container): void {
        this.setTexture(SHEET.key, this.owner === EParadroidOwner.Droid ? 0 : 1);
        this.#setActivatingOrientation();
        // set to inactive state
        this.setDisplaySize(0, this.#thickness);
        // this.setDisplaySize(this.#fullWidth, this.#thickness);
        if (this.#path.fx === 'fx-autofire') this.activate(); // probably not here
        container?.add(this);
    }

    update(...args) {
        super.update(...args);
        switch (this.#state) {
            case 'activating':
                this.displayWidth += 160 / 60;
                if (this.displayWidth >= this.#fullWidth) {
                    this.displayWidth = this.#fullWidth;
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

    get fx() {
        return this.#path.fx;
    }

    #setActivatingOrientation() {
        let pos = { x: 0, y: 0, rot: 0, width: this.#tileWidth / 2, height: this.#tileHeight / 2 };
        switch (this.#path.from) {
            case EFlowFrom.Top:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth,
                    y: 0,
                    rot: PIHalf,
                    width: pos.height + this.#thickness / 2,
                };
                break;
            case EFlowFrom.Bottom:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth,
                    y: this.#tileHeight,
                    rot: PIAndAHalf,
                    width: pos.height + this.#thickness / 2,
                };
                break;
            case EFlowFrom.Left:
                pos = {
                    ...pos,
                    x: 0,
                    y: 0.5 * this.#tileHeight,
                    width: pos.width + this.#thickness / 2,
                };
                break;
            case EFlowFrom.Mid:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth,
                    y: 0.5 * this.#tileHeight,
                    rot: 0,
                    width: pos.width - this.#thickness / 2,
                };
                switch (this.#path.to) {
                    case EFlowTo.Top:
                        pos.y -= this.#thickness / 2;
                        pos.rot = PIAndAHalf;
                        pos.width = pos.height - this.#thickness / 2;
                        break;
                    case EFlowTo.Right:
                        pos.x += this.#thickness / 2;
                        break;
                    case EFlowTo.Bottom:
                        pos.y += this.#thickness / 2;
                        pos.rot = PIHalf;
                        pos.width = pos.height - this.#thickness / 2;
                        break;
                }
                break;
        }

        this.setOrigin(0, 0.5);
        this.setRotation(pos.rot);
        this.#fullWidth = pos.width;
        this.setPosition(this.#field.x + pos.x, this.#field.y + pos.y);
    }

    #setDeactivatingOrientation() {
        let pos = { x: 0, y: 0, rot: 0, width: this.#tileWidth / 2, height: this.#tileHeight / 2 };
        switch (this.#path.from) {
            case EFlowFrom.Top:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth,
                    y: 0.5 * this.#tileHeight + this.#thickness / 2,
                    rot: PIAndAHalf,
                    width: pos.height,
                };
                break;
            case EFlowFrom.Bottom:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth,
                    y: 0.5 * this.#tileHeight - this.#thickness / 2,
                    rot: PIHalf,
                    width: pos.height - this.#thickness / 2,
                };
                break;
            case EFlowFrom.Left:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth + this.#thickness / 2,
                    y: 0.5 * this.#tileHeight,
                    width: pos.width + this.#thickness / 2,
                    rot: PI,
                };
                break;
            case EFlowFrom.Mid:
                pos = {
                    ...pos,
                    x: 0.5 * this.#tileWidth,
                    y: 0.5 * this.#tileHeight,
                    rot: 0,
                    width: pos.width - this.#thickness / 2,
                };
                switch (this.#path.to) {
                    case EFlowTo.Top:
                        pos = {
                            ...pos,
                            x: 0.5 * this.#tileWidth,
                            y: 0,
                            rot: PIHalf,
                            width: pos.height - this.#thickness / 2,
                        };
                        break;
                    case EFlowTo.Right:
                        pos.x = this.#tileWidth;
                        pos.rot = PI;
                        break;
                    case EFlowTo.Bottom:
                        pos.y = this.#tileHeight;
                        pos.rot = PIAndAHalf;
                        pos.width = pos.height - this.#thickness / 2;
                        break;
                }
                break;
        }
        this.setRotation(pos.rot);
        this.#fullWidth = pos.width;
        this.setPosition(this.#field.x + pos.x, this.#field.y + pos.y);
    }
}
