import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { appConfig } from './app.config';

describe('AppComponent smoke test', () => {
    it('creates the root component with the real bootstrap providers', async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: appConfig.providers,
        }).compileComponents();

        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});
