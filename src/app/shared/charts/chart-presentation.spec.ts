import {init} from 'echarts';
import {TestBed} from '@angular/core/testing';
import {ChartCardComponent} from './chart-card.component';
import {chartThemeOptions, resolvedChartColors} from './chart-theme';

describe('chart data and presentation updates', () => {
    it('does not introduce Cartesian axes into a Sankey during presentation merges', () => {
        const card = TestBed.runInInjectionContext(() => new ChartCardComponent());
        const chart = init(null, null, {renderer: 'svg', ssr: true, width: 500, height: 300});
        try {
            card.options = {series: [{type: 'sankey', data: [{name: 'A'}, {name: 'B'}], links: [{source: 'A', target: 'B', value: 5}]}]};
            chart.setOption((card as any).presentationOptions, true);
            chart.setOption((card as any).themeOptions());
            expect((chart.getOption()['xAxis'] as unknown[] | undefined)?.length ?? 0).toBe(0);
            expect((chart.getOption()['yAxis'] as unknown[] | undefined)?.length ?? 0).toBe(0);
            expect((chart.getOption()['series'] as any[])[0].links[0].value).toBe(5);
        } finally { chart.dispose(); }
    });
    it('keeps theme styling on data replacement and legend selection on theme merge', () => {
        const card = TestBed.runInInjectionContext(() => new ChartCardComponent());
        const chart = init(null, null, {renderer: 'svg', ssr: true, width: 500, height: 300});
        const formatter = () => 'safe tooltip';
        try {
            for (const value of [10, 20]) {
                card.options = {tooltip: {formatter}, legend: {}, xAxis: {type: 'category', data: ['A']}, yAxis: {}, series: [{name: 'Balance', type: 'bar', data: [value]}]};
                chart.setOption((card as any).presentationOptions, true);
                expect((chart.getOption()['color'] as string[])[0]).toBe(resolvedChartColors().primary);
                expect((chart.getOption()['tooltip'] as any[])[0].formatter).toBe(formatter);
            }
            chart.dispatchAction({type: 'legendUnSelect', name: 'Balance'});
            chart.setOption(chartThemeOptions({...resolvedChartColors(), primary: '#6395ff'}));
            expect((chart.getOption()['legend'] as any[])[0].selected.Balance).toBeFalse();
            expect((chart.getOption()['series'] as any[])[0].data).toEqual([20]);
        } finally { chart.dispose(); }
    });
});
