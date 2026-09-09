import {Subscription} from 'rxjs';
import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component, DestroyRef, inject} from '@angular/core';
import {BankingService} from '../../../shared/api/banking.service';
import {Transaction} from '../../../shared/datatype/Transaction';
import {CellKeyDownEvent, ColDef, FullWidthCellKeyDownEvent, RowClickedEvent} from 'ag-grid-community';
import {AgGridModule} from 'ag-grid-angular';
import {CommonModule} from '@angular/common';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';
import {UiEmptyStateComponent} from '../../../shared/ui/empty-state/ui-empty-state.component';

@Component({
    selector: 'app-transaction',
    imports: [UiSkeletonComponent,
        GridFitDirective,
        AgGridModule,
        CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent, UiEmptyStateComponent
    ],
    templateUrl: './transaction.component.html',
    styleUrl: './transaction.component.css'
})
export class TransactionComponent {
    private readonly destroyRef = inject(DestroyRef);
    private detailRequest?: Subscription;
    protected selectedId?: number;

    protected transactions: Transaction[] = [];
    protected transaction?: Transaction;
    protected loading = true;
    protected detailLoading = false;
    protected errorMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {headerName: 'Peer', field: 'peer', sortable: true, filter: true},
        {
            headerName: 'Amount', sortable: true, filter: true,
            valueGetter: (params) => {
                return `${params.data.amount} ${params.data.currencycode}`;
            }
        },
        {headerName: 'Reason', field: 'reasonforpayment', sortable: true, filter: true}
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
        this.bankingService.get_transactions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: transactions => {
                this.transactions = transactions;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Banking transactions could not be loaded.';
            }
        });
    }

    onRowClicked(event: RowClickedEvent): void {
        this.openTransaction(event.data.id);
    }

    onCellKeyDown(event: CellKeyDownEvent | FullWidthCellKeyDownEvent): void {
        const key = (event.event as KeyboardEvent | undefined)?.key;
        if ((key === 'Enter' || key === ' ') && event.data?.id != null) {
            event.event?.preventDefault();
            this.openTransaction(event.data.id);
        }
    }

    private openTransaction(id: number): void {
        this.detailRequest?.unsubscribe();
        this.selectedId = id;
        this.transaction = undefined;
        this.detailLoading = true;
        this.errorMessage = '';
        this.detailRequest = this.bankingService.get_transaction(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: transaction => { this.transaction = transaction; this.detailLoading = false; },
            error: () => { this.detailLoading = false; this.errorMessage = 'Transaction details could not be loaded.'; }
        });
    }

    protected retryDetail(): void {
        if (this.selectedId !== undefined) this.openTransaction(this.selectedId);
    }

    reset(): void {
        this.detailRequest?.unsubscribe();
        this.selectedId = undefined;
        this.detailLoading = false;
        this.transaction = undefined;
        this.errorMessage = '';
    }
}
