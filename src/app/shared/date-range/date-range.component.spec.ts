import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from '@angular/router';
import {DateRangeComponent} from './date-range.component';

describe('DateRangeComponent', () => {
    let fixture: ComponentFixture<DateRangeComponent>;
    let query: BehaviorSubject<ParamMap>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        query = new BehaviorSubject(convertToParamMap({period: '30'}));
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        router.navigate.and.resolveTo(true);
        await TestBed.configureTestingModule({
            imports: [DateRangeComponent],
            providers: [
                {provide: ActivatedRoute, useValue: {queryParamMap: query, snapshot: {}}},
                {provide: Router, useValue: router}
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(DateRangeComponent);
        fixture.detectChanges();
        router.navigate.calls.reset();
    });

    it('restores valid browser URL state', () => {
        expect((fixture.componentInstance as any).period).toBe('30');
        query.next(convertToParamMap({period: 'custom', from: '2026-02-01', to: '2026-02-02'}));
        fixture.detectChanges();
        expect((fixture.componentInstance as any).from).toBe('2026-02-01');
        expect(fixture.nativeElement.textContent).toContain('2026-02-01 – 2026-02-02');
    });

    it('keeps invalid custom drafts visible and emits an empty state', () => {
        const emitted = jasmine.createSpy('range');
        fixture.componentInstance.rangeChange.subscribe(emitted);
        const component = fixture.componentInstance as any;
        component.period = 'custom';
        component.from = '2026-02-03';
        component.to = '2026-02-02';
        component.applyCustom();
        fixture.detectChanges();
        expect(component.from).toBe('2026-02-03');
        expect(emitted).toHaveBeenCalledWith(null);
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('on or before');
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('serializes a corrected custom range without refetching itself', () => {
        const component = fixture.componentInstance as any;
        component.period = 'custom';
        component.from = '2026-02-02';
        component.to = '2026-02-02';
        component.applyCustom();
        expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
            queryParams: {period: 'custom', from: '2026-02-02', to: '2026-02-02'}
        }));
    });
});
