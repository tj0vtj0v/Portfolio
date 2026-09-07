import {SubmissionState} from '../../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridReadyEvent} from 'ag-grid-community';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component, DestroyRef, inject} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {Transfer} from '../../../shared/datatype/Transfer';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ColDef, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {Account} from '../../../shared/datatype/Account';
import {forkJoin} from 'rxjs';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';

@Component({
    selector: 'app-transfer',
    imports: [
        GridFitDirective,
        NumberFormatterDirective,
        AgGridAngular,
        FormsModule,
        CommonModule
    ],
    templateUrl: './transfer.component.html',
    styleUrl: './transfer.component.css'
})
export class TransferComponent {
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    protected accounts: Account[] = [];
    protected transfers: Transfer[] = [];
    protected transfer?: Transfer;
    protected addingTransfer: boolean = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
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

        const startOfMonth = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 0))

        params.api.setFilterModel({
            date: {
                type: 'greaterThan',
                dateFrom: startOfMonth.toISOString().split('T')[0]
            }
        })

        params.api.onFilterChanged();
    }

    ngOnInit(): void {
        forkJoin([
            this.accountingService.get_transfers(),
            this.accountingService.get_accounts()
        ]).subscribe(([transfers, accounts]) => {
            this.transfers = transfers;
            this.accounts = accounts;
        });
    }

    trim(): void {
        if (this.transfer!.amount == null) {
            this.transfer!.amount = 0
        }
    }

    check(): boolean {
        if (this.transfer!.source == undefined) {
            this.statusMessage = 'The transfer must have a source';
            return false;
        }
        if (this.transfer!.target == undefined) {
            this.statusMessage = 'The transfer must have a target';
            return false;
        }
        if (this.transfer!.date === '') {
            this.statusMessage = 'The transfer must have a date';
            return false;
        }

        if (this.transfer!.amount <= 0) {
            this.statusMessage = 'The transfer must be greater than 0';
            return false;
        }

        return true;
    }

    reset(): void {
        this.ngOnInit()

        this.transfer = undefined;
        this.addingTransfer = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        const source = this.accounts.find(account => account.id === event.data.source.id);
        const target = this.accounts.find(account => account.id === event.data.target.id);
        this.transfer = {
            id: event.data.id,
            date: event.data.date,
            amount: event.data.amount,
            source: source,
            target: target
        };
    }

    onAdd(): void {
        this.addingTransfer = true;

        this.transfer = {
            date: new Date().toISOString().split('T')[0],
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

        this.submission.run(() => this.accountingService.add_transfer(this.transfer!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            () => this.reset(),
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

        this.submission.run(() => this.accountingService.update_transfer(this.transfer!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            () => this.reset(),
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
            this.submission.run(() => this.accountingService.delete_transfer(this.transfer!.id!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
                () => this.reset(),
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
