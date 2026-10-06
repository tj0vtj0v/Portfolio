import {TestBed} from '@angular/core/testing';
import {GridFilterStateService} from './grid-filter-state.service';

describe('GridFilterStateService', () => {
    let service: GridFilterStateService;
    const key = 'test-grid';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridFilterStateService);
        sessionStorage.removeItem(`portfolio.grid-filters.${key}`);
    });

    afterEach(() => sessionStorage.removeItem(`portfolio.grid-filters.${key}`));

    it('round-trips a filter model for the current browser session', () => {
        const model = {reason: {filterType: 'text', type: 'contains', filter: 'coffee'}};
        service.save(key, model);

        expect(service.load(key)).toEqual(model);
    });

    it('preserves an explicitly empty filter model', () => {
        service.save(key, {});

        expect(service.load(key)).toEqual({});
    });

    it('builds the current-month date filter from the local calendar', () => {
        jasmine.clock().install();
        try {
            jasmine.clock().mockDate(new Date(2026, 9, 6));
            expect(service.currentMonthFilterModel()).toEqual({date: {type: 'greaterThan', dateFrom: '2026-09-30'}});
        } finally {
            jasmine.clock().uninstall();
        }
    });
});
