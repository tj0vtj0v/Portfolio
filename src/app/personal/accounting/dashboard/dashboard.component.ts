import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';
import {DateRangeComponent} from '../../../shared/date-range/date-range.component';
import {PeriodRange} from '../../../shared/date-range/period-range';
import {AccountingActivity, AccountingActivityType, AccountingDashboardData, accountingActivity, filterAccountingData} from './dashboard-data';
import {DashboardDataService} from './dashboard-data.service';
import {buildAccountingCharts} from './dashboard-charts';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';
import {UiEmptyStateComponent} from '../../../shared/ui/empty-state/ui-empty-state.component';

@Component({
    selector: 'app-dashboard',
    imports: [UiSkeletonComponent, CommonModule, RouterLink, ChartCardComponent, DateRangeComponent, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent, UiEmptyStateComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    private readonly service = inject(DashboardDataService);
    private readonly destroyRef = inject(DestroyRef);
    private data: AccountingDashboardData = {
        accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()
    };
    private range?: PeriodRange;
    private view = filterAccountingData(this.data);
    protected loading = true;
    protected errorMessage = '';
    protected charts = buildAccountingCharts(this.view);
    protected currentBalance = 0;
    protected periodIncome = 0;
    protected periodExpenses = 0;
    protected activities: AccountingActivity[] = [];
    protected activityFilter: 'all' | AccountingActivityType = 'all';
    protected showAllActivity = false;

    ngOnInit(): void { this.load(); }

    protected load(): void {
        this.loading = true;
        this.errorMessage = "";
        this.service.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: data => {
                this.data = data;
                this.update(this.range);
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'Unable to load dashboard data. Please try again.';
                this.loading = false;
            }
        });
    }

    protected update(range: PeriodRange | null | undefined): void {
        this.range = range ?? undefined;
        this.view = range
            ? filterAccountingData(this.data, range.from, range.observedTo)
            : filterAccountingData(this.data, '9999-12-31', '0000-01-01');
        this.charts = buildAccountingCharts(this.view);
        this.currentBalance = this.view.accounts.reduce((sum, account) => sum + account.balance, 0);
        this.periodIncome = this.view.filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
        this.periodExpenses = this.view.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        this.activities = accountingActivity(this.view);
        this.showAllActivity = false;
    }

    protected get filteredActivities(): AccountingActivity[] {
        const matching = this.activityFilter === 'all' ? this.activities : this.activities.filter(activity => activity.type === this.activityFilter);
        return this.showAllActivity ? matching : matching.slice(0, 10);
    }

    protected get matchingActivityCount(): number {
        return this.activityFilter === 'all' ? this.activities.length : this.activities.filter(activity => activity.type === this.activityFilter).length;
    }

    protected setActivityFilter(filter: 'all' | AccountingActivityType): void {
        this.activityFilter = filter;
        this.showAllActivity = false;
    }

    protected activityRoute(activity: AccountingActivity): string {
        return `/accounting/${activity.type === 'income' ? 'incomes' : `${activity.type}s`}`;
    }
}
