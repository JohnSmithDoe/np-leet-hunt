import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';

describe('AppComponent smoke test', () => {
    it('compiles the app module and creates the root component', async () => {
        await TestBed.configureTestingModule({
            imports: [AppModule],
        }).compileComponents();

        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});
