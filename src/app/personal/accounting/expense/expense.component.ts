import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
import {Expense} from '../../../shared/datatype/Expense';
import {Account} from '../../../shared/datatype/Account';
import {Category} from '../../../shared/datatype/Category';
import {AllCommunityModule, ColDef, IFilterComp, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {forkJoin} from 'rxjs';

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

    constructor(
        private accountingService: AccountingService
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
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
        this.trim()

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
        this.trim()

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
