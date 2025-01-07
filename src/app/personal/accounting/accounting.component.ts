import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ExpenseComponent} from './expense/expense.component';
import {TransferComponent} from './transfer/transfer.component';
import {AccountComponent} from './account/account.component';
import {CategoryComponent} from './category/category.component';

@Component({
    selector: 'app-accounting',
    imports: [
        CommonModule,
        ExpenseComponent,
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

    protected selectOption(option: string) {
        this.selectedOption = option;
    }
}
