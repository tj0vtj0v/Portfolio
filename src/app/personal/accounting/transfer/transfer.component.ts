import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {Transfer} from '../../../shared/datatype/Transfer';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {Account} from '../../../shared/datatype/Account';
import {ModifyTransfer} from '../../../shared/datatype/ModifyTransfer';
import {switchMap} from 'rxjs';

@Component({
    selector: 'app-transfer',
    imports: [
        AgGridAngular,
        FormsModule,
        CommonModule
    ],
    templateUrl: './transfer.component.html',
    styleUrl: './transfer.component.css'
})
export class TransferComponent {
    protected accounts?: Account[] = [];
    protected transfers: Transfer[] = [];
    protected transfer?: ModifyTransfer;
    protected addingTransfer: boolean = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {headerName: 'Amount', field: 'amount', sortable: true, filter: true},
        {headerName: 'Source Account', field: 'source.name', sortable: true, filter: true},
        {headerName: 'Target Account', field: 'target.name', sortable: true, filter: true},
    ];
    protected modules: Module[] = [ClientSideRowModelModule]

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.accountingService.get_transfers().subscribe(
            (transfers) => {
                this.transfers = transfers;
            }
        )

        this.accountingService.get_accounts().subscribe(
            (accounts: Account[]) => {
                this.accounts = accounts;
            }
        )
    }

    reset(): void {
        this.ngOnInit()

        this.transfer = undefined;
        this.addingTransfer = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.transfer = {
            id: event.data.id,
            date: event.data.date,
            amount: event.data.amount,
            source: event.data.source.name,
            target: event.data.target.name
        };
    }

    onAdd(): void {
        this.addingTransfer = true;

        this.transfer = {
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            source: '',
            target: ''
        }
    }

    onSave(): void {
        if (this.transfer!.source == '' || this.transfer!.target == '') {
            this.statusMessage = 'The Transfer must have a source and a target';
            return;
        }

        this.accountingService.get_account(this.transfer!.source).pipe(
            switchMap((source_account: Account) =>
                this.accountingService.get_account(this.transfer!.target).pipe(
                    switchMap((target_account: Account) => {
                            return this.accountingService.add_transfer({
                                    date: this.transfer!.date,
                                    amount: this.transfer!.amount,
                                    source: source_account,
                                    target: target_account
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
        )
    }

    onUpdate(): void {
        this.accountingService.get_account(this.transfer!.source).pipe(
            switchMap((source_account: Account) =>
                this.accountingService.get_account(this.transfer!.target).pipe(
                    switchMap((target_account: Account) => {
                            return this.accountingService.update_transfer(
                                this.transfer!.id!,
                                {
                                    date: this.transfer!.date,
                                    amount: this.transfer!.amount,
                                    source: source_account,
                                    target: target_account
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
                    this.statusMessage = `Edit failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Edit failed';
                }
            }
        )
    }

    onDelete(): void {
        if (confirm('Are you sure you want to delete this transfer?')) {
            this.accountingService.delete_transfer(this.transfer!.id!).subscribe(
                () => this.reset()
            )
        }
    }
}
