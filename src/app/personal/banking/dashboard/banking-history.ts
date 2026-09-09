import {History} from '../../../shared/datatype/History';
import {PeriodRange} from '../../../shared/date-range/period-range';

/** Observed history only; carry-forward must never create a future observation. */
export function bankingHistory(histories: readonly History[], range?: PeriodRange | null): Map<string, History[]> {
    const result = new Map<string, History[]>();
    if (!range || (range.from && range.from > range.observedTo)) return result;
    const prior = new Map<string, History>();
    for (const entry of [...histories].sort((a, b) => a.date.localeCompare(b.date))) {
        if (!entry.account || entry.date > range.observedTo) continue;
        const name = entry.account.name;
        if (range.from && entry.date < range.from) prior.set(name, entry);
        else result.set(name, [...(result.get(name) ?? []), entry]);
    }
    prior.forEach((entry, name) => {
        const entries = result.get(name) ?? [];
        result.set(name, entries[0]?.date === range.from ? entries : [{...entry, date: range.from!}, ...entries]);
    });
    return result;
}
