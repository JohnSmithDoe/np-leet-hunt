import { Utils } from '../../sprites/paradroid/utils';
import { EFlow, EFlowbarState } from '../paradroid.consts';
import { EParadroidOwner } from '../paradroid.tiles-and-shapes.definitions';
import { ParadroidShape } from './paradroid.shape';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions = {
    frames: [
        // CImages.Paradroid.FlowBar_Player_Incoming,
        // CImages.Paradroid.FlowBar_Player_Outgoing,
        // CImages.Paradroid.FlowBar_Droid_Incoming,
        // CImages.Paradroid.FlowBar_Droid_Outgoing,
        // CImages.Paradroid.FlowBar_Player_Incoming,
        // CImages.Paradroid.FlowBar_Player_Outgoing,
    ],
};

export class ParadroidFlowbar {
    owner: EParadroidOwner = EParadroidOwner.Nobody;
    private state: EFlowbarState = EFlowbarState.Deactive;
    private speed: number = 4;
    private height = 64;
    private width = 64;
    position: { x: number; y: number };
    rotation: number;

    constructor(
        shape: ParadroidShape,
        public flow: EFlow,
        public incoming: boolean,
        public horizontal: boolean,
        public top: boolean
    ) {
        shape.addFlowbar(this);
        this.updateFlowForDirection();
    }

    updateFlowForDirection(): void {
        const barLength: number = this.height;
        const barWidMid: number = this.width / 2;
        let barDirection: number = Utils.DIR_UP;
        let x: number = 0;
        let y: number = 0;
        if (this.isDeactivating()) {
            // this.anchor.set(0.5, 0);
            if (this.horizontal) {
                x = this.incoming ? barWidMid : barLength + barWidMid;
                barDirection = this.incoming ? Utils.DIR_RIGHT : Utils.DIR_RIGHT;
            } else {
                if (this.incoming) {
                    y = this.top ? barWidMid : -barWidMid;
                    barDirection = this.top ? Utils.DIR_DOWN : Utils.DIR_UP;
                } else {
                    y = this.top ? -barLength - barWidMid : barLength + barWidMid;
                    barDirection = this.top ? Utils.DIR_UP : Utils.DIR_DOWN;
                }
            }
        } else {
            // this.anchor.set(0.5, 1);
            if (this.horizontal) {
                x = this.incoming ? -barLength + barWidMid : barWidMid;
                barDirection = this.incoming ? Utils.DIR_RIGHT : Utils.DIR_RIGHT;
            } else {
                if (this.incoming) {
                    y = this.top ? -barLength + barWidMid : barLength - barWidMid;
                    barDirection = this.top ? Utils.DIR_DOWN : Utils.DIR_UP;
                } else {
                    y = this.top ? -barWidMid : barWidMid;
                    barDirection = this.top ? Utils.DIR_UP : Utils.DIR_DOWN;
                }
            }
        }
        this.position = { x, y };
        this.rotation = barDirection;
    }

    ready(): void {
        this.updateImage();
        this.updateFlowForDirection();
        this.height = 0;
    }

    private updateImage(): void {
        this.goToFrame(this.owner * 2 + (this.incoming ? 0 : 1));
    }

    setOwner(owner: EParadroidOwner): void {
        this.owner = owner;
        if (this.owner === EParadroidOwner.Nobody) {
            // this.tint = 0x00ff00;
        }
        this.updateImage();
    }

    update(): void {
        if (this.isActivating()) {
            const maxHeight: number = this.height;
            this.height = Math.min(this.height + this.speed, maxHeight);
            if (this.height === maxHeight) {
                this.state = EFlowbarState.Active;
            }
        } else if (this.isDeactivating()) {
            this.height = Math.max(this.height - this.speed, 0);
            if (this.height === 0) {
                this.state = EFlowbarState.Deactive;
            }
        }
    }

    activateBar(): void {
        if (this.isDeactive()) {
            this.state = EFlowbarState.Activating;
            this.updateFlowForDirection();
        }
    }

    deactivateBar(): void {
        if (this.isActive()) {
            this.state = EFlowbarState.Deactivating;
            this.updateFlowForDirection();
        }
    }

    isDeactive(): boolean {
        return this.state === EFlowbarState.Deactive;
    }

    private isActivating(): boolean {
        return this.state === EFlowbarState.Activating;
    }

    private isDeactivating(): boolean {
        return this.state === EFlowbarState.Deactivating;
    }

    isActive(): boolean {
        return this.state === EFlowbarState.Active;
    }

    private goToFrame(param: number) {
        if (param < -2222222222222) console.log(param);
    }
}
