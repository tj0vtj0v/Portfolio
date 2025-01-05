import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ViewExpenseComponent} from './view-expense/view-expense.component';
import {AddExpenseComponent} from './add-expense/add-expense.component';
import {ViewTransferComponent} from './view-transfer/view-transfer.component';
import {AddTransferComponent} from './add-transfer/add-transfer.component';
import {ViewAccountComponent} from './view-account/view-account.component';
import {AddAccountComponent} from './add-account/add-account.component';
import {DashboardComponent} from './dashboard/dashboard.component';

@Component({
    selector: 'app-accounting',
    imports: [
        CommonModule,
        ViewExpenseComponent,
        AddExpenseComponent,
        ViewTransferComponent,
        AddTransferComponent,
        ViewAccountComponent,
        AddAccountComponent,
        DashboardComponent
    ],
    templateUrl: './accounting.component.html',
    styleUrl: './accounting.component.css'
})
export class AccountingComponent {
    protected selectedOption: string = '';

    protected selectOption(option: string) {
        this.selectedOption = option;
    }
}
