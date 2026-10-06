import {formatDate} from '@angular/common';

// Single source of truth for display only; Angular format tokens use lowercase yyyy/dd.
export const DATE_DISPLAY_FORMATS = {day: 'dd.MM.yyyy', month: 'MMM yyyy', year: 'yyyy'} as const;
export const DATE_DISPLAY_LOCALE = 'en-US';
export type DatePrecision = keyof typeof DATE_DISPLAY_FORMATS;
export type DisplayDateValue = string | number | Date | null | undefined;

/** Date-only API values must not shift through UTC conversion. */
export function displayDate(value: DisplayDateValue, precision: DatePrecision = 'day'): string {
    if (value === null || value === undefined || value === '') return '';
    let date: Date;
    if (typeof value === 'string' && /^\d{4}-\d{2}(?:-\d{2})?$/.test(value)) {
        const [year, month, day = 1] = value.split('-').map(Number);
        date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
    } else {
        date = value instanceof Date ? value : new Date(value);
    }
    if (Number.isNaN(date.getTime())) return '';
    return formatDate(date, DATE_DISPLAY_FORMATS[precision], DATE_DISPLAY_LOCALE);
}
