import {convertToParamMap} from '@angular/router';
import {customPeriodRange, dateRange, formatLocalDate, parseLocalDate, periodRange} from './period-range';
import {parsePeriodQuery, serializePeriodQuery} from './period-query';

describe('period range', () => {
    const today = new Date(2026, 0, 1, 12);

    it('uses inclusive local-calendar preset boundaries', () => {
        expect(periodRange('30', today)).toEqual({period: '30', from: '2025-12-01', to: '2025-12-31', observedTo: '2025-12-31'});
        expect(periodRange('365', today)).toEqual({period: '365', from: '2025-01-01', to: '2025-12-31', observedTo: '2025-12-31'});
        expect(periodRange('month', new Date(2024, 1, 10)).to).toBe('2024-02-29');
        expect(periodRange('year', today)).toEqual(jasmine.objectContaining({from: '2026-01-01', to: '2026-12-31', observedTo: '2026-01-01'}));
    });

    it('uses complete previous months across leap years and unequal month lengths', () => {
        for (const [now, from, to] of [
            [new Date(2026, 9, 5), '2026-09-01', '2026-09-30'],
            [new Date(2024, 2, 31), '2024-02-01', '2024-02-29'],
            [new Date(2025, 2, 1), '2025-02-01', '2025-02-28'],
            [new Date(2026, 3, 30), '2026-03-01', '2026-03-31']
        ] as const) {
            const range = periodRange('30', now);
            expect(range).toEqual({period: '30', from, to, observedTo: to});
            const dates = dateRange(range);
            expect(dates[0]).toBe(from);
            expect(dates[dates.length - 1]).toBe(to);
        }
    });

    it('includes all 366 days of the previous leap year and restores saved preset URLs', () => {
        const now = new Date(2025, 9, 5);
        const range = periodRange('365', now);
        expect(range).toEqual({period: '365', from: '2024-01-01', to: '2024-12-31', observedTo: '2024-12-31'});
        expect(dateRange(range).length).toBe(366);
        for (const period of ['30', '365'] as const) {
            expect(parsePeriodQuery(convertToParamMap({period}), now)).toEqual(periodRange(period, now));
        }
    });

    it('strictly validates dates and accepts a same-day custom range', () => {
        expect(parseLocalDate('2026-02-30')).toBeUndefined();
        expect(customPeriodRange('2026-01-02', '2026-01-01', today)).toBeUndefined();
        expect(customPeriodRange('2026-01-01', '2026-01-01', today)?.observedTo).toBe('2026-01-01');
    });

    it('generates dates across leap days without UTC conversion', () => {
        expect(dateRange({from: '2024-02-28', observedTo: '2024-03-01'})).toEqual(['2024-02-28', '2024-02-29', '2024-03-01']);
        expect(dateRange({from: '2026-10-24', observedTo: '2026-10-26'})).toEqual(['2026-10-24', '2026-10-25', '2026-10-26']);
        expect(formatLocalDate(new Date(2026, 9, 25))).toBe('2026-10-25');
    });

    it('honors future custom end dates including URL-restored ranges', () => {
        const range = customPeriodRange('2026-01-01', '2026-01-03', today)!;
        expect(range.observedTo).toBe('2026-01-03');
        expect(dateRange(range)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
        expect(parsePeriodQuery(convertToParamMap(serializePeriodQuery(range)), today)).toEqual(range);
    });

    it('defaults missing/invalid URL state to current year and preserves explicit selections', () => {
        const custom = parsePeriodQuery(convertToParamMap({period: 'custom', from: '2025-12-31', to: '2026-01-01'}), today);
        expect(serializePeriodQuery(custom)).toEqual({period: 'custom', from: '2025-12-31', to: '2026-01-01'});
        expect(parsePeriodQuery(convertToParamMap({}), today).period).toBe('year');
        expect(parsePeriodQuery(convertToParamMap({period: 'unknown'}), today).period).toBe('year');
        expect(parsePeriodQuery(convertToParamMap({period: 'custom', from: 'bad'}), today).period).toBe('year');
        expect(parsePeriodQuery(convertToParamMap({period: 'month'}), today).period).toBe('month');
    });
});
