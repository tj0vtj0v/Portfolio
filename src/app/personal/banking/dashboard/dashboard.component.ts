import {Component} from '@angular/core';
import {NgxEchartsDirective, NgxEchartsModule, provideEchartsCore} from 'ngx-echarts';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
import {History} from '../../../shared/datatype/History';
import {Transaction} from '../../../shared/datatype/Transaction';
import {EChartsCoreOption} from 'echarts';
import {BankingService} from '../../../shared/api/banking.service';
import {forkJoin} from 'rxjs';

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
export class DashboardComponent {
    //original data
    protected histories: History[] = [];
    protected transactions: Transaction[] = [];

    //filter
    protected startDate?: string = new Date(Date.UTC(new Date().getFullYear(), 0, 1)).toISOString().split('T')[0]
    protected endDate?: string;

    //visual data
    protected filteredTransactions: Transaction[] = [];
    protected filteredHistories: History[] = [];
    protected accountHistoryMap: Map<string, History[]> = new Map();

    //visuals
    protected balance_chart: EChartsCoreOption = {};

    constructor(
        private bankingService: BankingService
    ) {
    }

    ngOnInit(): void {
        forkJoin(
            [
                this.bankingService.get_history(),
                this.bankingService.get_transactions()
            ]
        ).subscribe(([histories, transactions]) => {
            this.histories = histories;
            this.transactions = transactions;

            this.update();
        })
    }

    update(): void {
        this.filterData();
        this.build_balance_chart();
    }

    private build_balance_chart(): void {
        const seriesData: { name: string, type: string, showSymbol: boolean, data: [string, number][] } [] = [];
        this.accountHistoryMap.forEach((history, account) => {
            history.reverse()

            seriesData.push({
                name: account,
                type: 'line',
                showSymbol: false,
                data: history.map(entry => [entry.date, entry.amount])
            });
        });

        this.balance_chart = {
            title: {
                text: 'Balance over Time',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const content = params.map((item: any) => `${item.seriesName}: ${parseFloat(item.data[1]).toFixed(2)} €`).join('<br/>');
                    const date = new DatePipe("en-US").transform(new Date(params[0].data[0]), 'dd.MM.yyyy');
                    return `${date}<br>${content}`
                }
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            xAxis: {
                type: 'time',
                name: 'Date'
            },
            yAxis: {
                type: 'value',
                name: 'Balance'
            },
            series: seriesData
        }
    }

    private filterData(): void {
        this.startDate = this.startDate === '' ? undefined : this.startDate;
        this.endDate = this.endDate === '' ? undefined : this.endDate;


        this.accountHistoryMap = new Map();
        this.filteredHistories = this.histories.filter(history => {
            const isAfterStart = this.startDate ? history.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? history.date <= this.endDate : true;

            if (isAfterStart && isBeforeEnd) {
                if (!this.accountHistoryMap.has(history.account!.name)) {
                    this.accountHistoryMap.set(history.account!.name, [])
                }
                this.accountHistoryMap.get(history.account!.name)!.push(history)

                return true;
            }

            return false;
        });

        this.filteredTransactions = this.transactions.filter(transaction => {
            const isAfterStart = this.startDate ? transaction.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? transaction.date <= this.endDate : true;

            return isAfterStart && isBeforeEnd;
        })
    }
}
