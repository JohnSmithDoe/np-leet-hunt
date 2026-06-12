import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { StageService } from '../../service/stage.service';

@Component({
    selector: 'np-stage',
    templateUrl: './stage.component.html',
    styleUrls: ['./stage.component.scss'],
})
export class StageComponent implements AfterViewInit, OnDestroy {
    #npStage = inject(StageService);
    #subscription = new Subscription();
    #resizeObserver?: ResizeObserver;
    isReady = false;
    @ViewChild('npStage', { static: true }) stageContainer?: ElementRef<HTMLElement>;

    listen(subscription: Subscription) {
        this.#subscription.add(subscription);
    }

    ngAfterViewInit(): void {
        if (this.stageContainer) {
            this.#initWhenSized(this.stageContainer.nativeElement);
        }
    }

    ngOnDestroy(): void {
        console.log('destroy stage');
        this.#resizeObserver?.disconnect();
        this.#subscription.unsubscribe();
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
        this.listen(this.#npStage.initStage(container).subscribe(isReady => (this.isReady = isReady)));
    }
}
