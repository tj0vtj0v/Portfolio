import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AgGridModule} from 'ag-grid-angular';
import {Account} from '../../../shared/datatype/Account';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';

@Component({
    selector: 'app-account',
    imports: [
        CommonModule,
        FormsModule,
        AgGridModule
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.css'
})
export class AccountComponent {
    protected accounts: Account[] = [];
    protected account?: Account;
    protected accountName?: string;
    protected addingAccount: boolean = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Account', field: 'name', sortable: true, filter: true},
        {headerName: 'Balance', field: 'balance', sortable: true, filter: true}
    ];
    protected modules: Module[] = [ClientSideRowModelModule];

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.accountingService.get_accounts().subscribe(
            (data: any) => {
                this.accounts = data;
                console.log(this.accounts);
            }
        );

        this.account = undefined;
        this.accountName = undefined;
        this.addingAccount = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.account = {...event.data};
        this.accountName = event.data.name;
    }

    onAdd(): void {
        this.addingAccount = true
        this.account = {
            name: '',
            balance: 0
        }
    }

    onSave(): void {
        this.accountingService.add_account(this.account!).subscribe(
            () => {
                this.ngOnInit()
            },
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
        this.accountingService.update_account(this.accountName!, this.account!).subscribe(
            () => {
                this.ngOnInit()
            },
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Edit failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Edit failed';
                }
            }
        )
    }

    onDelete(): void {
        if (confirm('Are you sure you want to delete this account?')) {
            this.accountingService.delete_account(this.accountName!).subscribe(
                () => {
                    this.ngOnInit()
                }
            )
        }
    }
}
