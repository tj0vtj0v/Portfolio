import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ExpenseComponent} from './expense/expense.component';
import {TransferComponent} from './transfer/transfer.component';
import {AccountComponent} from './account/account.component';
import {CategoryComponent} from './category/category.component';
import {IncomeComponent} from './income/income.component';
import {AllCommunityModule, ModuleRegistry} from 'ag-grid-community';

@Component({
    selector: 'app-accounting',
    imports: [
        CommonModule,
        ExpenseComponent,
        IncomeComponent,
        TransferComponent,
        AccountComponent,
        CategoryComponent,
        DashboardComponent
    ],
    templateUrl: './accounting.component.html',
    styleUrl: './accounting.component.css'
})
export class AccountingComponent {
    protected selectedOption: string = '';

    constructor() {
        ModuleRegistry.registerModules([AllCommunityModule]);
    }

    protected selectOption(option: string) {
        this.selectedOption = option;
    }
}
