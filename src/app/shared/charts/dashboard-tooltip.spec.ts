import {buildAccountingCharts} from '../../personal/accounting/dashboard/dashboard-charts';
import {filterAccountingData} from '../../personal/accounting/dashboard/dashboard-data';
import {DashboardComponent as BankingDashboard} from '../../personal/banking/dashboard/dashboard.component';
import {DashboardComponent as FuelDashboard} from '../../personal/fuel/dashboard/dashboard.component';
import {BankingService} from '../api/banking.service';
import {FuelService} from '../api/fuel.service';

describe('Dashboard HTML tooltips', () => {
    const label = '<img src=x onerror="alert(1)"> Savings & "Travel"';
    function render(html: string): HTMLDivElement {
        const element = document.createElement('div');
        element.innerHTML = html;
        expect(element.querySelector('img, script, svg')).toBeNull();
        expect(element.textContent).toContain(label);
        return element;
    }

    it('escapes all four accounting formatters while preserving formatting', () => {
        const charts = buildAccountingCharts(filterAccountingData({
            accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()
        }));
        for (const name of ['balance', 'category_expense'] as const) {
            const formatter = (charts[name]['tooltip'] as any).formatter;
            const element = render(formatter({name: label, value: 12.5, percent: 25}));
            expect(element.textContent).toContain('12.50€');
            expect(element.querySelector('br')).not.toBeNull();
        }
        render((charts.history['tooltip'] as any).formatter([{seriesName: label, value: 12.5, name: '2026-01-01'}]));
        render((charts.transfer['tooltip'] as any).formatter({data: {source: label, target: label, value: 12.5}}));
    });

    it('escapes the banking formatter', () => {
        const dashboard = new BankingDashboard({} as BankingService);
        dashboard.update();
        render((dashboard as any).balance_chart.tooltip.formatter([{seriesName: label, data: ['2026-01-01', 12.5]}]));
    });

    it('escapes all four fuel formatters', () => {
        const dashboard = new FuelDashboard({} as FuelService);
        dashboard.update();
        const charts = dashboard as any;
        render(charts.travel_chart.tooltip.formatter([{seriesName: label, value: ['2026-01-01', 100]}]));
        render(charts.fuel_chart.tooltip.formatter({seriesName: label, data: [100, 10, 20]}));
        render(charts.consumption_chart.tooltip.formatter({seriesName: label, data: [0, 1, 2, 3, 4, 5]}));
        render(charts.fuel_consumption_chart.tooltip.formatter({name: label, data: [0, 1, 2, 3, 4, 5]}));
    });
});
