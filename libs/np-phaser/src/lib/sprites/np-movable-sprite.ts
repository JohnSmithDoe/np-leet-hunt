import { NPGameObject, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';
import MoveToTask from 'phaser4-rex-plugins/plugins/behaviors/moveto/MoveTo';

export class NPMovableSprite extends Phaser.Physics.Arcade.Image implements NPGameObject {
    private moveTo!: MoveToTask;

    constructor(
        public override scene: NPScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture
    ) {
        super(scene, x, y, texture);
        this.setName('rocket');
    }

    public create(): void {
        // Navigation is driven entirely by MoveTo (transform-only — no physics body), which lets callers
        // fly the ship to a target. Free-fly keyboard control (the rex Ship behaviour) was removed.
        this.moveTo = new MoveToTask(this, { speed: 1200, rotateToTarget: true });
    }

    public moveToTarget(target: Phaser.Types.Math.Vector2Like) {
        this.moveTo.moveTo(target.x, target.y);
    }

    /** Estimated flight time (ms) from the current position to `target` at the move speed — lets callers sync other tweens to a move. */
    public travelDurationTo(target: Phaser.Types.Math.Vector2Like): number {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return this.moveTo.speed > 0 ? (distance / this.moveTo.speed) * 1000 : 0;
    }

    onceMoved(fn: () => void) {
        this.moveTo.once('complete', () => fn());
        return this;
    }
}
