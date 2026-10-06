import {buildAccountingCharts} from './dashboard-charts';
import {filterAccountingData} from './dashboard-data';
import {monthlyComparison} from './monthly-comparison';
import {init} from 'echarts';
import {TestBed} from '@angular/core/testing';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';

describe('Accounting chart privacy', () => {
    const account = {id: 1, name: '<Main>', balance: 9876.54};
    const view = filterAccountingData({accounts: [account], expenses: [
        {date: '2026-01-01', reason: 'Food', amount: 1234.56, account, category: {name: '<Food>'}}
    ], incomes: [], transfers: [], histories: new Map()}, '2026-01-01', '2026-01-31');

    it('keeps percentages and escaped context but hides amounts in every tooltip and axis', () => {
        const charts = buildAccountingCharts(view, true) as any;
        expect(charts.balance.tooltip.formatter({name: '<Main>', value: 9876.54, percent: 100})).toBe('&lt;Main&gt;: --- €<br>100%');
        expect(charts.category_expense.tooltip.formatter({name: '<Food>', value: 1234.56})).toBe('&lt;Food&gt;: --- €<br>100.0%');
        expect(charts.history.tooltip.formatter([{name: '2026-01-01', seriesName: '<Main>', value: 9876.54}])).toBe('01.01.2026<br>&lt;Main&gt;: --- €');
        expect(charts.transfer.tooltip.formatter({data: {source: '<Main>', target: '<Other>', value: 1234.56}})).toBe('&lt;Main&gt; → &lt;Other&gt;: --- €');
        expect(charts.transfer.tooltip.formatter({name: '<Main>', data: {name: '<Main>'}})).toBe('&lt;Main&gt;: --- €');
        expect(charts.history.yAxis.axisLabel.show).toBeFalse();
        expect(charts.category_expense.yAxis.axisLabel.show).toBeFalse();
        expect(charts.category_expense.series[0].label.show).toBeFalse();
        const month = monthlyComparison(view, view.endDate, true)[0];
        expect((month.options['tooltip'] as any).formatter()).toBe('Jan 2026<br>Expenses: --- €<br>Income: --- €');
        expect(month.expenses).toBe(1234.56);
        expect((monthlyComparison(view)[0].options['tooltip'] as any).formatter()).toContain('Expenses: 1,234.56 €');
    });

    it('handles zero percentages and restores visible formatting', () => {
        const empty = filterAccountingData({accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()});
        expect((buildAccountingCharts(empty, true).category_expense['tooltip'] as any).formatter({name: 'Empty', value: 0})).toBe('Empty: --- €<br>0.0%');
        expect((buildAccountingCharts(view).balance['tooltip'] as any).formatter({name: 'Main', value: 9876.54, percent: 100})).toContain('9876.54€');
    });

    it('keeps category amounts hidden during real chart highlight and restores them after revealing', () => {
        const chart = init(null, null, {renderer: 'svg', ssr: true, width: 320, height: 400});
        try {
            for (const hidden of [false, true, false]) {
                const options = buildAccountingCharts(view, hidden).category_expense;
                chart.setOption({...options, animation: false});
                chart.dispatchAction({type: 'highlight', seriesIndex: 0, dataIndex: 0});
                const svg = chart.renderToSVGString();
                expect(svg.includes('1234.56')).toBe(!hidden);
                expect(svg).toContain('Amount (EUR)');
                const axis = (chart.getOption()['yAxis'] as any[])[0];
                expect(axis.axisLabel.show).toBe(!hidden);
                expect(axis.nameTextStyle.align).toBe('left');
                chart.dispatchAction({type: 'downplay', seriesIndex: 0, dataIndex: 0});
            }
        } finally { chart.dispose(); }
    });

    it('merges privacy without replacing the chart or clearing legend selections', () => {
        const card = TestBed.runInInjectionContext(() => new ChartCardComponent());
        const chart = init(null, null, {renderer: 'svg', ssr: true, width: 500, height: 300});
        try {
            card.options = buildAccountingCharts(view).balance;
            chart.setOption((card as any).presentationOptions, true);
            (card as any).onChartInit(chart);
            chart.dispatchAction({type: 'legendUnSelect', name: '<Main>'});
            const base = (card as any).presentationOptions;
            const dispatch = spyOn(chart, 'dispatchAction').and.callThrough();
            for (const hidden of [true, false]) {
                card.presentationOverrides = buildAccountingCharts(view, hidden).balance;
                expect((card as any).presentationOptions).toBe(base);
                chart.setOption((card as any).themeOptions());
                expect((chart.getOption()['legend'] as any[])[0].selected['<Main>']).toBeFalse();
            }
            expect(dispatch).toHaveBeenCalledWith({type: 'hideTip'});
        } finally { chart.dispose(); }
    });
});
