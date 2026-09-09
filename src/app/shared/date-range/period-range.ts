export type PeriodPreset = 'month' | 'year' | '365' | '30' | 'all' | 'custom';

export interface PeriodRange {
    period: PeriodPreset;
    from?: string;
    to: string;
    observedTo: string;
}

export const PERIOD_PRESETS: ReadonlyArray<{value: PeriodPreset; label: string}> = [
    {value: 'month', label: 'Current month'},
    {value: 'year', label: 'Current year'},
    {value: '365', label: 'Last 365 days'},
    {value: '30', label: 'Last 30 days'},
    {value: 'all', label: 'All time'},
    {value: 'custom', label: 'Custom range'}
];

export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string): Date | undefined {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : undefined;
}

function addCalendarDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function periodRange(period: Exclude<PeriodPreset, 'custom'>, today = new Date()): PeriodRange {
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const to = formatLocalDate(period === 'month'
        ? new Date(localToday.getFullYear(), localToday.getMonth() + 1, 0)
        : period === 'year'
            ? new Date(localToday.getFullYear(), 11, 31)
            : localToday);
    let from: string | undefined;
    if (period === 'month') from = formatLocalDate(new Date(localToday.getFullYear(), localToday.getMonth(), 1));
    if (period === 'year') from = `${localToday.getFullYear()}-01-01`;
    if (period === '30') from = formatLocalDate(addCalendarDays(localToday, -29));
    if (period === '365') from = formatLocalDate(addCalendarDays(localToday, -364));
    return {period, from, to, observedTo: formatLocalDate(localToday)};
}

export function customPeriodRange(from: string, to: string, today = new Date()): PeriodRange | undefined {
    if (!parseLocalDate(from) || !parseLocalDate(to) || from > to) return undefined;
    const todayValue = formatLocalDate(today);
    return {period: 'custom', from, to, observedTo: to < todayValue ? to : todayValue};
}

export function dateRange(range: Pick<PeriodRange, 'from' | 'observedTo'>): string[] {
    if (!range.from || range.from > range.observedTo) return [];
    const start = parseLocalDate(range.from);
    const end = parseLocalDate(range.observedTo);
    if (!start || !end) return [];
    const values: string[] = [];
    for (let date = start; date <= end; date = addCalendarDays(date, 1)) values.push(formatLocalDate(date));
    return values;
}

export function formatPeriodLabel(range: PeriodRange, earliest?: string): string {
    if (range.period === 'all' && !earliest) return 'All available data';
    const from = range.from ?? earliest;
    return from ? `${from} – ${range.to}` : `Through ${range.to}`;
}
