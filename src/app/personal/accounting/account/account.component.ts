import {SubmissionState} from '../../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component, DestroyRef, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AgGridModule} from 'ag-grid-angular';
import {Account} from '../../../shared/datatype/Account';
import {ColDef, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';

@Component({
    selector: 'app-account',
    imports: [
        GridFitDirective,
        NumberFormatterDirective,
        AgGridModule,
        FormsModule,
        CommonModule
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.css'
})
export class AccountComponent {
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    protected accounts: Account[] = [];
    protected account?: Account;
    protected accountName?: string;
    protected addingAccount: boolean = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Account', field: 'name', sortable: true, filter: true},
        {
            headerName: 'Balance', field: 'balance', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)} €`
        }
    ];

    constructor(
        private accountingService: AccountingService
    ) {
    }


    ngOnInit(): void {
        this.accountingService.get_accounts().subscribe(
            (accounts: Account[]) => this.accounts = accounts
        );
    }

    trim(): void {
        this.account!.name = this.account!.name.trim();

        if (this.account!.balance == null) {
            this.account!.balance = 0
        }
    }

    check(): boolean {
        if (this.account!.name === '') {
            this.statusMessage = 'The account must have a name';
            return false;
        }

        return true
    }

    reset(): void {
        this.ngOnInit();

        this.account = undefined;
        this.accountName = undefined;
        this.addingAccount = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.account = {...event.data};
        this.accountName = event.data.name;
    }

    onAdd(): void {
        this.addingAccount = true;
        this.account = {
            name: '',
            balance: 0
        };
    }

    onSave(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.accountingService.add_account(this.account!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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

        this.submission.run(() => this.accountingService.update_account(this.accountName!, this.account!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        if (confirm('Are you sure you want to delete this account?')) {
            this.statusMessage = '';
            this.submission.run(() => this.accountingService.delete_account(this.accountName!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
