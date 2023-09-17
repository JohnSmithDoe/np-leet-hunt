import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { StageComponent } from './basics/stage/stage.component';

@NgModule({
    imports: [CommonModule],
    declarations: [StageComponent],
    exports: [StageComponent],
})
export class SharedComponentsModule {}
