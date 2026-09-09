import {tooltipText} from './tooltip-text';

describe('Tooltip text', () => {
    it('preserves the visible name while preventing markup from creating elements', () => {
        const label = `<img src=x onerror="alert(1)"> A&B's <Savings>`;
        const tooltip = document.createElement('div');
        tooltip.innerHTML = `${tooltipText(label)}<br>12.50 €`;
        expect(tooltip.querySelector('img')).toBeNull();
        expect(tooltip.children.length).toBe(1);
        expect(tooltip.firstChild!.textContent).toBe(label);
        expect(tooltip.querySelector('br')).not.toBeNull();
    });

    it('handles empty values, Unicode, and literal entities without losing text', () => {
        for (const label of ['', 'Öl 🚗 €', '&lt;literal&gt;', null, undefined]) {
            const tooltip = document.createElement('div');
            tooltip.innerHTML = tooltipText(label);
            expect(tooltip.textContent).toBe(String(label ?? ''));
        }
    });
});
