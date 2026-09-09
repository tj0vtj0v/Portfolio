import {convertToParamMap} from '@angular/router';
import {customPeriodRange, dateRange, formatLocalDate, parseLocalDate, periodRange} from './period-range';
import {parsePeriodQuery, serializePeriodQuery} from './period-query';

describe('period range', () => {
    const today = new Date(2026, 0, 1, 12);

    it('uses inclusive local-calendar preset boundaries', () => {
        expect(periodRange('30', today).from).toBe('2025-12-03');
        expect(periodRange('365', today).from).toBe('2025-01-02');
        expect(periodRange('month', new Date(2024, 1, 10)).to).toBe('2024-02-29');
        expect(periodRange('year', today)).toEqual(jasmine.objectContaining({from: '2026-01-01', to: '2026-12-31', observedTo: '2026-01-01'}));
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

    it('defaults missing/invalid URL state to current year and preserves explicit selections', () => {
        const custom = parsePeriodQuery(convertToParamMap({period: 'custom', from: '2025-12-31', to: '2026-01-01'}), today);
        expect(serializePeriodQuery(custom)).toEqual({period: 'custom', from: '2025-12-31', to: '2026-01-01'});
        expect(parsePeriodQuery(convertToParamMap({}), today).period).toBe('year');
        expect(parsePeriodQuery(convertToParamMap({period: 'unknown'}), today).period).toBe('year');
        expect(parsePeriodQuery(convertToParamMap({period: 'custom', from: 'bad'}), today).period).toBe('year');
        expect(parsePeriodQuery(convertToParamMap({period: 'month'}), today).period).toBe('month');
    });
});
