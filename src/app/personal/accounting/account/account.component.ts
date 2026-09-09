import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {GridActivateDirective, EditorGridFocus} from '../../../shared/grid/grid-activate.directive';
import {FieldErrorDirective} from '../../../shared/ui/field-error.directive';
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
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-account',
    providers: [EditorGridFocus],
    imports: [UiSkeletonComponent, GridActivateDirective, FieldErrorDirective,
        GridFitDirective,
        NumberFormatterDirective,
        AgGridModule,
        FormsModule,
        CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent
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
    protected loading = true;
    protected loadError = '';
    protected fieldErrors: Record<string, string> = {};
    protected successMessage = '';

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


    ngOnInit(): void { this.load(); }

    protected load(): void {
        this.loading = true;
        this.loadError = '';
        this.accountingService.get_accounts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (accounts: Account[]) => { this.accounts = accounts; this.loading = false; },
            error: () => { this.loading = false; this.loadError = 'Unable to load accounts.'; }
        });
    }

    trim(): void {
        this.account!.name = this.account!.name.trim();

        if (this.account!.balance == null) {
            this.account!.balance = 0
        }
    }

    check(): boolean {
        this.fieldErrors = {};
        if (this.account!.name === '') {
            this.statusMessage = 'The account must have a name';
            this.fieldErrors['name'] = this.statusMessage;
            return false;
        }

        return true
    }

    reset(): void {
        this.fieldErrors = {};
        this.load();

        this.account = undefined;
        this.accountName = undefined;
        this.addingAccount = false;
        this.statusMessage = '';
    }

    onRowClicked(event: {data: Account}): void {
        this.account = {...event.data};
        this.accountName = event.data.name;
    }

    onAdd(): void {
        this.fieldErrors = {};
        this.successMessage = '';
        this.statusMessage = '';
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

        this.submission.run(() => this.accountingService.update_account(this.accountName!, this.account!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        if (confirm('Are you sure you want to delete this account?')) {
            this.statusMessage = '';
            this.submission.run(() => this.accountingService.delete_account(this.accountName!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
