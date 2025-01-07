import {Component} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {Transfer} from '../../../shared/datatype/Transfer';
import {ModifyTransfer} from '../../../shared/datatype/ModifyTransfer';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {Account} from '../../../shared/datatype/Account';

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
        // TODO
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
        this.transfer = {...event.data};
    }

    onAdd(): void {
        this.addingTransfer = true;

        this.transfer = {
            date: '',
            amount: 0,
            source: '',
            target: ''
        }
    }

    onSave(): void {
        // TODO
    }

    onUpdate(): void {
        // TODO
    }

    onDelete(): void {
        // TODO
    }
}
