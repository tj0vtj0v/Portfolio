import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FuelComponent} from './fuel.component';

describe('FuelComponent', () => {
    let component: FuelComponent;
    let fixture: ComponentFixture<FuelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FuelComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FuelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
