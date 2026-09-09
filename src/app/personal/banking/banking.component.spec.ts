import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {BankingComponent} from './banking.component';

describe('BankingComponent', () => {
    let component: BankingComponent;
    let fixture: ComponentFixture<BankingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BankingComponent],
            providers: [provideRouter([])]
        })
            .compileComponents();

        fixture = TestBed.createComponent(BankingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
