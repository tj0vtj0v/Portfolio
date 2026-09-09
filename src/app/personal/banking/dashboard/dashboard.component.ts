import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {bankingHistory} from './banking-history';
import {tooltipText} from '../../../shared/charts/tooltip-text';
import {Component} from '@angular/core';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';
import {CommonModule, DatePipe} from '@angular/common';
import {History} from '../../../shared/datatype/History';
import {Transaction} from '../../../shared/datatype/Transaction';
import {EChartsCoreOption} from 'echarts';
import {BankingService} from '../../../shared/api/banking.service';
import {forkJoin} from 'rxjs';
import {DateRangeComponent} from '../../../shared/date-range/date-range.component';
import {PeriodRange} from '../../../shared/date-range/period-range';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-dashboard',
    imports: [UiSkeletonComponent,
        ChartCardComponent,
        CommonModule,
        DateRangeComponent,
        UiPageHeaderComponent,
        UiPanelComponent,
        UiFeedbackComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    //original data
    protected histories: History[] = [];
    protected transactions: Transaction[] = [];

    //filter
    private range?: PeriodRange;

    //visual data
    protected filteredTransactions: Transaction[] = [];
    protected filteredHistories: History[] = [];
    protected accountHistoryMap: Map<string, History[]> = new Map();

    //visuals
    protected balance_chart: EChartsCoreOption = {};
    protected loading = true;
    protected errorMessage = '';

    constructor(
        private bankingService: BankingService
    ) {
    }

    ngOnInit(): void {
        this.loadData();
    }

    protected loadData(): void {
        this.loading = true;
        this.errorMessage = '';
        forkJoin(
            [
                this.bankingService.get_history(),
                this.bankingService.get_transactions()
            ]
        ).subscribe({
            next: ([histories, transactions]) => {
                this.histories = histories;
                this.transactions = transactions;
                this.loading = false;
                this.update(this.range);
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Banking data could not be loaded.';
            }
        });
    }

    update(range: PeriodRange | null | undefined = this.range): void {
        this.range = range ?? undefined;
        this.filterData(range);
        this.build_balance_chart();
    }

    private build_balance_chart(): void {
        const seriesData: { name: string, type: string, showSymbol: boolean, data: [string, number][] } [] = [];
        this.accountHistoryMap.forEach((history, account) => {
            seriesData.push({
                name: account,
                type: 'line',
                showSymbol: false,
                data: [...history].sort((a, b) => a.date.localeCompare(b.date)).map(entry => [entry.date, entry.amount])
            });
        });

        this.balance_chart = {
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const content = params.map((item: any) => `${tooltipText(item.seriesName)}: ${parseFloat(item.data[1]).toFixed(2)} €`).join('<br/>');
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

    private filterData(range: PeriodRange | null | undefined): void {
        this.accountHistoryMap = new Map();
        if (!range) {
            this.filteredHistories = [];
            this.filteredTransactions = [];
            return;
        }
        this.accountHistoryMap = bankingHistory(this.histories, range);
        this.filteredHistories = this.histories.filter(item => (!range.from || item.date >= range.from) && item.date <= range.observedTo);

        this.filteredTransactions = this.transactions.filter(transaction => {
            const isAfterStart = range.from ? transaction.date >= range.from : true;
            const isBeforeEnd = transaction.date <= range.observedTo;

            return isAfterStart && isBeforeEnd;
        })
    }
}
