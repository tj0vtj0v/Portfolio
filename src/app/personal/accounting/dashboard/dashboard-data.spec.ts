import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {AccountingService} from '../../../shared/api/accounting.service';
import {AccountingDashboardData, accountingActivity, filterAccountingData} from './dashboard-data';
import {DashboardDataService} from './dashboard-data.service';
import {buildAccountingCharts} from './dashboard-charts';

describe('Accounting dashboard data', () => {
    const empty = (): AccountingDashboardData => ({accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()});

    it('emits data for a user with no accounts', () => {
        TestBed.configureTestingModule({providers: [{provide: AccountingService, useValue: {
            get_accounts: () => of([]), get_expenses: () => of([]), get_incomes: () => of([]), get_transfers: () => of([])
        }}]});
        const received = jasmine.createSpy('received');
        TestBed.inject(DashboardDataService).load().subscribe(received);
        expect(received).toHaveBeenCalledWith(empty());
    });

    it('carries the latest earlier balance forward without mutating source history', () => {
        const data = empty();
        const history = [{date: '2026-02-02', balance: 30}, {date: '2026-01-15', balance: 20}, {date: '2026-01-01', balance: 10}];
        data.histories.set('Main', history);
        const view = filterAccountingData(data, '2026-02-01', '2026-02-02');
        expect(view.filteredHistories.get('Main')).toEqual([history[1], history[0]]);
        const charts = buildAccountingCharts(view);
        expect((charts.history['series'] as any[])[0].data).toEqual([20, 30]);
        expect(history[0].date).toBe('2026-02-02');
    });

    it('renders empty history and reversed date ranges without throwing', () => {
        const data = empty();
        data.histories.set('New account', []);
        expect(() => buildAccountingCharts(filterAccountingData(data, '2026-01-01', '2026-01-03'))).not.toThrow();
        const charts = buildAccountingCharts(filterAccountingData(data, '2026-02-01', '2026-01-01'));
        expect((charts.history['xAxis'] as any).data).toEqual([]);
    });

    it('filters and aggregates expenses and income inclusively', () => {
        const data = empty();
        data.expenses = [
            {date: '2026-01-01', amount: 10, category: {name: 'Food'}},
            {date: '2026-01-31', amount: 20, category: {name: 'Food'}},
            {date: '2026-02-01', amount: 100, category: {name: 'Food'}}
        ] as AccountingDashboardData['expenses'];
        data.incomes = [{date: '2026-01-15', amount: 50, account: {name: 'Main', balance: 0}}] as AccountingDashboardData['incomes'];
        const view = filterAccountingData(data, '2026-01-01', '2026-01-31');
        expect(view.categoryExpenseMap.get('Food')).toBe(30);
        expect(view.accountIncomeMap.get('Main')).toBe(50);
        expect(view.filteredExpenses.length).toBe(2);
        expect(view.filteredIncomes.length).toBe(1);
    });

    it('derives deterministic activity without double-counting transfers', () => {
        const data = empty();
        const main = {id: 1, name: 'Main', balance: 100};
        const savings = {id: 2, name: 'Savings', balance: 200};
        data.expenses = [{id: 4, date: '2026-01-02', reason: '<Groceries>', amount: 10, account: main, category: {id: 1, name: 'Food'}}];
        data.incomes = [{id: 3, date: '2026-01-02', reason: 'Salary', amount: 50, account: main}];
        data.transfers = [{id: 2, date: '2026-01-02', amount: 25, source: main, target: savings}];
        const view = filterAccountingData(data, '2026-01-01', '2026-01-31');
        const activity = accountingActivity(view);
        expect(activity.map(item => item.type)).toEqual(['expense', 'income', 'transfer']);
        expect(activity[2].context).toBe('Main \u2192 Savings');
        expect(activity.filter(item => item.type === 'transfer').length).toBe(1);
        expect(view.filteredIncomes.reduce((sum, item) => sum + item.amount, 0) - view.filteredExpenses.reduce((sum, item) => sum + item.amount, 0)).toBe(40);
    });
});
