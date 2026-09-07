import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {DashboardDataService} from './dashboard-data.service';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';

import {DashboardComponent} from './dashboard.component';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [{provide: DashboardDataService, useValue: {
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

    it('renders five charts after an empty response and clears loading feedback', () => {
        expect(fixture.nativeElement.querySelectorAll('app-chart-card').length).toBe(5);
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });

    it('shows a load failure instead of leaving the loading state active', () => {
        spyOn(TestBed.inject(DashboardDataService), 'load').and.returnValue(throwError(() => new Error('Offline')));
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to load');
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });
});
