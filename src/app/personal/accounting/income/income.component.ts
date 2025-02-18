import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Income} from '../../../shared/datatype/Income';
import {Account} from '../../../shared/datatype/Account';
import {AllCommunityModule, ColDef, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {forkJoin} from 'rxjs';

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
            this.accountingService.get_incomes(),
            this.accountingService.get_accounts()
        ]).subscribe(([incomes, accounts]) => {
            this.incomes = incomes;
            this.accounts = accounts;
        });
    }

    trim(): void {
        this.income!.reason = this.income!.reason.trim();
    }

    reset(): void {
        this.ngOnInit()

        this.income = undefined;
        this.addingIncome = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        const account = this.accounts.find(account => account.id === event.data.account.id);
        this.income = {
            id: event.data.id,
            date: event.data.date,
            reason: event.data.reason,
            amount: event.data.amount,
            account: account
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
        this.trim()

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
        this.trim()

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
