// noinspection JSSuspiciousNameCombination

import * as Phaser from 'phaser';

import { EFlowFrom, EFlowTo } from '../../paradroid/paradroid.consts';
import { TParadroidPath } from '../../paradroid/paradroid.types';
import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';
import { ParadroidEngine } from './paradroid.engine';
import { ParadroidField } from './paradroid.field';
import { Utils } from './utils';

const SHEET = { key: 'pipes-paths', url: 'np-phaser/paradroid/assets/paths.png', frameWidth: 32, frameHeight: 16 };

export enum EVENTS {
    ACTIVATED = 'activated',
}

export class ParadroidPath extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    isIncoming: boolean;
    activated = false;
    expand = false;

    #engine: ParadroidEngine;
    #field: ParadroidField;
    #path: TParadroidPath;

    #pos: { rot: number; x: number; width: number; y: number; height: number };

    constructor(public scene: NPScene, engine: ParadroidEngine, field: ParadroidField, path: TParadroidPath) {
        super(scene, 0, 0, '');
        this.#engine = engine;
        this.#field = field;
        this.#path = path;
    }

    preload(): void {
        if (!this.scene.textures.exists(SHEET.key)) {
            this.scene.load.spritesheet(SHEET.key, SHEET.url, SHEET);
        }
    }

    create(): void {
        this.setTexture(SHEET.key, this.#path.fx === 'fx-changer' ? 0 : 1);
        let pos = { x: 0, y: 0, rot: 0, width: 32, height: SHEET.frameHeight };
        switch (this.#path.from) {
            case EFlowFrom.Top:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 0,
                    rot: Utils.PIHalf,
                    width: pos.width + SHEET.frameHeight / 2,
                };
                break;
            case EFlowFrom.Bottom:
                pos = {
                    ...pos,
                    x: 0.5 * 64,
                    y: 64,
                    rot: Utils.PIAndAHalf,
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
                        pos.rot = Utils.PIAndAHalf;
                        break;
                    case EFlowTo.Right:
                        pos.x += SHEET.frameHeight / 2;
                        break;
                    case EFlowTo.Bottom:
                        pos.y += SHEET.frameHeight / 2;
                        pos.rot = Utils.PIHalf;
                        break;
                }
                break;
        }

        console.log(this.#path, pos);
        this.setOrigin(0, 0.5);
        this.setRotation(pos.rot);
        this.setDisplaySize(pos.width, pos.height);
        this.#pos = pos;
        this.setPosition(this.#field.x + pos.x, this.#field.y + pos.y);
        this.isIncoming = this.#path.to === EFlowTo.Mid;

        this.setDisplaySize(0, pos.height);
        // pos = { x: 0, y: 0, rot: 0, width: 32, height: SHEET.frameHeight };
        // switch (this.#path.from) {
        //     case EFlowFrom.Top:
        //         pos = {
        //             ...pos,
        //             x: 0.5 * 64,
        //             y: 0.5 * 64 + SHEET.frameHeight / 2,
        //             rot: Utils.PIAndAHalf,
        //             width: pos.width,
        //         };
        //         break;
        //     case EFlowFrom.Bottom:
        //         pos = {
        //             ...pos,
        //             x: 0.5 * 64,
        //             y: 0.5 * 64 + SHEET.frameHeight / 2,
        //             rot: Utils.PIHalf,
        //             width: pos.width - SHEET.frameHeight / 2,
        //         };
        //         break;
        //     case EFlowFrom.Left:
        //         pos = {
        //             ...pos,
        //             x: 0.5 * 64 + SHEET.frameHeight / 2,
        //             y: 0.5 * 64,
        //             width: pos.width + SHEET.frameHeight / 2,
        //             rot: Utils.PI,
        //         };
        //         break;
        //     case EFlowFrom.Mid:
        //         pos = {
        //             ...pos,
        //             x: 0.5 * 64,
        //             y: 0.5 * 64,
        //             rot: 0,
        //             width: pos.width - SHEET.frameHeight / 2,
        //         };
        //         switch (this.#path.to) {
        //             case EFlowTo.Top:
        //                 pos = {
        //                     ...pos,
        //                     x: 0.5 * 64,
        //                     y: 0.5 * 64 - SHEET.frameHeight / 2,
        //                     rot: Utils.PIAndAHalf,
        //                     width: pos.width - SHEET.frameHeight / 2,
        //                 };
        //                 break;
        //             case EFlowTo.Right:
        //                 pos.x = 64;
        //                 pos.rot = Utils.PI;
        //                 break;
        //             case EFlowTo.Bottom:
        //                 pos.y = 64;
        //                 pos.rot = Utils.PIAndAHalf;
        //                 break;
        //         }
        //         break;
        // }
        // this.setRotation(pos.rot);
        // this.setDisplaySize(pos.width, pos.height);
        // this.#pos = pos;
        // this.setPosition(this.#field.x + pos.x, this.#field.y + pos.y);

        this.scene.addToLayer('ui', this);
    }

    update(...args) {
        super.update(...args);

        if (this.#pos) {
            if (this.displayWidth >= this.#pos.width && !this.activated) {
                this.expand = false;
                this.displayWidth = this.#pos.width;
                this.activated = true;
                this.emit(EVENTS.ACTIVATED, this);
            } else if (Math.round(this.displayWidth) === 0) {
                this.displayWidth = 0;
            }
            if (this.expand) {
                this.displayWidth += 60 / 60;
            } else {
                //console.log(this.displayWidth);
                // this.displayWidth -= this.#pos.width / 60;
            }
        }
    }

    activate() {
        if (!this.activated) this.expand = true;
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
}
