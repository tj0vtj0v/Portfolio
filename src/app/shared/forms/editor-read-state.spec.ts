import {TestBed} from '@angular/core/testing';
import {Subject, of, throwError} from 'rxjs';
import {AccountComponent} from '../../personal/accounting/account/account.component';
import {CategoryComponent} from '../../personal/accounting/category/category.component';
import {ExpenseComponent} from '../../personal/accounting/expense/expense.component';
import {IncomeComponent} from '../../personal/accounting/income/income.component';
import {TransferComponent} from '../../personal/accounting/transfer/transfer.component';

describe('accounting read recovery', () => {
    for (const [type, collection] of [[AccountComponent, 'accounts'], [CategoryComponent, 'categories'], [ExpenseComponent, 'expenses'], [IncomeComponent, 'incomes'], [TransferComponent, 'transfers']] as const) {
        it(`${collection}: distinguishes failed reads, retries and cancels on destruction`, () => {
            const response = new Subject<unknown[]>();
            const service: any = {get_accounts: () => of([]), get_categories: () => of([])};
            const read = jasmine.createSpy().and.returnValue(response);
            service[`get_${collection}`] = read;
            const editor: any = TestBed.runInInjectionContext(() => new type(service));
            editor.ngOnInit();
            expect(editor.loading).toBeTrue();
            response.error(new Error('offline'));
            expect(editor.loading).toBeFalse();
            expect(editor.loadError).toContain('Unable to load');
            read.and.returnValue(of([]));
            editor.load();
            expect(editor.loadError).toBe('');
            expect(editor.loading).toBeFalse();
            const pending = new Subject<unknown[]>();
            read.and.returnValue(pending);
            editor.load();
            TestBed.resetTestingModule();
            expect(pending.observed).toBeFalse();
        });
    }

    it('keeps write success distinct from subsequent refresh failure', () => {
        const service: any = {add_account: () => of(undefined), get_accounts: () => throwError(() => new Error('offline'))};
        const editor: any = TestBed.runInInjectionContext(() => new AccountComponent(service));
        editor.onAdd();
        editor.account.name = 'Main';
        editor.onSave();
        expect(editor.account).toBeUndefined();
        expect(editor.successMessage).toContain('successfully');
        expect(editor.loadError).toContain('Unable to load');
        expect(editor.submission.pending).toBeFalse();
    });
});
