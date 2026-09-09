import {ParamMap, Params} from '@angular/router';
import {customPeriodRange, PeriodRange, PeriodPreset, periodRange} from './period-range';

const PRESETS = new Set<PeriodPreset>(['month', 'year', '365', '30', 'all', 'custom']);

export function isValidPeriodQuery(query: Pick<ParamMap, 'get'>, today = new Date()): boolean {
    const value = query.get('period');
    if (!value || !PRESETS.has(value as PeriodPreset)) return false;
    return value !== 'custom' || !!customPeriodRange(query.get('from') ?? '', query.get('to') ?? '', today);
}

export function parsePeriodQuery(query: Pick<ParamMap, 'get'>, today = new Date()): PeriodRange {
    const value = query.get('period');
    if (!value || !PRESETS.has(value as PeriodPreset)) return periodRange('year', today);
    if (value === 'custom') {
        return customPeriodRange(query.get('from') ?? '', query.get('to') ?? '', today) ?? periodRange('year', today);
    }
    return periodRange(value as Exclude<PeriodPreset, 'custom'>, today);
}

export function serializePeriodQuery(range: PeriodRange): Params {
    return range.period === 'custom'
        ? {period: range.period, from: range.from, to: range.to}
        : {period: range.period, from: null, to: null};
}
