import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {History} from '../../../shared/datatype/History';
import {ColDef} from 'ag-grid-community';
import {BankingService} from '../../../shared/api/banking.service';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';
import {UiEmptyStateComponent} from '../../../shared/ui/empty-state/ui-empty-state.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-history',
    imports: [UiSkeletonComponent,
        GridFitDirective,
        AgGridModule, CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent, UiEmptyStateComponent
    ],
    templateUrl: './history.component.html',
    styleUrl: './history.component.css'
})
export class HistoryComponent {
    protected histories: History[] = [];
    protected loading = true;
    protected errorMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Account', field: 'account.name', sortable: true, filter: true},
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value.toFixed(2)} €`
        }
    ]

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
        this.bankingService.get_history().subscribe({
            next: histories => {
                this.histories = histories;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Banking history could not be loaded.';
            }
        });
    }
}
