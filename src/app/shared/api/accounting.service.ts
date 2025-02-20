import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {Account} from '../datatype/Account';
import {Transfer} from '../datatype/Transfer';
import {Category} from '../datatype/Category';
import {Expense} from '../datatype/Expense';
import {Income} from '../datatype/Income';

@Injectable({
    providedIn: 'root'
})
export class AccountingService {

    constructor(
        private connectorService: ConnectorService
    ) {
    }

    // account management
    public add_account(account: Account): Observable<any> {
        return this.connectorService.add('accounting/accounts', account);
    }

    public get_accounts(): Observable<any> {
        return this.connectorService.get('accounting/accounts');
    }

    public get_account_history(account_name: string): Observable<any> {
        return this.connectorService.get(`accounting/accounts/${account_name}/history`);
    }

    public update_account(account_name: string, account: Account): Observable<any> {
        return this.connectorService.update(`accounting/accounts/${account_name}`, account);
    }

    public delete_account(account_name: string): Observable<any> {
        return this.connectorService.delete(`accounting/accounts/${account_name}`);
    }

    // transfer management
    public add_transfer(transfer: Transfer): Observable<any> {
        return this.connectorService.add(
            'accounting/transfers',
            {
                date: transfer.date,
                amount: transfer.amount,
                source_id: transfer.source!.id,
                target_id: transfer.target!.id,
            }
        );
    }

    public get_transfers(): Observable<any> {
        return this.connectorService.get('accounting/transfers');
    }

    public update_transfer(transfer: Transfer): Observable<any> {
        return this.connectorService.update(
            `accounting/transfers/${transfer.id}`,
            {
                date: transfer.date,
                amount: transfer.amount,
                source_id: transfer.source!.id,
                target_id: transfer.target!.id,
            }
        );
    }

    public delete_transfer(id: number): Observable<any> {
        return this.connectorService.delete(`accounting/transfers/${id}`);
    }

    // category management
    public add_category(category: Category): Observable<any> {
        return this.connectorService.add('accounting/categories', category);
    }

    public get_categories(): Observable<any> {
        return this.connectorService.get('accounting/categories');
    }

    public update_category(name: string, category: Category): Observable<any> {
        return this.connectorService.update(`accounting/categories/${name}`, category);
    }

    public delete_category(name: string): Observable<any> {
        return this.connectorService.delete(`accounting/categories/${name}`);
    }

    // expense management
    public add_expense(expense: Expense): Observable<any> {
        return this.connectorService.add(
            'accounting/expenses',
            {
                date: expense.date,
                reason: expense.reason,
                amount: expense.amount,
                account_id: expense.account!.id,
                category_id: expense.category!.id
            }
        );
    }

    public get_expenses(): Observable<any> {
        return this.connectorService.get('accounting/expenses');
    }

    public update_expense(expense: Expense): Observable<any> {
        return this.connectorService.update(
            `accounting/expenses/${expense.id}`,
            {
                date: expense.date,
                reason: expense.reason,
                amount: expense.amount,
                account_id: expense.account!.id,
                category_id: expense.category!.id
            }
        );
    }

    public delete_expense(id: number): Observable<any> {
        return this.connectorService.delete(`accounting/expenses/${id}`);
    }

    // income management
    public add_income(income: Income): Observable<any> {
        return this.connectorService.add(
            'accounting/incomes',
            {
                date: income.date,
                reason: income.reason,
                amount: income.amount,
                account_id: income.account!.id
            }
        );
    }

    public get_incomes(): Observable<any> {
        return this.connectorService.get('accounting/incomes');
    }

    public update_income(income: Income): Observable<any> {
        return this.connectorService.update(
            `accounting/incomes/${income.id}`,
            {
                date: income.date,
                reason: income.reason,
                amount: income.amount,
                account_id: income.account!.id
            }
        );
    }

    public delete_income(id: number): Observable<any> {
        return this.connectorService.delete(`accounting/incomes/${id}`);
    }
}
