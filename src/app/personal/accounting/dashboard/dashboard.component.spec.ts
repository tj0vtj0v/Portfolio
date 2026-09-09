import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, Subject, throwError} from 'rxjs';
import {DashboardDataService} from './dashboard-data.service';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';

import {DashboardComponent} from './dashboard.component';
import {provideRouter} from '@angular/router';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [provideRouter([]), {provide: DashboardDataService, useValue: {
                load: () => of({accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()})
            }}]
        })
            .overrideComponent(ChartCardComponent, {set: {template: '', imports: [], providers: []}})
            .compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('reserves dashboard space while data is pending and replaces it after the response', () => {
        const response = new Subject<any>();
        spyOn(TestBed.inject(DashboardDataService), 'load').and.returnValue(response);
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-ui-skeleton')).not.toBeNull();
        expect(fixture.nativeElement.querySelectorAll('app-chart-card').length).toBe(0);
        expect(fixture.nativeElement.querySelector('app-date-range')).not.toBeNull();
        response.next({accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()});
        response.complete();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-ui-skeleton')).toBeNull();
        expect(fixture.nativeElement.querySelectorAll('app-chart-card').length).toBe(4 + (component as any).monthlyCharts.length);
    });

    it('renders overview and monthly charts after an empty response and clears loading feedback', () => {
        expect(fixture.nativeElement.querySelectorAll('app-chart-card').length).toBe(4 + (component as any).monthlyCharts.length);
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });

    it('exposes real quick-action destinations and truthful balance labeling', () => {
        const links = Array.from(fixture.nativeElement.querySelectorAll('a')).map((link: any) => link.getAttribute('href'));
        expect(links).toContain('/accounting/expenses?mode=add');
        expect(links).toContain('/accounting/incomes?mode=add');
        expect(links).toContain('/accounting/transfers?mode=add');
        expect(fixture.nativeElement.textContent).toContain('Current balance');
        expect(fixture.nativeElement.textContent).toContain('Recent activity');
    });

    it('shows a load failure instead of leaving the loading state active', () => {
        spyOn(TestBed.inject(DashboardDataService), 'load').and.returnValue(throwError(() => new Error('Offline')));
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to load');
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });
});
