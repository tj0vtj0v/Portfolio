import {Component, OnInit} from '@angular/core';
import {NgxEchartsDirective, NgxEchartsModule, provideEchartsCore} from 'ngx-echarts';
import {EChartsCoreOption} from 'echarts';
import {AccountingService} from '../../../shared/api/accounting.service';
import {FormsModule} from '@angular/forms';
import {Account} from '../../../shared/datatype/Account';
import {Transfer} from '../../../shared/datatype/Transfer';
import {Expense} from '../../../shared/datatype/Expense';
import {Income} from '../../../shared/datatype/Income';
import {Category} from '../../../shared/datatype/Category';

@Component({
    selector: 'app-dashboard',
    imports: [
        NgxEchartsDirective,
        NgxEchartsModule,
        FormsModule
    ],
    providers: [
        provideEchartsCore({
            echarts: () => import('echarts')
        })
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    private accounts: Account[] = [];
    private categories: Category[] = [];
    private expenses: Expense[] = [];
    private incomes: Income[] = [];
    private transfers: Transfer[] = [];
    protected filteredExpenses: Expense[] = [];
    protected filteredIncomes: Income[] = [];
    protected filteredTransfers: Transfer[] = [];
    protected balance_chart: EChartsCoreOption = {};
    protected startDate?: string;
    protected endDate?: string;

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.accountingService.get_accounts().subscribe(accounts => {
            this.accounts = accounts;
            this.update()
        })
        this.accountingService.get_categories().subscribe(categories => {
            this.categories = categories;
            this.update()
        })
        this.accountingService.get_expenses().subscribe(expenses => {
            this.expenses = expenses;
            this.update()
        })
        this.accountingService.get_incomes().subscribe(incomes => {
            this.incomes = incomes;
            this.update()
        })
        this.accountingService.get_transfers().subscribe(transfers => {
            this.transfers = transfers;
            this.update()
        })
    }

    protected update(): void {
        this.filterByDate()
        this.build_chart()
    }

    build_chart(): void {
        const accounts = this.accounts.map(account => (
            {
                name: account.name,
                value: account.balance,
            }
        ));

        this.balance_chart = {
            title: {
                text: 'Account Balances',
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const value = parseFloat(params.value).toFixed(2);
                    return `${params.name}: ${value}€`;
                },
            },
            legend: {
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: 'Balance',
                    type: 'pie',
                    radius: '50%',
                    data: accounts,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        };
    }

    private filterByDate(): void {
        this.filteredExpenses = this.expenses.filter(expense => {
            const isAfterStart = this.startDate ? expense.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? expense.date <= this.endDate : true;
            return isAfterStart && isBeforeEnd;
        });

        this.filteredIncomes = this.incomes.filter(income => {
            const isAfterStart = this.startDate ? income.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? income.date <= this.endDate : true;
            return isAfterStart && isBeforeEnd;
        });

        this.filteredTransfers = this.transfers.filter(transfer => {
            const isAfterStart = this.startDate ? transfer.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? transfer.date <= this.endDate : true;
            return isAfterStart && isBeforeEnd;
        });
    }
}
