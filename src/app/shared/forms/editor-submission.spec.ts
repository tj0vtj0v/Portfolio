import {TestBed} from '@angular/core/testing';
import {of, Subject} from 'rxjs';
import {AccountComponent} from '../../personal/accounting/account/account.component';
import {CategoryComponent} from '../../personal/accounting/category/category.component';
import {ExpenseComponent} from '../../personal/accounting/expense/expense.component';
import {IncomeComponent} from '../../personal/accounting/income/income.component';
import {TransferComponent} from '../../personal/accounting/transfer/transfer.component';
import {CarComponent} from '../../personal/fuel/car/car.component';
import {RefuelComponent} from '../../personal/fuel/refuel/refuel.component';

describe('Editor submission protection', () => {
    const editors = [
        {component: AccountComponent, entity: 'account'},
        {component: CategoryComponent, entity: 'category'},
        {component: ExpenseComponent, entity: 'expense'},
        {component: IncomeComponent, entity: 'income'},
        {component: TransferComponent, entity: 'transfer'},
        {component: CarComponent, entity: 'car'},
        {component: RefuelComponent, entity: 'refuel'}
    ];

    for (const {component, entity} of editors) {
        it(`${entity}: blocks save/update/delete overlap and keeps the draft after a network error`, () => {
            const response = new Subject<void>();
            const add = jasmine.createSpy().and.returnValue(response);
            const update = jasmine.createSpy().and.returnValue(response);
            const remove = jasmine.createSpy().and.returnValue(response);
            const service: any = {[`add_${entity}`]: add, [`update_${entity}`]: update, [`delete_${entity}`]: remove};
            const editor: any = TestBed.runInInjectionContext(() => new component(service));
            editor.onAdd();
            spyOn(editor, 'trim');
            spyOn(editor, 'check').and.returnValue(true);
            spyOn(editor, 'reset');
            const draft = editor[entity];
            editor.onSave();
            editor.onSave();
            editor.onUpdate();
            editor.onDelete();
            expect(add).toHaveBeenCalledTimes(1);
            expect(update).not.toHaveBeenCalled();
            expect(remove).not.toHaveBeenCalled();
            expect(editor.submission.pending).toBeTrue();
            response.error({status: 503});
            expect(editor.submission.pending).toBeFalse();
            expect(editor[entity]).toBe(draft);
            expect(editor.reset).not.toHaveBeenCalled();
            expect(editor.statusMessage).toContain('failed');
            add.and.returnValue(of(undefined));
            editor.onSave();
            expect(add).toHaveBeenCalledTimes(2);
            expect(editor.reset).toHaveBeenCalledTimes(1);
        });

        it(`${entity}: prevents requests for invalid input and cancels subscriptions on destruction`, () => {
            const response = new Subject<void>();
            const add = jasmine.createSpy().and.returnValue(response);
            const editor: any = TestBed.runInInjectionContext(() => new component({[`add_${entity}`]: add} as any));
            editor.onAdd();
            spyOn(editor, 'trim');
            const check = spyOn(editor, 'check').and.returnValue(false);
            editor.onSave();
            expect(add).not.toHaveBeenCalled();
            expect(editor.submission.pending).toBeFalse();
            check.and.returnValue(true);
            const reset = spyOn(editor, 'reset');
            editor.onSave();
            TestBed.resetTestingModule();
            expect(editor.submission.pending).toBeFalse();
            response.next();
            expect(reset).not.toHaveBeenCalled();
        });
    }
});
