import {Component} from '@angular/core';
import {BankingService} from '../../../shared/api/banking.service';
import {Transaction} from '../../../shared/datatype/Transaction';
import {AllCommunityModule, ColDef, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {AgGridModule} from 'ag-grid-angular';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-transaction',
    imports: [
        AgGridModule,
        CommonModule
    ],
    templateUrl: './transaction.component.html',
    styleUrl: './transaction.component.css'
})
export class TransactionComponent {
    protected transactions: Transaction[] = [];
    protected transaction?: Transaction;

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {headerName: 'Peer', field: 'peer', sortable: true, filter: true},
        {
            headerName: 'Amount', sortable: true, filter: true,
            valueGetter: (params) => {
                return `${params.data.amount} ${params.data.currencycode}`;
            }
        },
        {headerName: 'Reason', field: 'reasonforpayment', sortable: true, filter: true}
    ]

    constructor(
        private bankingService: BankingService
    ) {
        ModuleRegistry.registerModules([AllCommunityModule])
    }

    onGridReady(params: any) {
        params.api.sizeColumnsToFit();
        window.addEventListener('resize', () => {
            params.api.sizeColumnsToFit();
        });
    }

    ngOnInit(): void {
        this.bankingService.get_transactions().subscribe(transactions => {
            this.transactions = transactions;
        });
    }

    onRowClicked(event: RowClickedEvent): void {
        this.bankingService.get_transaction(event.data.id).subscribe(transaction => this.transaction = transaction)
    }

    reset(): void {
        this.transaction = undefined;
    }
}
