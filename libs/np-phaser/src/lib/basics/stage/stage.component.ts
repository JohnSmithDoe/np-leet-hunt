import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    ViewChild,
} from '@angular/core';

import { StageService } from '../../service/stage.service';

@Component({
    selector: 'np-stage',
    templateUrl: './stage.component.html',
    styleUrls: ['./stage.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageComponent implements AfterViewInit, OnDestroy {
    #npStage = inject(StageService);
    #resizeObserver?: ResizeObserver;
    isReady = false;
    @ViewChild('npStage', { static: true }) stageContainer?: ElementRef<HTMLElement>;

    ngAfterViewInit(): void {
        if (this.stageContainer) {
            this.#initWhenSized(this.stageContainer.nativeElement);
        }
    }

    ngOnDestroy(): void {
        console.log('destroy stage');
        this.#resizeObserver?.disconnect();
        this.#npStage.destroyStage();
    }

    /**
     * Phaser must not boot while the container is still 0x0 (e.g. before the Ionic
     * components around it have hydrated) — since 3.8x a zero-sized WebGL renderer
     * throws "Framebuffer status: Incomplete Attachment" instead of recovering.
     */
    #initWhenSized(container: HTMLElement) {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            this.#initStage(container);
            return;
        }
        this.#resizeObserver = new ResizeObserver(() => {
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                this.#resizeObserver?.disconnect();
                this.#resizeObserver = undefined;
                this.#initStage(container);
            }
        });
        this.#resizeObserver.observe(container);
    }

    #initStage(container: HTMLElement) {
        // initStage is synchronous (Phaser boots in-call), so `initialized` is already set after it returns.
        this.#npStage.initStage(container);
        this.isReady = this.#npStage.initialized();
    }
}
