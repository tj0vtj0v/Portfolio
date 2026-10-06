import {formatCurrency, formatNumber} from '@angular/common';
import {inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';

/** Keep the existing currency position, separating a leading euro from its number. */
export function spaceEuroPrefix(text: string): string {
    return text.replace(/€(?=\S)/g, '€ ');
}

export function euroAmount(value: number | null | undefined, locale = 'en-US', position: 'default' | 'suffix' = 'default'): string {
    if (value == null) return '';
    return position === 'suffix'
        ? `${formatNumber(value, locale, '1.2-2')} €`
        : spaceEuroPrefix(formatCurrency(value, locale, '€', 'EUR'));
}

@Pipe({name: 'euroAmount'})
export class EuroAmountPipe implements PipeTransform {
    private readonly locale = inject(LOCALE_ID);
    transform(value: number | null | undefined, position: 'default' | 'suffix' = 'default'): string {
        return euroAmount(value, this.locale, position);
    }
}
