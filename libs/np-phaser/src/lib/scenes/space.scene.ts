/* eslint-disable no-magic-numbers */
import * as Phaser from 'phaser';
import MouseWheelScroller from 'phaser3-rex-plugins/plugins/input/mousewheelscroller/MouseWheelScroller';

import { NPSpaceMap } from '../container/np-space-map';
import { createSpeechBubble } from '../factories/graphics.factory';
// eslint-disable-next-line import/no-cycle
import { StageService } from '../service/stage.service';
import { NPMovableSprite } from '../sprites/np-movable-sprite';
import { Pipe } from '../sprites/paradroid/pipe';
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

    constructor(private npStage: StageService) {
        super({ key: 'space-scene' });
    }

    async setupComponents() {
        this.map = new NPSpaceMap(this);
        this.addComponent(this.map);
        this.pipes = [
            new Pipe(this, 'top_right_left_tee').setPosition(500 + 120, 0),
            new Pipe(this, 'right_left_straight').setPosition(500 + 120 + 120, 0),
            new Pipe(this, 'right_bottom_left_tee').setPosition(500 + 120 + 120 + 120, 0),
            new Pipe(this, 'cross').setPosition(500 + 120 + 120 + 120 + 120, 0),
            new Pipe(this, 'left_endCap').setPosition(500 + 120 + 120 + 120 + 120 + 120, 0),
        ];
        // this.addComponent(this.pipes);
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
        this.physics.world.setBounds(0, 0, this.scale.gameSize.width, this.scale.gameSize.height);
        this.physics.enableUpdate();
        //  World size is 8000 x 6000

        // this.ts = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, this.map.backgroundKey).setName('tiley').setOrigin(0, 0);
        console.log('forge.scene.ts', 'Creating Assets...', this.scale.width, this.scale.height);
        //  Our container

        // this.addToLayer('ui', text);
        this.rocket = new NPMovableSprite(this, 128, 128, 'rocket').setScale(0.5);
        // this.add.existing(this.rocket);
        // this.map.addShip(this.rocket);
        // this.addToLayer('np', this.pipes);
        this.addToLayer('np', this.rocket);
        // this.zoomIn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        // this.zoomOut = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.cameras.main.startFollow(this.rocket);
        console.log(this.cameras);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);

        // this.createSpeechBubble(20, 20, 320, 160, '“Twin ceramic rotor drives on each wheel! And these look like computer controlled anti-lock brakes! Wow, 200 horses at 12,000 rpm!”');
        //
        // this.createSpeechBubble(
        //     370,
        //     120,
        //     400,
        //     180,
        //     "“Kaneda, you've always been a pain in the ass, you know. You've been telling me what to do since we were kids. You always treat me like a kid. You always show up and start bossing me around, and don't you deny it!”"
        // );

        const bubble = createSpeechBubble(this, 70, 400, 250, 100, "“And now you're a boss, too... of this pile of rubble.”");
        this.addToLayer('np', bubble);
    }

    update(time: number, delta: number) {
        // this.map.update(time, delta);
        this.rocket.update(delta);

        this.debugOut(['rocket', vectorToStr(this.rocket.getCenter()), 'fps', `${this.game.loop.actualFps}`, 'planets', `${this.map.list.length}`]);
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
}
