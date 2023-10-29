import * as Phaser from 'phaser';
import MouseWheelScroller from 'phaser3-rex-plugins/plugins/input/mousewheelscroller/MouseWheelScroller';

import { NPSpaceMap } from '../container/np-space-map';
import { createSpeechBubble } from '../factories/graphics.factory';
import { ParadroidContainer } from '../paradroid/old/paradroid.container';
import { ParadroidFactory } from '../paradroid/paradroid.factory';
import { EParadroidShape } from '../paradroid/paradroid.tiles-and-shapes.definitions';
import { TParadroidSubTile } from '../paradroid/paradroid.types';
import { StageService } from '../service/stage.service';
import { TextButton } from '../sprites/button/text-button';
import { NPMovableSprite } from '../sprites/np-movable-sprite';
import { Pipe } from '../sprites/paradroid/pipe';
import { Reality } from '../sprites/reality/reality';
import { OnSceneCreate, OnSceneInit, OnScenePreload } from '../types/np-phaser';
import { vectorToStr } from '../utilities/np-phaser-utils';
import { NPScene } from './np-scene';

export class SpaceScene extends NPScene implements OnScenePreload, OnSceneCreate, OnSceneInit {
    iter = 0;
    private container: Phaser.GameObjects.Container;
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private rocket: NPMovableSprite;
    private zoomIn: Phaser.Input.Keyboard.Key;
    private zoomOut: Phaser.Input.Keyboard.Key;
    private map: NPSpaceMap;
    private stars: Phaser.GameObjects.TileSprite;

    private pipes: Pipe[] = [];
    private p: ParadroidContainer;
    private gs = [];

    constructor(private npStage: StageService) {
        super({ key: 'space-scene' });
    }

    async setupComponents() {
        this.map = new NPSpaceMap(this);
        this.addComponent(this.map);
        this.addComponent(new Reality(this, 'reality1'));

        // for (let i = 0; i < Object.keys(PIPE_DEFINITIONS).length; i++) {
        //     const def = Object.keys(PIPE_DEFINITIONS)[i] as keyof typeof PIPE_DEFINITIONS;
        //     this.pipes.push(new Pipe(this, def).setPosition(500 + i * 64, 440));
        // }
        // this.addComponent(this.pipes);
        // this.p = new ParadroidContainer();
        // for (const tile of this.p.engine.player_grid.children) {
        //     for (const shape of tile.shapes) {
        //         const pipe = this.pipeForShape(shape);
        //         pipe.setPosition(tile.pos.x + shape.pos.x, tile.pos.y + shape.pos.y);
        //         this.addComponent(pipe);
        //     }
        // }
        this.generateStuff();
        this.addComponent(this.pipes);
    }

    private generateStuff() {
        this.pipes = [];
        this.gs = [];
        const f = new ParadroidFactory();
        const grid = f.generateGrid();
        for (const tileCol of grid) {
            for (const tile of tileCol) {
                for (const subTile of tile.subTiles) {
                    this.pipes.push(this.pipeForShape(subTile).setPosition(subTile.x, subTile.y));
                    Object.values(subTile.flow).forEach(bar => {
                        if (!bar) return;
                        const g = this.make.graphics({ fillStyle: { alpha: 0.5, color: 0xff0000 } });
                        g.fillRect(bar.x, bar.y, bar.width, bar.height);
                        this.gs.push(g);
                    });
                }
            }
        }
    }

    init() {
        super.init();
        this.scale.baseSize.setSize(1920, 1080);
        const scroller = new MouseWheelScroller(this, {
            enable: true,
            speed: 0.1,
            focus: true,
        });
        scroller.on('scroll', (inc: number, gameObject: unknown, scroll: unknown) => {
            console.log(inc, gameObject, scroll);
        });
    }

    preload() {
        console.log('Preloading Assets...');
        super.preload();
        // * Now load the background image
        this.load.image('rocket', 'assets/rocket.png');
        this.load.image('space-eyes', 'assets/example/eyes.png');
    }

