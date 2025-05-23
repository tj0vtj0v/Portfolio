import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Expense} from '../../../shared/datatype/Expense';
import {Account} from '../../../shared/datatype/Account';
import {Category} from '../../../shared/datatype/Category';
import {AllCommunityModule, ColDef, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {forkJoin} from 'rxjs';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';

@Component({
    selector: 'app-expense',
    imports: [
        NumberFormatterDirective,
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
            valueFormatter: (params) => `${params.value?.toFixed(2)} €`
        },
        {headerName: 'Account', field: 'account.name', sortable: true, filter: true},
        {headerName: 'Category', field: 'category.name', sortable: true, filter: true}
    ];

    constructor(
        private accountingService: AccountingService
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
    }

    onGridReady(params: any) {
        params.api.sizeColumnsToFit();
        window.addEventListener('resize', () => {
            params.api.sizeColumnsToFit();
        });

        const startOfMonth = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 0))

        params.api.setFilterModel({
            date: {
                type: 'greaterThan',
                dateFrom: startOfMonth.toISOString().split('T')[0]
            }
        })

        params.api.onFilterChanged();
    }

    ngOnInit() {
        forkJoin([
            this.accountingService.get_expenses(),
            this.accountingService.get_accounts(),
            this.accountingService.get_categories()
        ]).subscribe(([expenses, accounts, categories]) => {
            this.expenses = expenses;
            this.accounts = accounts;
            this.categories = categories;
        });
    }

    trim(): void {
        this.expense!.reason = this.expense!.reason.trim();

        if (this.expense!.amount == null) {
            this.expense!.amount = 0
        }
    }

    check(): boolean {
        if (this.expense!.account == undefined) {
            this.statusMessage = 'The expense must have an account'
            return false;
        }
        if (this.expense!.category == undefined) {
            this.statusMessage = 'The expense must have a category'
            return false;
        }
        if (this.expense!.reason === '') {
            this.statusMessage = 'The expense must have a reason'
            return false;
        }
        if (this.expense!.date === '') {
            this.statusMessage = 'The expense must have a date'
            return false;
        }

        if (this.expense!.amount <= 0) {
            this.statusMessage = 'The expense must be greater than 0';
            return false;
        }

        return true;
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
        this.trim();
        if (!this.check())
            return;

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
        this.trim();
        if (!this.check())
            return;

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
