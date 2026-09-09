import {Injectable, signal} from '@angular/core';

/** Unknown/failed reads must never be presented as an empty collection. */
@Injectable({providedIn: 'root'})
export class AccountingSetupState {
    readonly accountsEmpty = signal<boolean | null>(null);
    readonly categoriesEmpty = signal<boolean | null>(null);

    reset(): void {
        this.accountsEmpty.set(null);
        this.categoriesEmpty.set(null);
    }
}
