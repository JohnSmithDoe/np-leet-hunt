import { AudioMixer } from './audio-mixer';

describe('AudioMixer', () => {
    const levels = { music: 0.8, ui: 1, weapons: 0.5, ambient: 0.7 };

    it('multiplies master and channel level for the effective gain', () => {
        const mixer = new AudioMixer(levels);
        mixer.master = 0.5;
        expect(mixer.gainFor('music')).toBeCloseTo(0.4);
        expect(mixer.gainFor('ui')).toBeCloseTo(0.5);
    });

    it('clamps channel and master volumes to 0..1', () => {
        const mixer = new AudioMixer(levels);
        mixer.setVolume('weapons', 5);
        expect(mixer.volume('weapons')).toBe(1);
        mixer.master = -3;
        expect(mixer.master).toBe(0);
    });

    it('mute zeroes a channel', () => {
        const mixer = new AudioMixer(levels);
        mixer.mute('ambient');
        expect(mixer.gainFor('ambient')).toBe(0);
    });

    it('does not mutate the levels passed in', () => {
        const mixer = new AudioMixer(levels);
        mixer.setVolume('music', 0.1);
        expect(levels.music).toBe(0.8);
    });
});
