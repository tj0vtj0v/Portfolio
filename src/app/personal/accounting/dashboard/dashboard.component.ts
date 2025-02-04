import {Component, OnInit} from '@angular/core';
import {NgxEchartsDirective, NgxEchartsModule, provideEchartsCore} from 'ngx-echarts';
import {EChartsCoreOption} from 'echarts';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {forkJoin} from 'rxjs';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AccountingService} from '../../../shared/api/accounting.service';
import {Account} from '../../../shared/datatype/Account';
import {Transfer} from '../../../shared/datatype/Transfer';
import {Expense} from '../../../shared/datatype/Expense';
import {Income} from '../../../shared/datatype/Income';
import {Category} from '../../../shared/datatype/Category';
import {BalanceHistory} from '../../../shared/datatype/BalanceHistory';

@Component({
    selector: 'app-dashboard',
    imports: [
        NgxEchartsDirective,
        NgxEchartsModule,
        MatOptionModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        FormsModule,
        CommonModule
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
    //original data
    protected accounts: Account[] = [];
    protected categories: Category[] = [];
    //filter
    protected selectedAccounts: Account[] = [];
    protected selectedCategories: Category[] = [];
    protected startDate?: string;
    protected endDate?: string;
    //visual data
    protected filteredHistories: Map<string, BalanceHistory[]> = new Map();
    protected filteredExpenses: Expense[] = [];
    protected categoryExpenseMap: Map<string, number> = new Map();
    protected filteredIncomes: Income[] = [];
    protected filteredTransfers: Transfer[] = [];
    //visuals
    protected balance_chart: EChartsCoreOption = {};
    protected category_expense_chart: EChartsCoreOption = {};
    protected history_chart: EChartsCoreOption = {};
    private histories: Map<string, BalanceHistory[]> = new Map();
    private expenses: Expense[] = [];
    private incomes: Income[] = [];
    private transfers: Transfer[] = [];

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.accountingService.get_accounts().subscribe(accounts => {
            this.accounts = accounts;
            this.selectedAccounts = this.accounts;
            this.update();

            forkJoin([
                this.accountingService.get_categories(),
                this.accountingService.get_expenses(),
                this.accountingService.get_incomes(),
                this.accountingService.get_transfers()
            ]).subscribe(([categories, expenses, incomes, transfers]) => {
                this.categories = categories;
                this.selectedCategories = this.categories
                this.expenses = expenses;
                this.incomes = incomes;
                this.transfers = transfers;

                this.update();
            });

            const historyRequests = accounts.map((account: Account) =>
                this.accountingService.get_account_history(account.name)
            );

            forkJoin(
                [...historyRequests]
            ).subscribe((results) => {
                accounts.forEach((account: Account, i: number) => this.histories.set(account.name, results[i]));

                this.update();
            });
        });
    }

    build_balance_chart(): void {
        const refinedAccounts = this.accounts.map(account => (
            {
                name: account.name,
                value: account.balance,
            }
        ));

        this.balance_chart = {
            title: {
                text: 'Account Liquidity',
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
                selectedMode: 'multiple'
            },
            series: [
                {
                    name: 'Balance',
                    type: 'pie',
                    radius: '50%',
                    data: refinedAccounts,
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

    build_history_chart(): void {
        const dates = Array.from(new Set(
            [...this.filteredHistories.values()].flatMap(history => history.map(entry => entry.date))
        )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const refinedHistories = Array.from(this.filteredHistories).map(([accountName, history]) => {
            const historyMap = new Map(history.map(entry => [entry.date, entry.balance]));

            let lastBalance: number;

            const data = dates.map(date => {
                if (historyMap.has(date)) {
                    lastBalance = historyMap.get(date)!;
                }

                return {date, lastBalance};
            });

            return {
                name: accountName,
                type: 'line',
                showSymbol: false,
                smooth: true,
                data: data.map(entry => entry.lastBalance)
            };
        });
        console.log(refinedHistories);

        this.history_chart = {
            title: {
                text: 'Account Balance Over Time',
                left: 'center',
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    return params.map((item: any) => `${item.seriesName}: ${parseFloat(item.value).toFixed(2)}€`).join('<br/>');
                },
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                selectedMode: 'multiple',
            },
            xAxis: {
                type: 'category',
                data: dates,
            },
            yAxis: {
                type: 'value',
            },
            series: refinedHistories,
        };
    }

    build_category_expense_chart(): void {
        const refinedCategories = Array.from(this.categoryExpenseMap.entries()).map(entry => (
            {
                name: entry[0],
                value: entry[1]
            }
        ));

        this.category_expense_chart = {
            title: {
                text: 'Expenses by Category',
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
                selectedMode: 'multiple',
            },
            series: [
                {
                    name: 'Category Expenses',
                    type: 'pie',
                    radius: '50%',
                    data: refinedCategories,
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

    logx() {
        console.log(this.selectedCategories);
    }

    protected update(): void {
        this.filterData();
        this.build_balance_chart();
        this.build_category_expense_chart();
    }

    protected balanceLegendListener(ec: any) {
        ec.on('legendselectchanged', (params: any) => {
            const selectedNames = Object.keys(params.selected)
                .filter(accountName => params.selected[accountName]);

            this.selectedAccounts = this.accounts.filter(account =>
                selectedNames.includes(account.name)
            );

            this.filterData();
        });
    }

    protected categoryLegendListener(ec: any) {
        ec.on('legendselectchanged', (params: any) => {
            const selectedNames = Object.keys(params.selected)
                .filter(categoryName => params.selected[categoryName]);

            this.selectedCategories = this.categories.filter(category =>
                selectedNames.includes(category.name)
            );

            this.filterData();
        });
    }

    private filterData(): void {
        this.filteredHistories = new Map();
        this.histories.forEach((history, name) => {
            const filteredHistory = history.filter((entry: BalanceHistory) => {
                const isAfterStart = this.startDate ? entry.date >= this.startDate : true;
                const isBeforeEnd = this.endDate ? entry.date <= this.endDate : true;
                return isAfterStart && isBeforeEnd;
            });

            const isInAccounts = this.selectedAccounts.some(account => account.name === name)
            if (filteredHistory.length > 0 && isInAccounts) {
                this.filteredHistories.set(name, filteredHistory);
            }
        })

        this.categoryExpenseMap = new Map();
        this.filteredExpenses = this.expenses.filter(expense => {
            const isAfterStart = this.startDate ? expense.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? expense.date <= this.endDate : true;
            const isInAccounts = this.selectedAccounts.some(account => account.id === expense.account!.id);
            const isInCategories = this.selectedCategories.some(category => category.id === expense.category!.id);

            if (isAfterStart && isBeforeEnd && isInAccounts && isInCategories) {
                const categoryName = expense.category!.name;
                const currentAmount = this.categoryExpenseMap.get(categoryName) || 0;
                this.categoryExpenseMap.set(categoryName, currentAmount + expense.amount);
                return true;
            }

            return false
        });

        this.filteredIncomes = this.incomes.filter(income => {
            const isAfterStart = this.startDate ? income.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? income.date <= this.endDate : true;
            const isInAccounts = this.selectedAccounts.some(account => account.id === income.account!.id);
            return isAfterStart && isBeforeEnd && isInAccounts;
        });

        this.filteredTransfers = this.transfers.filter(transfer => {
            const isAfterStart = this.startDate ? transfer.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? transfer.date <= this.endDate : true;
            const sourceIsInAccounts = this.selectedAccounts.some(account => account.id === transfer.source!.id);
            const targetIsInAccounts = this.selectedAccounts.some(account => account.id === transfer.target!.id);
            return isAfterStart && isBeforeEnd && (sourceIsInAccounts || targetIsInAccounts);
        });


        this.build_history_chart();
    }
}
