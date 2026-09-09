import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardComponent} from './dashboard.component';
import {provideRouter} from '@angular/router';
import {FuelService} from '../../../shared/api/fuel.service';
import {of} from 'rxjs';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [provideRouter([]), {provide: FuelService, useValue: {get_fuel_types: () => of([]), get_cars: () => of([]), get_refuels: () => of([])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('groups consumption per fuel type in litres per 100 km', () => {
        const dashboard = component as any;
        dashboard.refuels = Array.from({length: 5}, (_, index) => ({
            date: '2026-02-02', distance: 100, consumption: index + 4, cost: (index + 4) * 2,
            car: {name: 'Car'}, fuel_type: {name: 'Fuel'}
        }));
        component.update({period: 'custom', from: '2026-02-01', to: '2026-02-02', observedTo: '2026-02-02'});
        expect(dashboard.fuel_consumption_chart.series[0].data).toEqual([[4, 5, 6, 7, 8]]);
        component.update(null);
        expect(dashboard.fuel_consumption_chart.series[0].data).toEqual([]);
    });

    it('summarizes only records inside the inclusive observed period and clears stale totals', () => {
        const dashboard = component as any;
        dashboard.refuels = ['2026-02-03', '2026-02-02', '2026-01-31', '2026-02-01'].map(date => ({
            date, distance: 100, consumption: 6, cost: 12, car: {name: 'Car'}, fuel_type: {name: 'Fuel'}
        }));
        const range = {period: 'custom' as const, from: '2026-02-01', to: '2026-02-03', observedTo: '2026-02-02'};
        component.update(range);
        component.update(range);
        expect(dashboard.travelSummary).toEqual({distance: 200, fuel: 12, cost: 24, lastRefuel: '2026-02-02'});
        component.update({...range, from: '2026-01-01', to: '2026-01-02', observedTo: '2026-01-02'});
        expect(dashboard.travelSummary).toEqual({distance: 0, fuel: 0, cost: 0, lastRefuel: ''});
        component.update(null);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.summary-grid')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Price per litre');
    });

    it('rebuilds maps without mutating or duplicating source refuels', () => {
        const dashboard = component as any;
        dashboard.refuels = [
            {date: '2026-02-02', distance: 100, consumption: 6, cost: 10, car: {name: 'Car'}, fuel_type: {name: 'Fuel'}},
            {date: '2026-02-01', distance: 50, consumption: 3, cost: 5, car: {name: 'Car'}, fuel_type: {name: 'Fuel'}}
        ];
        const range = {period: 'custom', from: '2026-02-01', to: '2026-02-02', observedTo: '2026-02-02'};
        component.update(range as any);
        component.update(range as any);
        expect(dashboard.refuels.map((entry: any) => entry.date)).toEqual(['2026-02-02', '2026-02-01']);
        expect(dashboard.carRefuelMap.get('Car').length).toBe(2);
        expect(dashboard.fuelRefuelMap.get('Fuel').length).toBe(2);
    });
});
