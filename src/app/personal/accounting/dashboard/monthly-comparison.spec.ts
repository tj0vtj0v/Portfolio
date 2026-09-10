import {monthlyComparison} from './monthly-comparison';
import {AccountingDashboardView} from './dashboard-data';

describe('monthly comparison', () => {
    it('keeps empty months and uses a common scale without counting transfers', () => {
        const view = {
            startDate: '2025-12-15', endDate: '2026-02-10',
            filteredExpenses: [{date: '2025-12-20', amount: 20}, {date: '2025-12-21', amount: 10}],
            filteredIncomes: [{date: '2026-02-10', amount: 80}],
            filteredTransfers: [{date: '2026-01-01', amount: 9000}]
        } as AccountingDashboardView;
        const result = monthlyComparison(view);
        expect(result.map(({month, expenses, income}) => ({month, expenses, income}))).toEqual([
            {month: '2025-12', expenses: 30, income: 0},
            {month: '2026-01', expenses: 0, income: 0},
            {month: '2026-02', expenses: 0, income: 80}
        ]);
        for (const row of result) {
            expect(row.options['yAxis']).withContext(row.month).toEqual(jasmine.objectContaining({max: 80}));
        }
        expect(monthlyComparison(view).map(row => row.expenses)).toEqual([30, 0, 0]);
    });

    it('includes all selected months even beyond the preset observation cutoff', () => {
        const view = {startDate: '2026-01-01', endDate: '2026-09-09', filteredExpenses: [], filteredIncomes: []} as unknown as AccountingDashboardView;
        const result = monthlyComparison(view, '2026-12-31');
        expect(result.length).toBe(12);
        for (const row of result) {
            expect(row.options['yAxis']).withContext(row.month).toEqual(jasmine.objectContaining({max: 1}));
        }
        expect(monthlyComparison({...view, startDate: '2027-01-01'})).toEqual([]);
    });
});
