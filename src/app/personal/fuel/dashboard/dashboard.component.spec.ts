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
