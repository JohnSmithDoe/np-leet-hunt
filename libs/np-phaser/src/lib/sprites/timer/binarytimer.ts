import { EventEmitter } from '@angular/core';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';
import { NPTimer } from '../../utilities/np-timer';
import { rng } from '../paradroid/utils';

interface TBinareTimerOptions {
    startTime?: number; // if set counts down to zero
    endTime?: number; // if set counts up to this time // if none are set counts up to infinity
    timerWidth?: number;
    timerHeight?: number;
    textFill?: string;
    textStroke?: string;
    zeroColor?: number;
    oneColor?: number;
    frameColor?: number;
    barStrokeColor?: number;

    displayText?: boolean;
    hour?: boolean;
    min?: boolean;
    sec?: boolean;
    ms?: boolean;
}

const defaultOptions: TBinareTimerOptions = {
    timerWidth: 250,
    timerHeight: 50,
    textFill: '#4dd3f6',
    textStroke: '#042b2c',
    zeroColor: 0x042b2c,
    oneColor: 0x045b5c,
    frameColor: 0x04c6c7,
    barStrokeColor: 0x000000,
    displayText: true,
    hour: false,
    min: true,
    sec: true,
    ms: true,
};

export class BinaryTimer extends Phaser.GameObjects.Graphics implements NPSceneComponent {
    options: TBinareTimerOptions;
    onTimerEnded = new EventEmitter();

    #startTime: number;
    #barWidth: number;
    #barHeight: number;
    #text: Phaser.GameObjects.Text;
    #frenzyMode: boolean = false;
    #timer = new NPTimer();

    constructor(public scene: NPScene, options?: TBinareTimerOptions) {
        super(scene, { x: 0, y: 0 });
        this.options = options ? Object.assign(defaultOptions, options) : defaultOptions;
        let digits: number = 0;
        digits += this.options.hour ? 2 : 0;
        digits += this.options.min ? 2 : 0;
        digits += this.options.sec ? 2 : 0;
        digits += this.options.ms ? 1 : 0;
        this.#barWidth = (this.options.timerWidth - digits) / digits; // digits bars and digits gaps
        this.#barHeight = (this.options.timerHeight - 3) / 4; // 4 bars and 3 gaps
        if (this.options.displayText) {
            const config: Phaser.Types.GameObjects.Text.TextStyle = {
                color: this.options.textFill,
                stroke: this.options.textStroke,
            };
            this.#text = this.scene.make.text(config, false);
            this.#text.setOrigin(0.5);
            this.#text.setPosition(this.options.timerWidth / 2, this.options.timerHeight / 2);
            this.#text.alpha = 0.75;
        }
    }

    reset(): void {
        this.#frenzyMode = false;
        this.#startTime = Date.now();
    }

    create(container?: Phaser.GameObjects.Container): void {
        container?.add(this);
        container?.add(this.#text);
    }

    update(): void {
        super.update();
        let time: number;
        let reachedEnd: boolean = false;
        if (this.#frenzyMode) {
            time = rng(1000 * 60 * 60 * 24);
        } else {
            time = this.#getTime();
            if ((reachedEnd = this.#reachedEnd(time))) {
                this.onTimerEnded.emit();
                this.#frenzyMode = true;
            }
        }
        const dodraw: boolean = this.#timer.waitFor(100) || reachedEnd;
        if (dodraw) {
            const ms: number = Math.trunc((time % 1000) / 100);
            const s: number = Math.trunc(time / 1000) % 60;
            const m: number = Math.trunc(time / 1000 / 60) % 60;
            const h: number = Math.trunc(time / 1000 / 60 / 60) % 24;
            const hpre: number = Math.trunc(h / 10);
            const hsuf: number = h % 10;
            const mpre: number = Math.trunc(m / 10);
            const msuf: number = m % 10;
            const spre: number = Math.trunc(s / 10);
            const ssuf: number = s % 10;
            this.#drawBars(hpre, hsuf, mpre, msuf, spre, ssuf, ms);
            if (this.options.displayText && (!this.#frenzyMode || reachedEnd)) {
                this.#updateText(hpre, hsuf, mpre, msuf, spre, ssuf, ms);
            }
        }
    }

    #drawBounds(): BinaryTimer {
        this.lineStyle(1, this.options.frameColor, 1).strokeRect(
            0,
            0,
            this.options.timerWidth,
            this.options.timerHeight
        );
        return this;
    }

    #drawDigit(digit: number, position: number): BinaryTimer {
        let binary: string = digit.toString(2);
        while (binary.length < 4) {
            binary = '0' + binary;
        }
        let idx: number = 0;
        for (const ch of binary) {
            const color: number = ch === '0' ? this.options.zeroColor : this.options.oneColor;
            const alpha: number = ch === '0' ? 0.3 : 0.5;
            this.lineStyle(1, this.options.barStrokeColor, 0.9)
                .fillStyle(color, alpha)
                .fillRect(
                    position * this.#barWidth + position,
                    idx * this.#barHeight + idx,
                    this.#barWidth,
                    this.#barHeight
                );
            idx++;
        }
        return this;
    }

    #getTime(): number {
        if (!this.#startTime) {
            this.reset();
        }
        let time: number = Date.now() - this.#startTime;
        if (this.options.startTime) {
            time = Math.max(this.options.startTime - time, 0);
        } else {
            if (this.options.endTime) {
                time = Math.min(time, this.options.endTime);
            }
        }
        return time;
    }

    #drawBars(hpre: number, hsuf: number, mpre: number, msuf: number, spre: number, ssuf: number, ms: number): void {
        this.clear();
        let currentPosition: number = 0;
        if (this.options.hour) {
            this.#drawDigit(hpre, currentPosition++).#drawDigit(hsuf, currentPosition++);
        }
        if (this.options.min) {
            this.#drawDigit(mpre, currentPosition++).#drawDigit(msuf, currentPosition++);
        }
        if (this.options.sec) {
            this.#drawDigit(spre, currentPosition++).#drawDigit(ssuf, currentPosition++);
        }
        if (this.options.ms) {
            this.#drawDigit(ms, currentPosition);
        }
        this.#drawBounds();
    }

    #updateText(hpre: number, hsuf: number, mpre: number, msuf: number, spre: number, ssuf: number, ms: number): void {
        let timeAsText: string = '';
        timeAsText += this.options.hour ? `${hpre}${hsuf}` : '';
        timeAsText += timeAsText.length && this.options.min ? ':' : '';
        timeAsText += this.options.min ? `${mpre}${msuf}` : '';
        timeAsText += timeAsText.length && this.options.sec ? ':' : '';
        timeAsText += this.options.sec ? `${spre}${ssuf}` : '';
        timeAsText += timeAsText.length && this.options.ms ? '.' : '';
        timeAsText += this.options.ms ? `${ms}` : '';
        this.#text.text = timeAsText;
    }

    #reachedEnd(time: number): boolean {
        return (!!this.options.startTime && time === 0) || (!!this.options.endTime && time === this.options.endTime);
    }
}
