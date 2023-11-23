import { PixelDungeonEngine } from './pixel-dungeon.engine';
import { PixelDungeonState } from './pixel-dungeon.state';
import { States } from './states';

export class PlayerState extends PixelDungeonState {
    name = States.PlayersTurn;

    private hasMoved = false;
    next = () => {
        const player = this.engine.player;
        if (player.isMoving()) {
            this.hasMoved = true;
            return States.PlayersTurn;
        }
        // has more moving to do in the next round
        if (player.hasMoves() || this.hasMoved) return States.MobsTurn;
        // nothing to move -> wait for input
        return States.PlayersTurn;
    };

    public enter(engine: PixelDungeonEngine) {
        super.enter(engine);
        console.log('enter players turn', engine.player, this);
        this.hasMoved = false;
        const player = this.engine.player;
        if (player.hasMoves()) {
            player.moveToNext();
        }
        // apply stuff that happens when the players turn start
        // e.g. oxygen is running out
        // could be done in start turn
        // how do i wait for stuff?
    }

    public exit() {
        console.log('exit players turn');
    }
}
