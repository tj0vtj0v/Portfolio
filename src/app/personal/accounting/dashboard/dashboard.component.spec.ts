import {NotificationService} from '../../../shared/ui/feedback/notification.service';
import {AMOUNT_PRIVACY_KEY} from '../../../shared/privacy/amount-privacy.service';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, Subject, throwError} from 'rxjs';
import {DashboardDataService} from './dashboard-data.service';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';

import {DashboardComponent} from './dashboard.component';
import {provideRouter, Router} from '@angular/router';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(async () => {
        spyOn(Storage.prototype, 'getItem').and.callFake(() => null);
        spyOn(Storage.prototype, 'setItem');
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

    it('shows ten activities first, adds fifty at a time, and returns to ten', () => {
        (component as any).activities = Array.from({length: 121}, (_, index) => ({
            type: 'expense', id: index + 1, date: '2026-01-01', description: `Expense ${index + 1}`, context: '', amount: -1
        }));
        fixture.detectChanges();

        const activityRows = () => fixture.nativeElement.querySelectorAll('.activity-table-wrap tbody tr').length;
        const toggle = (label: string) => Array.from(fixture.nativeElement.querySelectorAll('.activity-toggle'))
            .find((button: any) => button.textContent.trim() === label) as HTMLButtonElement | undefined;

        expect(activityRows()).toBe(10);
        expect(toggle('Show more')).toBeTruthy();
        expect(toggle('Show less')).toBeUndefined();

        toggle('Show more')!.click();
        fixture.detectChanges();
        expect(activityRows()).toBe(60);

        toggle('Show more')!.click();
        fixture.detectChanges();
        expect(activityRows()).toBe(110);

        toggle('Show more')!.click();
        fixture.detectChanges();
        expect(activityRows()).toBe(121);
        expect(toggle('Show more')).toBeUndefined();

        toggle('Show less')!.click();
        fixture.detectChanges();
        expect(activityRows()).toBe(10);
    });

    it('selects a complete clicked month through the URL and updates the date filter without reloading data', async () => {
        const router = TestBed.inject(Router);
        const load = spyOn(TestBed.inject(DashboardDataService), 'load').and.callThrough();
        await router.navigateByUrl('/?period=custom&from=2024-01-15&to=2024-12-15');
        fixture.detectChanges();
        const month: HTMLAnchorElement = fixture.nativeElement.querySelector('a.monthly-chart[aria-label^="Select Feb 2024"]');
        expect(month).not.toBeNull();
        expect(month.getAttribute('href')).toContain('from=2024-02-01');
        expect(month.getAttribute('href')).toContain('to=2024-02-29');
        month.click();
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(router.parseUrl(router.url).queryParams).toEqual({period: 'custom', from: '2024-02-01', to: '2024-02-29'});
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#dashboard-from .ui-date-input__value').textContent).toBe('01/02/2024');
        expect(fixture.nativeElement.querySelector('#dashboard-to .ui-date-input__value').textContent).toBe('29/02/2024');
        expect((component as any).monthlyCharts.map((entry: any) => entry.month)).toEqual(['2024-02']);
        expect(load).not.toHaveBeenCalled();
    });

    it('shows a load failure instead of leaving the loading state active', async () => {
        spyOn(TestBed.inject(DashboardDataService), 'load').and.returnValue(throwError(() => new Error('Offline')));
        component.ngOnInit();
        fixture.detectChanges();
        await Promise.resolve();
        expect(TestBed.inject(NotificationService).notifications().some(item => item.message.includes('Unable to load') && item.kind === 'error')).toBeTrue();
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });

    it('toggles summaries and monthly accessibility text without resetting activity or fetching data', () => {
        const load = spyOn(TestBed.inject(DashboardDataService), 'load');
        (component as any).currentBalance = 9876.54;
        (component as any).activityFilter = 'expense';
        (component as any).activityVisibleCount = 60;
        fixture.detectChanges();
        const charts = (component as any).charts;
        expect(fixture.nativeElement.querySelector('.summary-grid strong').textContent.trim()).toBe('€ 9,876.54');
        fixture.nativeElement.querySelector('app-amount-privacy-toggle button').click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.summary-grid').textContent).not.toContain('9,876.54');
        expect(fixture.nativeElement.querySelectorAll('.summary-grid [aria-label="Amount hidden"]').length).toBe(4);
        for (const link of fixture.nativeElement.querySelectorAll('.monthly-chart')) {
            expect(link.getAttribute('aria-label')).not.toContain('expenses');
        }
        expect((component as any).charts).toBe(charts);
        expect((component as any).activityFilter).toBe('expense');
        expect((component as any).activityVisibleCount).toBe(60);
        expect(load).not.toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith(AMOUNT_PRIVACY_KEY, 'true');
    });
});
