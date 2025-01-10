import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Income} from '../../../shared/datatype/Income';
import {Account} from '../../../shared/datatype/Account';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';

@Component({
    selector: 'app-income',
    imports: [
        AgGridAngular,
        FormsModule,
        NgForOf,
        NgIf,
        ReactiveFormsModule
    ],
    templateUrl: './income.component.html',
    styleUrl: './income.component.css'
})
export class IncomeComponent {
    protected incomes: Income[] = [];
    protected accounts: Account[] = [];
    protected income?: Income;
    protected addingIncome = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {headerName: 'Reason', field: 'reason', sortable: true, filter: true},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)}€`
        },
        {headerName: 'Account', field: 'account.name', sortable: true, filter: true}
    ];
    protected modules: Module[] = [ClientSideRowModelModule]

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit() {
        this.accountingService.get_incomes().subscribe(
            (incomes: Income[]) => this.incomes = incomes
        )

        this.accountingService.get_accounts().subscribe(
            (accounts: Account[]) => this.accounts = accounts
        )
    }

    reset(): void {
        this.ngOnInit()

        this.income = undefined;
        this.addingIncome = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.income = {
            id: event.data.id,
            date: event.data.date,
            reason: event.data.reason,
            amount: event.data.amount,
            account: event.data.account
        }
    }

    onAdd(): void {
        this.addingIncome = true;

        this.income = {
            date: new Date().toISOString().split('T')[0],
            reason: '',
            amount: 0,
            account: undefined
        }
    }

    onSave(): void {
        if (this.income!.account == undefined) {
            this.statusMessage = 'The income must have an account';
            return;
        }

        this.accountingService.add_income(this.income!).subscribe(
            () => this.reset(),
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Adding failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Adding failed';
                }
            }
        )
    }

    onUpdate(): void {
        this.accountingService.update_income(this.income!).subscribe(
            () => this.reset(),
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Adding failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Adding failed';
                }
            }
        )
    }

    onDelete(): void {
        if (confirm('Are you sure you want to delete this income?')) {
            this.accountingService.delete_income(this.income!.id!).subscribe(
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
