import {chartThemeOptions, resolvedChartColors} from './chart-theme';

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
});
