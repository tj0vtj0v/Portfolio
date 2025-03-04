import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TransactionComponent} from './transaction/transaction.component';
import {HistoryComponent} from './history/history.component';
import {AllCommunityModule, ModuleRegistry} from 'ag-grid-community';

@Component({
    selector: 'app-banking',
    imports: [
        CommonModule,
        DashboardComponent,
        TransactionComponent,
        HistoryComponent
    ],
    templateUrl: './banking.component.html',
    styleUrl: './banking.component.css'
})
export class BankingComponent {
    protected selectedOption: string = '';

    constructor() {
        ModuleRegistry.registerModules([AllCommunityModule]);
    }

    protected selectOption(option: string) {
        this.selectedOption = option;
    }
}
