import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {of, Subject} from 'rxjs';
import {ExpenseComponent} from './expense/expense.component';
import {AccountingService} from '../../shared/api/accounting.service';

describe('reused accounting editor routes', () => {
    it('reconciles editor query changes without resetting drafts on unrelated queries', async () => {
        const saveResponse = new Subject<void>();
        TestBed.configureTestingModule({providers: [provideRouter([{path: 'expenses', component: ExpenseComponent}]),
            {provide: AccountingService, useValue: {
                get_expenses: () => of([{id: 1, reason: 'Original', date: '2026-09-08', amount: 10}]),
                get_accounts: () => of([]), get_categories: () => of([]), add_expense: () => saveResponse
            }}]});
        const router = await RouterTestingHarness.create();
        const editor: any = await router.navigateByUrl('/expenses?mode=add', ExpenseComponent);
        expect(editor.addingExpense).toBeTrue();
        editor.expense.reason = 'Draft';
        expect(await router.navigateByUrl('/expenses?mode=add&other=1', ExpenseComponent)).toBe(editor);
        expect(editor.expense.reason).toBe('Draft');
        spyOn(editor, 'check').and.returnValue(true);
        editor.onSave();
        await router.navigateByUrl('/expenses?recordId=1', ExpenseComponent);
        expect(editor.expense.reason).toBe('Draft');
        saveResponse.error(new Error('offline'));
        expect(editor.addingExpense).toBeFalse();
        expect(editor.expense.reason).toBe('Original');
        await router.navigateByUrl('/expenses?recordId=999', ExpenseComponent);
        expect(editor.expense).toBeUndefined();
        expect(editor.statusMessage).toContain('not found');
        await router.navigateByUrl('/expenses', ExpenseComponent);
        expect(editor.statusMessage).toBe('');
    });
});
