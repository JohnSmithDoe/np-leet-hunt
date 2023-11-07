import * as Phaser from 'phaser';

import { EFlowFrom, EParadroidShape } from '../../paradroid/paradroid.consts';
import { TParadroidFx, TParadroidSubTile } from '../../paradroid/paradroid.types';
import { isCombineShape, isExpandShape } from '../../paradroid/paradroid.utils';
import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent, NPSceneContainer } from '../../scenes/np-scene-component';
import { EVENTS, ParadroidPath } from './paradroid.path';

const SHEET = { key: 'pipes', url: 'np-phaser/paradroid/assets/paradroid.png', frameWidth: 120, frameHeight: 120 };

type SHAPES =
    | 'bottom_endCap'
    | 'bottom_left_elbow'
    | 'cross'
    | 'empty'
    | 'left_endCap'
    | 'right_bottom_elbow'
    | 'right_bottom_left_tee'
    | 'right_endCap'
    | 'right_left_straight'
    | 'top_bottom_left_tee'
    | 'top_bottom_straight'
    | 'top_endCap'
    | 'top_left_elbow'
    | 'top_right_bottom_tee'
    | 'top_right_elbow'
    | 'top_right_left_tee';

interface FieldDefinition {
    frame: number;
}

const SHAPE_DEFINITIONS: Record<SHAPES, FieldDefinition> = {
    bottom_endCap: { frame: 0 },
    bottom_left_elbow: { frame: 3 },
    cross: { frame: 6 },
    empty: { frame: 12 },
    left_endCap: { frame: 15 },
    right_bottom_elbow: { frame: 1 },
    right_bottom_left_tee: { frame: 2 },
    right_endCap: { frame: 13 },
    right_left_straight: { frame: 14 },
    top_bottom_left_tee: { frame: 7 },
    top_bottom_straight: { frame: 4 },
    top_endCap: { frame: 8 },
    top_left_elbow: { frame: 11 },
    top_right_bottom_tee: { frame: 5 },
    top_right_elbow: { frame: 9 },
    top_right_left_tee: { frame: 10 },
};

const shapeToFieldDefinition = (shape: EParadroidShape) => {
    switch (shape) {
        case EParadroidShape.Empty:
            return SHAPE_DEFINITIONS.empty;
        case EParadroidShape.IShape:
            return SHAPE_DEFINITIONS.right_left_straight;
        case EParadroidShape.Deadend:
            return SHAPE_DEFINITIONS.left_endCap;
        case EParadroidShape.LShapeLeftUp:
            return SHAPE_DEFINITIONS.top_left_elbow;
        case EParadroidShape.LShapeLeftDown:
            return SHAPE_DEFINITIONS.bottom_left_elbow;
        case EParadroidShape.LShapeUpRight:
            return SHAPE_DEFINITIONS.right_bottom_elbow;
        case EParadroidShape.LShapeDownRight:
            return SHAPE_DEFINITIONS.top_right_elbow;
        case EParadroidShape.TShapeDownCombine:
            return SHAPE_DEFINITIONS.right_bottom_left_tee;
        case EParadroidShape.TShapeDownExpand:
            return SHAPE_DEFINITIONS.right_bottom_left_tee;
        case EParadroidShape.TShapeUpCombine:
            return SHAPE_DEFINITIONS.top_right_left_tee;
        case EParadroidShape.TShapeUpExpand:
            return SHAPE_DEFINITIONS.top_right_left_tee;
        case EParadroidShape.TShapeUpDownExpand:
            return SHAPE_DEFINITIONS.top_bottom_left_tee;
        case EParadroidShape.TShapeUpDownCombine:
            return SHAPE_DEFINITIONS.top_right_bottom_tee;
        case EParadroidShape.XShapeExpand:
            return SHAPE_DEFINITIONS.cross;
        case EParadroidShape.XShapeCombine:
            return SHAPE_DEFINITIONS.cross;
    }
};

