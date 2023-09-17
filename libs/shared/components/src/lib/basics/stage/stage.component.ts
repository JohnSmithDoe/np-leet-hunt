import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { StageService } from '@shared/phaser';

@Component({
    selector: 'np-stage',
    templateUrl: './stage.component.html',
    styleUrls: ['./stage.component.scss'],
})
export class StageComponent implements AfterViewInit, OnDestroy {
    #npStage = inject(StageService);
    @ViewChild('npStage', { static: true }) stageContainer?: ElementRef<HTMLElement>;

    ngAfterViewInit(): void {
        if (this.stageContainer) {
            void this.#npStage.initStage(this.stageContainer.nativeElement);
        }
    }

    ngOnDestroy(): void {
        console.log('destroy stage');
        this.#npStage.destroyStage();
    }
}
