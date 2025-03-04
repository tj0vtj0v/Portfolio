import {Component} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {CommonModule} from '@angular/common';
import {History} from '../../../shared/datatype/History';
import {AllCommunityModule, ColDef, ModuleRegistry} from 'ag-grid-community';
import {BankingService} from '../../../shared/api/banking.service';

@Component({
    selector: 'app-history',
    imports: [
        AgGridModule
    ],
    templateUrl: './history.component.html',
    styleUrl: './history.component.css'
})
export class HistoryComponent {
    protected histories: History[] = [];

    protected columnDefs: ColDef[] = [
        {headerName: 'Account', field: 'account.name', sortable: true, filter: true},
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value.toFixed(2)} €`
        }
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
        this.bankingService.get_history().subscribe(transactions => {
            this.histories = transactions;
        });
    }
}
