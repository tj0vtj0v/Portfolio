import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Expense} from '../../../shared/datatype/Expense';
import {Account} from '../../../shared/datatype/Account';
import {Category} from '../../../shared/datatype/Category';
import {ModifyExpense} from '../../../shared/datatype/ModifyExpense';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {switchMap} from 'rxjs';

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
    protected expense?: ModifyExpense;
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
        {headerName: 'Category', field: 'category.name', sortable: true, filter: true},
    ];
    protected modules: Module[] = [ClientSideRowModelModule]

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit() {
        this.accountingService.get_expenses().subscribe(
            (expenses: Expense[]) => {
                this.expenses = expenses; // TODO make one line
            }
        )

        this.accountingService.get_accounts().subscribe(
            (accounts: Account[]) => {
                this.accounts = accounts;
            }
        )

        this.accountingService.get_categories().subscribe(
            (categories: Category[]) => {
                this.categories = categories;
            }
        )
    }

    reset(): void {
        this.ngOnInit()

        this.expense = undefined;
        this.addingExpense = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.expense = {
            id: event.data.id,
            date: event.data.date,
            reason: event.data.reason,
            amount: event.data.amount,
            account: event.data.account.name,
            category: event.data.category.name
        }
    }

    onAdd(): void {
        this.addingExpense = true;

        this.expense = {
            date: new Date().toISOString().split('T')[0],
            reason: '',
            amount: 0,
            account: '',
            category: ''
        }
    }

    onSave(): void {
        if (this.expense!.amount == 0) {
            this.statusMessage = 'The Expense must not have an amount equal to 0';
            return;
        }
        if (this.expense!.account == '' || this.expense!.category == '') {
            this.statusMessage = 'The expense must have an account and a category'
            return;
        }

        this.accountingService.get_account(this.expense!.account).pipe(
            switchMap((account: Account) =>
                this.accountingService.get_category(this.expense!.category).pipe(
                    switchMap((category: Category) => {
                            return this.accountingService.add_expense({
                                    date: this.expense!.date,
                                    reason: this.expense!.reason,
                                    amount: this.expense!.amount,
                                    account: account,
                                    category: category
                                }
                            );
                        }
                    )
                )
            )
        ).subscribe(
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
        // TODO
    }

    onDelete(): void {
        // TODO
    }
}
