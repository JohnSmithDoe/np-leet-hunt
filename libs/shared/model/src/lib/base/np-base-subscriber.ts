import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export class NPBaseSubscriber implements OnDestroy {
    #subscription = new Subscription();

    listen(subscription: Subscription) {
        this.#subscription.add(subscription);
    }
    ngOnDestroy(): void {
        this.#subscription.unsubscribe();
    }
}
