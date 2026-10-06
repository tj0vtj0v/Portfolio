import {Component, inject} from '@angular/core';
import {AmountPrivacyService} from './amount-privacy.service';

@Component({
    selector: 'app-amount-privacy-toggle',
    template: `
        <button type="button" (click)="privacy.toggle()" [attr.aria-label]="privacy.hidden() ? 'Show amounts' : 'Hide amounts'"
            [attr.title]="privacy.hidden() ? 'Show amounts' : 'Hide amounts'" [attr.aria-pressed]="privacy.hidden()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                @if (privacy.hidden()) { <path d="m3 3 18 18" /> }
            </svg>
        </button>
    `,
    styles: `
        :host { display: inline-flex; }
        button { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: var(--space-2); color: var(--color-text-muted); background: transparent; border-color: transparent; }
        button:hover { color: var(--color-primary); background: var(--color-surface-soft); }
        svg { width: 22px; height: 22px; }
    `
})
export class AmountPrivacyToggleComponent {
    protected readonly privacy = inject(AmountPrivacyService);
}
