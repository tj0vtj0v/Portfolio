import {chartHasData} from './chart-card.component';

describe('ChartCard data state', () => {
    it('distinguishes empty/null series from real zero values and tuples', () => {
        expect(chartHasData({series: []})).toBeFalse();
        expect(chartHasData({series: [{type: 'line', data: [null, null]}]})).toBeFalse();
        expect(chartHasData({series: [{type: 'line', data: [0]}]})).toBeTrue();
        expect(chartHasData({series: [{type: 'line', data: [['2026-01-01', 12]]}]})).toBeTrue();
    });
});
