import {Injectable, signal} from '@angular/core';

export const AMOUNT_PRIVACY_KEY = 'portfolio.accounting.hideAmounts';

@Injectable({providedIn: 'root'})
export class AmountPrivacyService {
    private readonly state = signal(this.restore());
    readonly hidden = this.state.asReadonly();

    toggle(): void {
        this.state.update(value => !value);
        try { localStorage.setItem(AMOUNT_PRIVACY_KEY, String(this.hidden())); } catch { /* Session state still works. */ }
    }

    private restore(): boolean {
        try { return localStorage.getItem(AMOUNT_PRIVACY_KEY) === 'true'; } catch { return false; }
    }
}