    /**
     * * Phaser will only call create after all assets in Preload have been loaded
     */
    create() {
        super.create();
        this.gs.forEach(g => this.addToLayer('ui', g));
        this.physics.world.setBounds(0, 0, this.scale.gameSize.width, this.scale.gameSize.height);
        this.physics.enableUpdate();
        //  World size is 8000 x 6000

        // this.ts = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, this.map.backgroundKey).setName('tiley').setOrigin(0, 0);
        console.log('forge.scene.ts', 'Creating Assets...', this.scale.width, this.scale.height);
        //  Our container

        // this.addToLayer('ui', text);
        this.rocket = new NPMovableSprite(this, 5000, 5000, 'rocket').setScale(0.5);
        // this.add.existing(this.rocket);
        // this.map.addShip(this.rocket);
        // this.addToLayer('np', this.pipes);
        this.addToLayer('np', this.rocket);
        // this.zoomIn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        // this.zoomOut = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.cameras.main.startFollow(this.rocket).setZoom(0.035);
        const zoomInTxtBtn = new TextButton(this, 500, 10, 'Zoom In');
        zoomInTxtBtn.on('pointerup', () => {
            this.cameras.main.setZoom(this.cameras.main.zoom + 0.1);
        });
        this.addToLayer('ui', zoomInTxtBtn);

        const recreateBtn = new TextButton(this, 600, 10, 'Re-Create');
        recreateBtn.on('pointerup', () => {
            this.removeFromLayer('ui', this.pipes);
            this.removeFromLayer('ui', this.gs);
            this.generateStuff();
            this.pipes.forEach(p => p.create());
            this.gs.forEach(g => this.addToLayer('ui', g));
        });
        this.addToLayer('ui', recreateBtn);

        const zoomOutTxtBtn = new TextButton(this, 700, 10, 'Zoom Out');
        zoomOutTxtBtn.on('pointerup', () => {
            this.cameras.main.setZoom(this.cameras.main.zoom - 0.1);
        });
        this.addToLayer('ui', zoomOutTxtBtn);

        console.log(this.cameras);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
        const bubble = createSpeechBubble(
            this,
            70,
            400,
            250,
            100,
            "“And now you're a boss, too... of this pile of rubble.”"
        );
        this.addToLayer('np', bubble);
    }

    update(time: number, delta: number) {
        // this.map.update(time, delta);
        this.rocket.update(delta);
        const debugMsg = [
            'rocket',
            vectorToStr(this.rocket.getCenter()),
            'fps',
            `${this.game.loop.actualFps}`,
            'planets',
            `${this.map.list.length}`,
            'zoom',
            `${this.cameras.main.zoom}`,
            't',
            `${Phaser.Math.Distance.BetweenPoints({ x: -100, y: -100 }, { x: 100, y: 100 })}`,
            `${Phaser.Math.Distance.BetweenPoints({ x: 0, y: 0 }, { x: 200, y: 200 })}`,
        ];
        this.debugOut(debugMsg);
        // this.ts.tilePositionX = Math.cos(-this.iter) * 400;
        // this.ts.tilePositionY = Math.sin(-this.iter) * 400;
        this.iter += 0.01;
        // const value = -1 * this.iter * 100;
        super.update(time, delta);
        // this.stars.tilePositionX = -1 * value;
        // if (this.zoomIn.isDown || this.zoomOut.isDown) {
        //     this.resize();
        // }
        // const worldView = this.controls.camera.worldView;
        // this.rocket.setPosition(worldView.centerX, worldView.centerY);
    }

    /**
     * * When the screen is resized, we
     *
     * @param gameSize
     */
    resize(gameSize?: Phaser.Structs.Size): void {
        console.log('resize');
        this.cameras.cameras.forEach(cam => console.log(cam.renderList));
        const { width, height } = gameSize || this.scale.gameSize;
        this.cameras.resize(width, height);
        // this.stars.setSize(width, height);
        //this.ts.setTileScale(this.controls.camera.zoomX);
        // const worldBounds = this.controls.camera.worldView;
        // console.log(worldBounds);
        // //this.ts.setTileScale();
        // this.ts.setPosition(worldBounds.x, worldBounds.y);
        // this.ts.setSize(worldBounds.width, worldBounds.height);
        // console.log(this.controls.camera);
    }

    private pipeForShape(subTile?: TParadroidSubTile) {
        switch (subTile?.shape) {
            case EParadroidShape.Empty:
                return new Pipe(this, 'empty');
            case EParadroidShape.IShape:
                return new Pipe(this, 'right_left_straight');
            case EParadroidShape.Deadend:
                return new Pipe(this, 'left_endCap');
            case EParadroidShape.LShapeLeftUp:
                return new Pipe(this, 'top_left_elbow');
            case EParadroidShape.LShapeLeftDown:
                return new Pipe(this, 'bottom_left_elbow');
            case EParadroidShape.LShapeUpRight:
                return new Pipe(this, 'right_bottom_elbow');
            case EParadroidShape.LShapeDownRight:
                return new Pipe(this, 'top_right_elbow');
            case EParadroidShape.TShapeDownCombine:
                return new Pipe(this, 'right_bottom_left_tee');
            case EParadroidShape.TShapeDownExpand:
                return new Pipe(this, 'right_bottom_left_tee');
            case EParadroidShape.TShapeUpCombine:
                return new Pipe(this, 'top_right_left_tee');
            case EParadroidShape.TShapeUpExpand:
                return new Pipe(this, 'top_right_left_tee');
            case EParadroidShape.TShapeUpDownExpand:
                return new Pipe(this, 'top_bottom_left_tee');
            case EParadroidShape.TShapeUpDownCombine:
                return new Pipe(this, 'top_right_bottom_tee');
            case EParadroidShape.XShapeExpand:
                return new Pipe(this, 'cross');
            case EParadroidShape.XShapeCombine:
                return new Pipe(this, 'cross');
        }
    }
}
