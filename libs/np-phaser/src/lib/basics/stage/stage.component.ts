import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { StageService } from '../../service/stage.service';

@Component({
    selector: 'np-stage',
    standalone: true,
    templateUrl: './stage.component.html',
    styleUrls: ['./stage.component.scss'],
})
export class StageComponent implements AfterViewInit, OnDestroy {
    #npStage = inject(StageService);
    #subscription = new Subscription();
    isReady = false;
    @ViewChild('npStage', { static: true }) stageContainer?: ElementRef<HTMLElement>;

    listen(subscription: Subscription) {
        this.#subscription.add(subscription);
    }

    ngAfterViewInit(): void {
        if (this.stageContainer) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            this.listen(this.#npStage.initStage(this.stageContainer.nativeElement).subscribe(isReady => (this.isReady = isReady)));
        }
    }

    ngOnDestroy(): void {
        console.log('destroy stage');
        this.#subscription.unsubscribe();
        this.#npStage.destroyStage();
    }
}
