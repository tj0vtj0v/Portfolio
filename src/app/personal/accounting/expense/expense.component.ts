import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Expense} from '../../../shared/datatype/Expense';
import {Account} from '../../../shared/datatype/Account';
import {Category} from '../../../shared/datatype/Category';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';

@Component({
    selector: 'app-expense',
    imports: [
        AgGridAngular,
        FormsModule,
        CommonModule
    ],
    templateUrl: './expense.component.html',
    styleUrl: './expense.component.css'
})
export class ExpenseComponent {
    protected expenses: Expense[] = [];
    protected accounts: Account[] = [];
    protected categories: Category[] = [];
    protected expense?: Expense;
    protected addingExpense: boolean = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {headerName: 'Reason', field: 'reason', sortable: true, filter: true},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)}€`
        },
        {headerName: 'Account', field: 'account.name', sortable: true, filter: true},
        {headerName: 'Category', field: 'category.name', sortable: true, filter: true}
    ];
    protected modules: Module[] = [ClientSideRowModelModule]

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit() {
        this.accountingService.get_expenses().subscribe(
            (expenses: Expense[]) => this.expenses = expenses
        )

        this.accountingService.get_accounts().subscribe(
            (accounts: Account[]) => this.accounts = accounts
        )

        this.accountingService.get_categories().subscribe(
            (categories: Category[]) => this.categories = categories
        )
    }

    reset(): void {
        this.ngOnInit()

        this.expense = undefined;
        this.addingExpense = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        const account = this.accounts.find(account => account.id === event.data.account.id);
        const category = this.categories.find(category => category.id === event.data.category.id);
        this.expense = {
            id: event.data.id,
            date: event.data.date,
            reason: event.data.reason,
            amount: event.data.amount,
            account: account,
            category: category
        }
    }

    onAdd(): void {
        this.addingExpense = true;

        this.expense = {
            date: new Date().toISOString().split('T')[0],
            reason: '',
            amount: 0,
            account: undefined,
            category: undefined
        }
    }

    onSave(): void {
        if (this.expense!.account == undefined || this.expense!.category == undefined) {
            this.statusMessage = 'The expense must have an account and a category'
            return;
        }

        this.accountingService.add_expense(this.expense!).subscribe(
            () => this.reset(),
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Adding failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Adding failed';
                }
            }
        );
    }

    onUpdate(): void {
        if (this.expense!.amount == 0) {
            this.statusMessage = 'The Expense must not have an amount equal to 0';
            return;
        }
        this.accountingService.update_expense(this.expense!).subscribe(
            () => this.reset(),
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Edit failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Edit failed';
                }
            }
        );
    }

    onDelete(): void {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.accountingService.delete_expense(this.expense!.id!).subscribe(
                () => this.reset(),
                (error) => {
                    if (error?.error?.detail) {
                        this.statusMessage = `Delete failed: ${error.error.detail}`;
                    } else {
                        this.statusMessage = 'Delete failed';
                    }
                }
            )
        }
    }
}
