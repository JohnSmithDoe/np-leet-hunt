import { EParadroidSpecialFX } from '../paradroid.consts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions = {
    anchor: 0.5,
    frames: [
        // CImages.Paradroid.SpecialFx_Combine,
        // CImages.Paradroid.SpecialFx_Changer,
        // CImages.Paradroid.SpecialFx_Autofire,
    ],
};

export class ParadroidSpecialFX {
    constructor(public type: EParadroidSpecialFX) {}

    ready(): void {
        // this.goToFrame(this.type);
    }
}
