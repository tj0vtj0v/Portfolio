import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IncomeComponent} from './income.component';
import {AccountingService} from '../../../shared/api/accounting.service';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {of} from 'rxjs';

describe('IncomeComponent', () => {
    let component: IncomeComponent;
    let fixture: ComponentFixture<IncomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IncomeComponent],
            providers: [provideRouter([]),
                {provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: convertToParamMap({mode: 'add'})}}},
                {provide: AccountingService, useValue: {get_incomes: () => of([]), get_accounts: () => of([{id: 1, name: 'Main', balance: 0}])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(IncomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('opens add mode after account options load', () => {
        expect((component as any).addingIncome).toBeTrue();
        expect(fixture.nativeElement.textContent).toContain('Add income');
    });
});
