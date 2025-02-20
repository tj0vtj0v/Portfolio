import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AgGridModule} from 'ag-grid-angular';
import {Account} from '../../../shared/datatype/Account';
import {AllCommunityModule, ColDef, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';

@Component({
    selector: 'app-account',
    imports: [
        AgGridModule,
        FormsModule,
        CommonModule
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
        {
            headerName: 'Balance', field: 'balance', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)}€`
        }
    ];

    onGridReady(params: any) {
        params.api.sizeColumnsToFit();
        window.addEventListener('resize', () => {
            params.api.sizeColumnsToFit();
        });
    }

    constructor(
        private accountingService: AccountingService
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
    }

    ngOnInit(): void {
        this.accountingService.get_accounts().subscribe(
            (accounts: Account[]) => this.accounts = accounts
        );
    }

    trim(): void {
        this.account!.name = this.account!.name.trim();

        if (this.account!.balance == null) {
            this.account!.balance = 0
        }
    }

    check(): boolean {
        if (this.account!.name === '') {
            this.statusMessage = 'The account must have a name';
            return false;
        }

        return true
    }

    reset(): void {
        this.ngOnInit();

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
        this.addingAccount = true;
        this.account = {
            name: '',
            balance: 0
        };
    }

    onSave(): void {
        this.trim();
        if (!this.check())
            return;

        this.accountingService.add_account(this.account!).subscribe(
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
        this.trim();
        if (!this.check())
            return;

        this.accountingService.update_account(this.accountName!, this.account!).subscribe(
            () => this.reset(),
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
