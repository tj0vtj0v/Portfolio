import {Component} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {Account} from '../../../shared/datatype/Account';
import {AccountingService} from '../../../shared/api/accounting.service';
import {ClientSideRowModelModule, ColDef, Module} from 'ag-grid-community';

@Component({
    selector: 'app-view-account',
    imports: [
        AgGridModule
    ],
    templateUrl: './view-account.component.html',
    styleUrl: './view-account.component.css'
})
export class ViewAccountComponent {
    protected accounts: Account[] = [];

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
    }
}
