import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CarComponent} from './car.component';
import {FuelService} from '../../../shared/api/fuel.service';
import {of} from 'rxjs';

describe('CarComponent', () => {
    let component: CarComponent;
    let fixture: ComponentFixture<CarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CarComponent],
            providers: [{provide: FuelService, useValue: {get_cars: () => of([])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
