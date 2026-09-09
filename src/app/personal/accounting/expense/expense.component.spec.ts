import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpenseComponent} from './expense.component';
import {AccountingService} from '../../../shared/api/accounting.service';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {of} from 'rxjs';

describe('ExpenseComponent', () => {
    let component: ExpenseComponent;
    let fixture: ComponentFixture<ExpenseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ExpenseComponent],
            providers: [provideRouter([]),
                {provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: convertToParamMap({mode: 'add'})}}},
                {provide: AccountingService, useValue: {get_expenses: () => of([]), get_accounts: () => of([{id: 1, name: 'Main', balance: 0}]), get_categories: () => of([{id: 1, name: 'Food'}])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ExpenseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('opens add mode only after selection data loads', () => {
        expect((component as any).addingExpense).toBeTrue();
        expect((component as any).accounts.length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain('Add expense');
    });
});
