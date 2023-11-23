import { PixelDungeonEnemy } from '../sprites/pixel-dungeon.enemy';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';
import { PixelDungeonEngine } from './pixel-dungeon.engine';
import { PixelDungeonState } from './pixel-dungeon.state';
import { States } from './states';

export class MobsState extends PixelDungeonState {
    name = States.MobsTurn;
    // next = States.PlayersTurn;
    private mobs: PixelDungeonEnemy[];
    private current?: PixelDungeonEnemy;
    private player: PixelDungeonPlayer;

    next = () => {
        if (!this.current) {
            return States.PlayersTurn;
        } else {
            if (this.current.isNotMoving()) {
                if (this.engine.player.canSee(this.current)) {
                    this.current.moveOnRandomTile();
                    this.current.onceMoved(() => {
                        if (this.engine.player.canSee(this.current)) this.engine.updateFoV();
                        this.current = this.mobs.shift();
                    });
                } else {
                    this.current.moveOnRandomTile(true);
                    if (this.engine.player.canSee(this.current)) this.engine.updateFoV();
                    this.current = this.mobs.shift();
                    if (!this.current) {
                        return States.PlayersTurn;
                    }
                }
            }
        }
        return States.MobsTurn;
    };

    public enter(engine: PixelDungeonEngine) {
        super.enter(engine);
        console.log('enter start turn enemies');
        this.mobs = [engine.enemy, engine.enemy2];
        this.current = this.mobs.shift();
        this.player = engine.player;
    }

    public exit(p0) {
        console.log(p0, 'exit enemies turn');
    }
}
