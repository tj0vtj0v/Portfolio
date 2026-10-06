import {euroAmount, spaceEuroPrefix} from '../formatter/euro-amount';
import {Component, Input, LOCALE_ID, inject} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {AmountPrivacyService} from './amount-privacy.service';

@Component({
    selector: 'app-private-amount',
    template: `
        @if (privacy.hidden()) {
            <span class="redacted" role="img" aria-label="Amount hidden">
                @if (currencyFirst) { <span aria-hidden="true">€</span> }
                <span class="block" aria-hidden="true"></span>
                @if (!currencyFirst) { <span aria-hidden="true">€</span> }
            </span>
        } @else {
            {{ displayText }}
        }
    `,
    styles: `
        :host { display: inline-block; font-variant-numeric: tabular-nums; }
        .redacted { display: inline-flex; align-items: center; gap: .6em; color: var(--color-text-muted); white-space: nowrap; }
        .block { display: inline-block; width: 5.5ch; height: .8em; background: linear-gradient(90deg, transparent, currentColor 25%, currentColor 75%, transparent); opacity: .4; filter: blur(5px); border-radius: var(--radius-control); }
    `
})
export class PrivateAmountComponent {
    protected readonly privacy = inject(AmountPrivacyService);
    private readonly locale = inject(LOCALE_ID);
    @Input() value: number | null | undefined;
    @Input() formatted?: string | null;
    protected get displayText(): string {
        return this.formatted != null ? spaceEuroPrefix(this.formatted) : euroAmount(this.value, this.locale);
    }
    protected get currencyFirst(): boolean {
        const text = this.displayText;
        const numberIndex = text.search(/\d/);
        return text.indexOf('€') < numberIndex;
    }
}

@Component({
    selector: 'app-private-amount-cell',
    imports: [PrivateAmountComponent],
    template: `<app-private-amount [value]="value" [formatted]="formatted" />`
})
export class PrivateAmountCellComponent implements ICellRendererAngularComp {
    protected value?: number;
    protected formatted?: string | null;
    agInit(params: ICellRendererParams): void { this.refresh(params); }
    refresh(params: ICellRendererParams): boolean {
        this.value = params.value;
        this.formatted = params.valueFormatted;
        return true;
    }
}
