import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { NPBaseSubscriber } from '@shared/model';
import { StageService } from '@shared/phaser';

@Component({
    selector: 'np-stage',
    standalone: true,
    templateUrl: './stage.component.html',
    styleUrls: ['./stage.component.scss'],
})
export class StageComponent extends NPBaseSubscriber implements AfterViewInit, OnDestroy {
    #npStage = inject(StageService);
    isReady = false;
    @ViewChild('npStage', { static: true }) stageContainer?: ElementRef<HTMLElement>;

    ngAfterViewInit(): void {
        if (this.stageContainer) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            this.listen(this.#npStage.initStage(this.stageContainer.nativeElement).subscribe(isReady => (this.isReady = isReady)));
        }
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        console.log('destroy stage');
        this.#npStage.destroyStage();
    }
}
