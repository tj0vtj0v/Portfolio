import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';
import {AccountingDashboardData, filterAccountingData} from './dashboard-data';
import {DashboardDataService} from './dashboard-data.service';
import {buildAccountingCharts} from './dashboard-charts';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, FormsModule, ChartCardComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    private readonly service = inject(DashboardDataService);
    private readonly destroyRef = inject(DestroyRef);
    private data: AccountingDashboardData = {
        accounts: [], expenses: [], incomes: [], transfers: [], histories: new Map()
    };
    protected startDate?: string = new Date(Date.UTC(new Date().getFullYear(), 0, 1)).toISOString().split('T')[0];
    protected endDate?: string;
    protected loading = true;
    protected errorMessage = '';
    protected charts = buildAccountingCharts(filterAccountingData(this.data, this.startDate));

    ngOnInit(): void {
        this.service.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: data => {
                this.data = data;
                this.update();
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'Unable to load dashboard data. Please try again.';
                this.loading = false;
            }
        });
    }

    protected update(): void {
        this.charts = buildAccountingCharts(filterAccountingData(this.data, this.startDate, this.endDate));
    }
}
