import {Component, OnInit} from '@angular/core';
import {NgxEchartsDirective, NgxEchartsModule, provideEchartsCore} from 'ngx-echarts';
import {EChartsCoreOption} from 'echarts';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
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
    private expenses: Expense[] = [];
    private incomes: Income[] = [];
    private transfers: Transfer[] = [];

    //filter
    protected startDate?: string = new Date(Date.UTC(new Date().getFullYear(), 0, 1)).toISOString().split('T')[0];
    protected endDate?: string;
    private histories: Map<string, BalanceHistory[]> = new Map();
    //visual data

    protected filteredHistories: Map<string, BalanceHistory[]> = new Map();
    private minMovementDate?: string;
    protected filteredExpenses: Expense[] = [];
    protected categoryExpenseMap: Map<string, number> = new Map();
    protected accountIncomeMap: Map<string, number> = new Map();
    protected filteredIncomes: Income[] = [];
    protected filteredTransfers: Transfer[] = [];

    //visuals
    protected balance_chart: EChartsCoreOption = {};
    protected category_expense_chart: EChartsCoreOption = {};
    protected account_income_chart: EChartsCoreOption = {};
    protected history_chart: EChartsCoreOption = {};
    protected transfer_chart: EChartsCoreOption = {};

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.accountingService.get_accounts().subscribe(accounts => {
            this.accounts = accounts;
            this.update();

            const historyRequests = accounts.map((account: Account) =>
                this.accountingService.get_account_history(account.name)
            );

            forkJoin(
                [...historyRequests]
            ).subscribe((results) => {
                accounts.forEach((account: Account, i: number) => this.histories.set(account.name, results[i]));

                this.update();
            });

            forkJoin([
                this.accountingService.get_categories(),
                this.accountingService.get_expenses(),
                this.accountingService.get_incomes(),
                this.accountingService.get_transfers()
            ]).subscribe(([categories, expenses, incomes, transfers]) => {
                this.categories = categories;
                this.expenses = expenses;
                this.incomes = incomes;
                this.transfers = transfers;

                this.update();
            });
        });
    }

    protected update(): void {
        this.filterData();
        this.build_balance_chart();
        this.build_category_expense_chart();
        this.build_account_income_chart();
        this.build_history_chart();
        this.build_transfer_chart()
    }

    private build_balance_chart(): void {
        const totalBalance = this.accounts.reduce((sum, account) => sum + account.balance, 0);
        const refinedAccounts = this.accounts.map(account => (
            {
                name: account.name,
                value: account.balance
            }
        ));

        this.balance_chart = {
            title: {
                text: `Account Liquidity - Total: ${totalBalance.toFixed(2)}€`,
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const percentage = Math.round(params.percent);
                    const value = parseFloat(params.value).toFixed(2);
                    return `${params.name}: ${value}€<br>${percentage}%`;
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

    private build_category_expense_chart(): void {
        const totalExpenses = Array.from(this.categoryExpenseMap.values()).reduce((sum, expense) => sum + expense, 0);
        const refinedCategories = Array.from(this.categoryExpenseMap.entries()).map(entry => (
            {
                name: entry[0],
                value: entry[1]
            }
        ));

        this.category_expense_chart = {
            title: {
                text: `Expenses by Category - Total: ${totalExpenses.toFixed(2)}€`,
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const percentage = parseFloat(params.percent).toFixed(1);
                    const value = parseFloat(params.value).toFixed(2);
                    return `${params.name}: ${value}€<br>${percentage}%`;
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

    private build_account_income_chart(): void {
        const totalIncome = Array.from(this.accountIncomeMap.values()).reduce((sum, income) => sum + income, 0);
        const refinedAccounts = Array.from(this.accountIncomeMap.entries()).map(entry => (
            {
                name: entry[0],
                value: entry[1]
            }
        ));

        this.account_income_chart = {
            title: {
                text: `Income by Account - Total: ${totalIncome.toFixed(2)}€`,
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const percentage = parseFloat(params.percent).toFixed(1);
                    const value = parseFloat(params.value).toFixed(2);
                    return `${params.name}: ${value}€<br>${percentage}%`;
                },
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                selectedMode: 'multiple',
            },
            series: [
                {
                    name: 'Account Incomes',
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

    private build_history_chart(): void {
        const dates = this.getDateRange(this.startDate ?? this.minMovementDate!, this.endDate ?? new Date().toISOString().split('T')[0]);

        const refinedHistories = Array.from(this.filteredHistories)
            .map(([accountName, history]) => {
                const historyMap = new Map(history.map(entry => [entry.date, entry.balance]));

                let balance: number;
                if (this.startDate && (new Date(history[0].date) < new Date(this.startDate))) {
                    balance = history[0].balance
                }

                const data = dates.map(date => {
                    if (historyMap.has(date)) {
                        balance = historyMap.get(date)!;
                    }

                    return balance;
                });

                return {
                    name: accountName,
                    type: 'line',
                    showSymbol: false,
                    smooth: true,
                    data: data
                };
            });

        this.history_chart = {
            title: {
                text: 'Account Balance Over Time',
                left: 'center',
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const content = params.map((item: any) => `${item.seriesName}: ${parseFloat(item.value).toFixed(2)}€`).join('<br/>');
                    const date = new DatePipe("en-US").transform(new Date(params[0].name), 'dd.MM.yyyy');
                    return `${date}<br>${content}`
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

    private build_transfer_chart(): void {
        const refinedTransfers = this.filteredTransfers.map(transaction => {
            return {
                source: `${transaction.source!.name} `,
                target: transaction.target!.name,
                value: transaction.amount
            };
        });

        this.transfer_chart = {
            title: {
                text: 'Transaction Flows Between Accounts',
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `${params.data.source.split('_')[0] || ''} → ${params.data.target.split('_')[0] || ''}: ${parseFloat(params.data.value).toFixed(2)}€`;
                },
            },
            series: [
                {
                    type: 'sankey',
                    data: this.getNodesFromTransactions(refinedTransfers),
                    links: refinedTransfers,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                    },
                    emphasis: {
                        focus: 'adjacency',
                    },
                },
            ],
        };
    }

    private getDateRange(startDate: string, endDate: string): string[] {
        const dates: string[] = [];
        let currentDate = new Date(startDate);

        while (currentDate <= new Date(endDate)) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    private getNodesFromTransactions(transactions: { source: string, target: string, value: number }[]): any[] {
        const nodesSet = new Set<string>();

        transactions.forEach(tx => {
            nodesSet.add(tx.source);
            nodesSet.add(tx.target);
        });

        return Array.from(nodesSet).map(name => ({
            name,
        }));
    }

    private filterData(): void {
        this.minMovementDate = undefined;
        this.startDate = this.startDate === "" ? undefined : this.startDate;
        this.endDate = this.endDate === "" ? undefined : this.endDate;

        this.filteredHistories = new Map();
        this.histories.forEach((history, name) => {
            let earlier: BalanceHistory | undefined;
            const filteredHistory = history.filter((entry: BalanceHistory) => {
                const isAfterStart = this.startDate ? entry.date >= this.startDate : true;
                const isBeforeEnd = this.endDate ? entry.date <= this.endDate : true;
                if (!isAfterStart) {
                    earlier = entry;
                }
                return isAfterStart && isBeforeEnd;
            });

            if (!this.startDate && filteredHistory.length > 0) {
                this.minMovementDate = !this.minMovementDate || new Date(filteredHistory[0].date) < new Date(this.minMovementDate)
                    ? filteredHistory[0].date
                    : this.minMovementDate;
            }

            if (filteredHistory.length > 0 && earlier) {
                this.filteredHistories.set(name, [earlier, ...filteredHistory]);
            } else {
                this.filteredHistories.set(name, filteredHistory);
            }
        })

        this.categoryExpenseMap = new Map();
        this.filteredExpenses = this.expenses.filter(expense => {
            const isAfterStart = this.startDate ? expense.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? expense.date <= this.endDate : true;

            if (isAfterStart && isBeforeEnd) {
                const categoryName = expense.category!.name;
                const currentAmount = this.categoryExpenseMap.get(categoryName) || 0;
                this.categoryExpenseMap.set(categoryName, currentAmount + expense.amount);
                return true;
            }

            return false
        });

        this.accountIncomeMap = new Map();
        this.filteredIncomes = this.incomes.filter(income => {
            const isAfterStart = this.startDate ? income.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? income.date <= this.endDate : true;

            if (isAfterStart && isBeforeEnd) {
                const accountName = income.account!.name;
                const currentIncome = this.accountIncomeMap.get(accountName) || 0;
                this.accountIncomeMap.set(accountName, currentIncome + income.amount);
                return true;
            }

            return false;
        });

        this.filteredTransfers = this.transfers.filter(transfer => {
            const isAfterStart = this.startDate ? transfer.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? transfer.date <= this.endDate : true;
            return isAfterStart && isBeforeEnd;
        });
    }
}
