import {buildAccountingCharts} from './dashboard-charts';
import {filterAccountingData} from './dashboard-data';

describe('Balance history tooltip', () => {
    const view = filterAccountingData({accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()});
    const formatter = (buildAccountingCharts(view).history['tooltip'] as any).formatter;

    it('shows a dash for absent or invalid balances', () => {
        for (const value of [null, undefined, '', ' ', '-', NaN, Infinity, 'invalid']) {
            expect(formatter([{name: '2026-10-05', seriesName: 'Main', value}])).toBe('05.10.2026<br>Main: -€');
        }
    });

    it('preserves zero, negative and numeric string balances and escapes account names', () => {
        for (const [value, expected] of [[0, '0.00'], [-12.5, '-12.50'], ['42.25', '42.25']]) {
            expect(formatter([{name: '2026-10-05', seriesName: '<Main>', value}])).toBe(`05.10.2026<br>&lt;Main&gt;: ${expected}€`);
        }
    });
});
