import {AmountPrivacyToggleComponent} from '../../../shared/privacy/amount-privacy-toggle.component';
import {PrivateAmountCellComponent} from '../../../shared/privacy/private-amount.component';
import {displayDate} from '../../../shared/formatter/display-date';
import {FeedbackMessage} from '../../../shared/ui/feedback/feedback-message';
import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {GridActivateDirective, EditorGridFocus} from '../../../shared/grid/grid-activate.directive';
import {FieldErrorDirective} from '../../../shared/ui/field-error.directive';
import {SubmissionState} from '../../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridApi, GridReadyEvent} from 'ag-grid-community';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {GridFilterStateService} from '../../../shared/grid/grid-filter-state.service';
import {Component, DestroyRef, inject} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {Transfer} from '../../../shared/datatype/Transfer';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ColDef, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {Account} from '../../../shared/datatype/Account';
import {forkJoin, finalize} from 'rxjs';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {formatLocalDate} from '../../../shared/date-range/period-range';
import {accountingEditorRequest, clearAccountingEditorQuery} from '../accounting-editor-route';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';
import {UiSelectComponent} from '../../../shared/ui/select/ui-select.component';
import {UiDateInputComponent} from '../../../shared/ui/date-input/ui-date-input.component';

@Component({
    selector: 'app-transfer',
    providers: [EditorGridFocus],
    imports: [AmountPrivacyToggleComponent, UiSkeletonComponent, GridActivateDirective, FieldErrorDirective,
        GridFitDirective,
        NumberFormatterDirective,
        AgGridAngular,
        FormsModule,
        CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent, UiSelectComponent, UiDateInputComponent
    ],
    templateUrl: './transfer.component.html',
    styleUrl: './transfer.component.css'
})
export class TransferComponent {
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    private readonly gridFilterState = inject(GridFilterStateService);
    private readonly route = inject(ActivatedRoute, {optional: true});
    private readonly router = inject(Router, {optional: true});
    private readonly gridFilterKey = 'accounting.transfers';
    private gridApi?: GridApi;
    private handledRequest?: string;
    protected accounts: Account[] = [];
    protected transfers: Transfer[] = [];
    protected transfer?: Transfer;
    protected addingTransfer: boolean = false;
    private readonly statusMessageState = new FeedbackMessage('error');
    protected get statusMessage(): string { return this.statusMessageState.value; }
    protected set statusMessage(message: string) { this.statusMessageState.value = message; }
    protected loading = true;
    protected loadError = '';
    protected fieldErrors: Record<string, string> = {};
    private readonly successMessageState = new FeedbackMessage('success');
    protected get successMessage(): string { return this.successMessageState.value; }
    protected set successMessage(message: string) { this.successMessageState.value = message; }

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true, valueFormatter: params => displayDate(params.value)},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
            cellRenderer: PrivateAmountCellComponent,
            valueFormatter: (params) => `${params.value?.toFixed(2)} €`
        },
        {headerName: 'Source Account', field: 'source.name', sortable: true, filter: true},
        {headerName: 'Target Account', field: 'target.name', sortable: true, filter: true},
    ];

    constructor(
        private accountingService: AccountingService
    ) {
    }


    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        params.api.setFilterModel(this.gridFilterState.load(this.gridFilterKey) ?? this.gridFilterState.currentMonthFilterModel());
        params.api.onFilterChanged();
    }

    protected saveGridFilters(api: GridApi): void {
        this.gridFilterState.save(this.gridFilterKey, api.getFilterModel());
    }

    protected resetFilters(): void {
        if (!this.gridApi) return;
        this.gridApi.setFilterModel(this.gridFilterState.currentMonthFilterModel());
        this.gridApi.onFilterChanged();
        this.saveGridFilters(this.gridApi);
    }

    ngOnInit(): void {
        this.route?.queryParamMap?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (!this.loading && !this.loadError) this.applyRouteRequest();
        });
        this.load();
    }

    protected load(): void {
        this.loading = true;
        this.loadError = '';
        forkJoin([
            this.accountingService.get_transfers(),
            this.accountingService.get_accounts()
        ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next: ([transfers, accounts]) => {
            this.transfers = transfers;
            this.accounts = accounts;
            this.loading = false;
            this.applyRouteRequest();
        }, error: () => { this.loading = false; this.loadError = 'Unable to load transfers or editor options.'; } });
    }

    private applyRouteRequest(): void {
        const request = accountingEditorRequest(this.route);
        const key = JSON.stringify(request);
        if (key === this.handledRequest || this.submission.pending) return;
        const previous = this.handledRequest;
        this.handledRequest = key;
        if (!request.add && !request.recordId && previous === undefined) return;
        this.transfer = undefined;
        this.addingTransfer = false;
        this.statusMessage = '';
        this.fieldErrors = {};
        if (request.add) this.onAdd();
        else if (request.recordId) {
            const transfer = this.transfers.find(item => item.id === request.recordId);
            if (transfer) this.selectTransfer(transfer);
            else this.statusMessage = 'The requested record was not found.';
        }
    }

    trim(): void {
        if (this.transfer!.amount == null) {
            this.transfer!.amount = 0
        }
    }

    check(): boolean {
        this.fieldErrors = {};
        if (this.transfer!.source == undefined) {
            this.statusMessage = 'The transfer must have a source';
            this.fieldErrors['source'] = this.statusMessage;
            return false;
        }
        if (this.transfer!.target == undefined) {
            this.statusMessage = 'The transfer must have a target';
            this.fieldErrors['target'] = this.statusMessage;
            return false;
        }
        if (this.transfer!.source.id === this.transfer!.target.id) {
            this.statusMessage = 'Source and target accounts must be different';
            this.fieldErrors['source'] = this.statusMessage;
            return false;
        }
        if (this.transfer!.date === '') {
            this.statusMessage = 'The transfer must have a date';
            this.fieldErrors['date'] = this.statusMessage;
            return false;
        }

        if (this.transfer!.amount <= 0) {
            this.statusMessage = 'The transfer must be greater than 0';
            this.fieldErrors['amount'] = this.statusMessage;
            return false;
        }

        return true;
    }

    reset(): void {
        this.fieldErrors = {};
        this.transfer = undefined;
        this.addingTransfer = false;
        this.statusMessage = '';
        clearAccountingEditorQuery(this.router, this.route);
        this.load();
    }

    onRowClicked(event: {data: Transfer}): void {
        this.selectTransfer(event.data);
    }

    private selectTransfer(value: Transfer): void {
        const source = this.accounts.find(account => account.id === value.source?.id);
        const target = this.accounts.find(account => account.id === value.target?.id);
        this.transfer = {
            id: value.id,
            date: value.date,
            amount: value.amount,
            source: source,
            target: target
        };
    }

    onAdd(): void {
        this.fieldErrors = {};
        this.successMessage = '';
        this.statusMessage = '';
        this.addingTransfer = true;

        this.transfer = {
            date: formatLocalDate(new Date()),
            amount: 0,
            source: undefined,
            target: undefined
        }
    }

    onSave(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.accountingService.add_transfer(this.transfer!)).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            if (!this.destroyRef.destroyed && !this.loading && !this.loadError) this.applyRouteRequest();
        })).subscribe(
            () => { this.reset(); this.successMessage = 'Changes saved successfully.'; },
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Adding failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Adding failed';
                }
            }
        )
    }

    onUpdate(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.accountingService.update_transfer(this.transfer!)).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            if (!this.destroyRef.destroyed && !this.loading && !this.loadError) this.applyRouteRequest();
        })).subscribe(
            () => { this.reset(); this.successMessage = 'Changes saved successfully.'; },
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Edit failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Edit failed';
                }
            }
        )
    }

    onDelete(): void {
        if (this.submission.pending) return;
        if (confirm('Are you sure you want to delete this transfer?')) {
            this.statusMessage = '';
            this.submission.run(() => this.accountingService.delete_transfer(this.transfer!.id!)).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            if (!this.destroyRef.destroyed && !this.loading && !this.loadError) this.applyRouteRequest();
        })).subscribe(
                () => { this.reset(); this.successMessage = 'Changes saved successfully.'; },
                (error) => {
                    if (error?.error?.detail) {
                        this.statusMessage = `Delete failed: ${error.error.detail}`;
                    } else {
                        this.statusMessage = 'Delete failed';
                    }
                }
            )
        }
    }
}
