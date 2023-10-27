import { ParadroidEngine } from './paradroid.engine';
import { EParadroidDifficulty, EParadroidOwner } from './paradroid.types';
import { StateMachine } from './stateMachine';

interface TParadroidContainerOptions {
    player?: string;
    droid?: string;
    image?: string;
    rowCount?: number;
    colCount?: number;
    shapeSize?: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions: TParadroidContainerOptions = {
    player: 'CImages.Player.Small',
    droid: 'CImages.Droid.Small',
    rowCount: 12,
    colCount: 10,
    shapeSize: 64,
    image: 'CImages.Paradroid.Background',
};

enum States {
    Waiting,
    Creating,
    Playing,
}

export class ParadroidContainer extends StateMachine {
    options: TParadroidContainerOptions = defaultOptions;

    private engine: ParadroidEngine;
    private game = [];
    // private binaryTimer: BinaryTimer;

    constructor() {
        super();
        this.engine = new ParadroidEngine(
            this.options.colCount,
            this.options.rowCount,
            this.options.shapeSize,
            EParadroidDifficulty.Hard
        );
        // this.addChild(this.stage.screenshot);
        // this.binaryTimer = new BinaryTimer(stage, {
        //     timerWidth: 250,
        //     y: 10,
        //     x: stage.baseResolution.x - 260,
        //     displayText: true,
        //     startTime: 5 * 1000,
        // });
        // this.binaryTimer.onTimerEnded.once(this.onGameChoosen, this);
        // this.startBtn = new Button(this.stage, { title: 'choose', x: 200 });
        // this.startBtn.onClick.add(this.onGameChoosen, this);
        this.game = this.engine.generateBoard();
        console.log(this.game);
        this.state_recreate_game();
        // this.game.position.x = (this.stage.baseResolution.x - this.game.getBounds().width) / 2;
        // this.recreateBtn = new Button(this.stage, { title: 'recreate' });
        // this.recreateBtn.onClick.add(this.onStartCreating, this);
        // this.splashVsIntro = new SplashVsElement(this.stage, { hiddenAndPaused: false }, this, this.onStartCreating);
        // this.splashGo = new SplashImageElement(
        //     this.stage,
        //     {
        //         frames: [CImages.Splash.Three, CImages.Splash.Two, CImages.Splash.One, CImages.Splash.Fight],
        //         hiddenAndPaused: true,
        //     },
        //     this,
        //     this.onStartPlaying
        // );
        //
        // this.addChild(this.binaryTimer);
        // this.addChild(this.game);
        // this.addChild(this.splashGo);
        // this.addChild(this.recreateBtn);
        // this.addChild(this.startBtn);
        this.addState(States.Waiting, this.state_waiting.bind(this))
            .addState(States.Creating, this.state_recreate_game.bind(this))
            .addState(States.Playing, this.state_playing.bind(this))
            .setState(States.Waiting);
    }

    private state_waiting(): void {
        // nop
    }

    private state_playing(): void {
        // this.game.alpha = Math.min(this.game.alpha + .01,  1);
        if (this.waitFor(1000)) {
            this.engine.executeAiMove();
        }
        this.engine.update();
    }

    private state_recreate_game(): void {
        let created: boolean = false;
        if (!this.engine.checkGridStructure(EParadroidOwner.Droid)) {
            this.engine.createTileGrid(EParadroidOwner.Droid);
            created = true;
        }
        if (!this.engine.checkGridStructure(EParadroidOwner.Player)) {
            this.engine.createTileGrid(EParadroidOwner.Player);
            created = true;
        }
        if (!created) {
            // this.stage.ui.overlay.hide();
            this.setState(States.Waiting);
        }
    }

    private onStartPlaying(): void {
        // this.binaryTimer.setStartTime(10 * 1000);
        // this.binaryTimer.onTimerEnded.once(this.onEndPlaying, this);
        this.engine.startPlay();
        this.setState(States.Playing);
    }

    private onStartCreating(): void {
        // this.stage.ui.overlay.show();
        this.engine.resetTileGrids();
        // this.binaryTimer.reset();
        this.setState(States.Creating);
    }

    private onGameChoosen(): void {
        // this.startBtn.hide(true);
        // this.recreateBtn.hide(true);
        // this.splashGo.show(true);
    }

    private onEndPlaying(): void {
        // mpü
    }
}
