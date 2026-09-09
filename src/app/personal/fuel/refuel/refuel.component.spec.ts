import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RefuelComponent} from './refuel.component';
import {FuelService} from '../../../shared/api/fuel.service';
import {of} from 'rxjs';

describe('RefuelComponent', () => {
    let component: RefuelComponent;
    let fixture: ComponentFixture<RefuelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RefuelComponent],
            providers: [{provide: FuelService, useValue: {get_refuels: () => of([]), get_cars: () => of([]), get_fuel_types: () => of([])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RefuelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
