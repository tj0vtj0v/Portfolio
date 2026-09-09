import {chartThemeOptions, resolvedChartColors} from './chart-theme';

describe('chart theme', () => {
    it('resolves semantic CSS tokens to canvas-safe color strings', () => {
        const root = document.createElement('div');
        root.style.setProperty('--color-text', 'rgb(1, 2, 3)');
        root.style.setProperty('--color-primary', '#123456');
        document.body.appendChild(root);
        const colors = resolvedChartColors(root);
        expect(colors.text).toBe('rgb(1, 2, 3)');
        expect(colors.primary).toBe('#123456');
        expect(JSON.stringify(chartThemeOptions(colors))).not.toContain('var(--color');
        root.remove();
    });
});
