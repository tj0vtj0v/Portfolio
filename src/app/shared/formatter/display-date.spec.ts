import {displayDate} from './display-date';
import {DisplayDatePipe} from './display-date.pipe';
import {formatPeriodLabel, periodRange} from '../date-range/period-range';

describe('display dates', () => {
    it('uses the same formats for templates, month labels and TypeScript callers', () => {
        const pipe = new DisplayDatePipe();
        expect(displayDate('2026-10', 'month')).toBe('Oct 2026');
        expect(displayDate('2026-10-05', 'month')).toBe('Oct 2026');
        expect(pipe.transform('2026-10', 'month')).toBe(displayDate('2026-10', 'month'));
        expect(pipe.transform('2026-10-05')).toBe('05.10.2026');
        expect(pipe.transform('2026-10', 'year')).toBe('2026');
        expect(pipe.transform('2026-13', 'month')).toBe('');
    });
    it('formats date-only values without shifting calendar days', () => {
        expect(displayDate('2024-02-29')).toBe('29.02.2024');
        expect(displayDate('2026-10-25')).toBe('25.10.2026');
        expect(displayDate('2026-01-01')).toBe('01.01.2026');
    });

    it('formats local chart timestamps and Date objects consistently', () => {
        const value = new Date(2026, 9, 5, 12);
        expect(displayDate(value)).toBe('05.10.2026');
        expect(displayDate(value.getTime())).toBe('05.10.2026');
    });

    it('does not display missing or invalid dates as fabricated values', () => {
        for (const value of [null, undefined, '', '2026-02-30', 'invalid', NaN]) {
            expect(displayDate(value)).toBe('');
        }
    });

    it('formats the visible range while preserving ISO filter boundaries', () => {
        const range = periodRange('30', new Date(2026, 9, 5));
        expect(formatPeriodLabel(range)).toBe('01.09.2026 – 30.09.2026');
        expect(range.from).toBe('2026-09-01');
        expect(range.to).toBe('2026-09-30');
        expect(formatPeriodLabel(periodRange('all'))).toBe('All available data');
    });
});
