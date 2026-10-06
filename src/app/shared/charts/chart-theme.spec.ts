import {chartThemeForOptions, chartThemeOptions, resolvedChartColors} from './chart-theme';

describe('chart theme', () => {
    it('resolves semantic CSS tokens to canvas-safe color strings', () => {
        const root = document.createElement('div');
        root.style.setProperty('--color-chart-text', 'rgb(1, 2, 3)');
        root.style.setProperty('--color-primary', '#123456');
        root.style.setProperty('--color-chart-2', '#b26135');
        document.body.appendChild(root);
        const colors = resolvedChartColors(root);
        expect(colors.text).toBe('rgb(1, 2, 3)');
        expect(colors.primary).toBe('#123456');
        expect((chartThemeOptions(colors)['color'] as string[])[1]).toBe('#b26135');
        expect(new Set(chartThemeOptions(colors)['color'] as string[]).size).toBe(8);
        expect(JSON.stringify(chartThemeOptions(colors))).not.toContain('var(--color');
        root.remove();
    });

    it('uses the resolved palette for boxplot fills in both color modes', () => {
        const colors = {...resolvedChartColors(), palette: ['#111111', '#222222'], surface: '#ffffff'};
        const theme = chartThemeForOptions({
            series: [
                {type: 'boxplot', colorBy: 'series', data: [[1, 2, 3, 4, 5]]},
                {type: 'boxplot', colorBy: 'data', data: [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]}
            ]
        }, colors) as any;

        expect(theme.series[0].data[0].value).toEqual([1, 2, 3, 4, 5]);
        expect(theme.series[0].data[0].itemStyle.color).not.toBe('#111111');
        expect(theme.series[0].data[0].itemStyle.borderColor).toBe('#111111');
        expect(theme.series[1].data[1].itemStyle.color).not.toBe('#222222');
        expect(theme.series[1].data[1].itemStyle.borderColor).toBe('#222222');
    });
});