export class ParadroidField extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    #subTile: TParadroidSubTile;
    #paths: NPSceneContainer<ParadroidPath>;
    #options: { width: number; height?: number; interactive?: boolean };

    constructor(
        public scene: NPScene,
        subTile: TParadroidSubTile,
        options: { width: number; height?: number; interactive?: boolean }
    ) {
        super(scene, 0, 0, '');
        this.#subTile = subTile;
        this.#options = options;
        this.#paths = new NPSceneContainer<ParadroidPath>(scene);

        const width = this.#options.width;
        const height = this.#options.height ?? width;
        const x = this.#subTile.col * width;
        const y = this.#subTile.row * height;
        this.setName(`${this.#subTile.col}_${this.#subTile.row}`).setOrigin(0).setPosition(x, y);

        for (const path of this.#subTile.paths) {
            const paradroidPath = new ParadroidPath(this.scene, this, path);
            paradroidPath.on(EVENTS.ACTIVATED, (p: ParadroidPath) => this.#onPathActivated(p));
            paradroidPath.on(EVENTS.DEACTIVATED, (p: ParadroidPath) => this.#onPathDeactivated(p));
            this.#paths.add(paradroidPath);
        }

        if (options.interactive) this.setInteractive({ useHandCursor: true });
    }

    init(): void {
        this.#paths.init();
    }

    preload(): void {
        if (!this.scene.textures.exists(SHEET.key)) {
            this.scene.load.spritesheet(SHEET.key, SHEET.url, SHEET);
        }
        this.#paths.preload();
    }

    create(container?: Phaser.GameObjects.Container): void {
        const def = shapeToFieldDefinition(this.#subTile.shape);

        this.setTexture(SHEET.key, def.frame).setDisplaySize(
            this.#options.width,
            this.#options.height ?? this.#options.width
        );
        container?.add(this);
        this.#paths.create(container);
        let g: Phaser.GameObjects.Graphics;
        const size = Math.min(this.#options.width, this.#options.height ?? Number.MAX_SAFE_INTEGER) / 4;
        const center = this.getCenter();
        const x = center.x - size / 2;
        const y = center.y - size / 2;
        if (isCombineShape(this.#subTile.shape) || isExpandShape(this.#subTile.shape)) {
            g = this.scene.make.graphics({ fillStyle: { alpha: 0.1, color: 0xff0000 } });
            g.fillRect(x, y, size, size);
            container?.add(g);
        } else {
            const fxType = this.#paths.list.reduce(
                (fx, path) => (fx !== 'none' ? fx : path.fx),
                'none' as TParadroidFx
            );
            switch (fxType) {
                case 'fx-autofire':
                    g = this.scene.make.graphics({ fillStyle: { alpha: 1, color: 0x00ff00 } });
                    g.fillRect(x, y, size, size);
                    container?.add(g);
                    break;
                case 'fx-changer':
                    g = this.scene.make.graphics({ fillStyle: { alpha: 1, color: 0x0000ff } });
                    g.fillRect(x, y, size, size);
                    container?.add(g);
                    break;
            }
        }
    }

    update(...args) {
        super.update(...args);
        this.#paths.update(...(args as [number, number]));
    }

    get col() {
        return this.#subTile.col;
    }

    get row() {
        return this.#subTile.row;
    }

    get tileWidth() {
        return this.#options.width;
    }

    get tileHeight() {
        return this.#options.height ?? this.tileWidth;
    }

    activate(from: EFlowFrom = EFlowFrom.Left) {
        console.log(from);
        this.#paths.list.filter(p => p.from === from).forEach(p => p.activate());
    }

    deactivate(from: EFlowFrom = EFlowFrom.Left) {
        console.log(from);
        this.#paths.list.filter(p => p.from === from).forEach(p => p.deactivate());
    }

    #onPathActivated(path: ParadroidPath) {
        if (path.isIncoming && this.isActive()) {
            // all active -> activate outgoing
            this.#paths.list.filter(p => !p.isIncoming).forEach(p => p.activate());
        } else if (!path.isIncoming) {
            // activate next
            this.emit('activate_next', this, path);
        }
    }

    #onPathDeactivated(path: ParadroidPath) {
        console.log('path deactiv on');

        if (path.isIncoming) {
            // not all active -> deactivate outgoing
            this.#paths.list.filter(p => !p.isIncoming).forEach(p => p.deactivate());
        } else if (!path.isIncoming) {
            // deactivate next
            this.emit('deactivate_next', this, path);
        }
    }

    private isActive() {
        return this.#paths.list.reduce((isActive, path) => isActive && (!path.isIncoming || path.isActive), true);
    }
}
