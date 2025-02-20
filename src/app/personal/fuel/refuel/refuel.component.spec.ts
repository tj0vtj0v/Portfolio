import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RefuelComponent} from './refuel.component';

describe('RefuelComponent', () => {
    let component: RefuelComponent;
    let fixture: ComponentFixture<RefuelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RefuelComponent]
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
