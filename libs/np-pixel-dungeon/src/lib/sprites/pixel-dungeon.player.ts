import { EDirection, mapToRexPluginDirection } from '@shared/np-library';
import * as Phaser from 'phaser';
import FieldOfView from 'phaser3-rex-plugins/plugins/board/fieldofview/FieldOfView';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { SceneWithBoard, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonMap } from './pixel-dungeon.map';
import { PixelDungeonSprite, TPixelDungeonSpriteOptions } from './pixel-dungeon.sprite';

// this.makeAnimation('walk1', 1, 6);
// this.makeAnimation('walk2', 14, 19);
// this.makeAnimation('walk3', 27, 32);
// this.makeAnimation('walk4', 40, 45);
//
// this.makeAnimation('walk5', 53, 59);
// this.makeAnimation('walk6', 66, 72);
// this.makeAnimation('walk7', 79, 85);
// this.makeAnimation('walk8', 92, 98);
//
// this.makeAnimation('walk13', 157, 161);
// this.makeAnimation('walk14', 170, 174);
// this.makeAnimation('walk15', 183, 187);
// this.makeAnimation('walk16', 196, 200);
//
// this.makeAnimation('walk17', 209, 220);
// this.makeAnimation('walk18', 222, 233);
// this.makeAnimation('walk19', 235, 246);
// this.makeAnimation('walk20', 248, 259);

interface TPixelDungeonPlayerOptions extends TPixelDungeonSpriteOptions {
    fovRange?: number;
    fovConeAngle?: number;
}

const defaultOptions: TPixelDungeonPlayerOptions = {
    startingDirection: EDirection.N,
    lpcType: 'standard',
    fovRange: 10,
    moveRotate: false,
    moveSpeed: 200,
    fovConeAngle: undefined,
};

export class PixelDungeonPlayer extends PixelDungeonSprite {
    #fieldOfView: FieldOfView<Phaser.GameObjects.GameObject>;
    #currentView: TileXYType[];

    #options: TPixelDungeonPlayerOptions;

    constructor(public scene: Phaser.Scene & SceneWithBoard, options?: TPixelDungeonPlayerOptions) {
        super(scene, options);
        this.#options = Object.assign({}, defaultOptions, options ?? {});
    }

    preload() {
        this.key = 'brawler';
        this.scene.load.spritesheet('brawler', 'np-pixel-dungeon/Download96156.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    addToMap(map: PixelDungeonMap, start: TDungeonTile) {
        super.addToMap(map, start);
        this.#createFieldOfView();
    }

    #createFieldOfView() {
        this.#fieldOfView = this.scene.rexBoard.add.fieldOfView(this, {
            preTestCallback: (a, visiblePoints) => {
                const first = a[0];
                const target = a[a.length - 1];
                const distance = Phaser.Math.Distance.Snake(first.x, first.y, target.x, target.y);
                return !visiblePoints || distance <= visiblePoints;
            },
            coneMode: 'angle',
            cone: this.#options.fovConeAngle,
            costCallback: a => this.map.costs(a),
        });

        this.#fieldOfView.setFace(mapToRexPluginDirection(this.#options.startingDirection));
        this.#updateFoV();
    }

    #updateFoV() {
        this.map.loseVision(this.#currentView);
        this.#currentView = this.#fieldOfView.findFOV(this.#options.fovRange);
        // put the players tile into vision as well
        this.#currentView.push({ ...this.tile });
        this.map.gainVision(this.#currentView);
    }

    moveToNext() {
        super.moveToNext();
        this.#fieldOfView.setFace(this.moveToDirection);
        this.#updateFoV();
    }
}
