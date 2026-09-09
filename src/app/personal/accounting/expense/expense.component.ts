import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {GridActivateDirective, EditorGridFocus} from '../../../shared/grid/grid-activate.directive';
import {FieldErrorDirective} from '../../../shared/ui/field-error.directive';
import {SubmissionState} from '../../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridReadyEvent} from 'ag-grid-community';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component, DestroyRef, inject} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Expense} from '../../../shared/datatype/Expense';
import {Account} from '../../../shared/datatype/Account';
import {Category} from '../../../shared/datatype/Category';
import {ColDef, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {forkJoin, finalize} from 'rxjs';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {formatLocalDate} from '../../../shared/date-range/period-range';
import {accountingEditorRequest, clearAccountingEditorQuery} from '../accounting-editor-route';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-expense',
    providers: [EditorGridFocus],
    imports: [UiSkeletonComponent, GridActivateDirective, FieldErrorDirective,
        GridFitDirective,
        NumberFormatterDirective,
        AgGridAngular,
        FormsModule,
        CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent
    ],
    templateUrl: './expense.component.html',
    styleUrl: './expense.component.css'
})
export class ExpenseComponent {
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute, {optional: true});
    private readonly router = inject(Router, {optional: true});
    private handledRequest?: string;
    protected expenses: Expense[] = [];
    protected accounts: Account[] = [];
    protected categories: Category[] = [];
    protected expense?: Expense;
    protected addingExpense: boolean = false;
    protected statusMessage = '';
    protected loading = true;
    protected loadError = '';
    protected fieldErrors: Record<string, string> = {};
    protected successMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {headerName: 'Reason', field: 'reason', sortable: true, filter: true},
        {
            headerName: 'Amount', field: 'amount', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)} €`
        },
        {headerName: 'Account', field: 'account.name', sortable: true, filter: true},
        {headerName: 'Category', field: 'category.name', sortable: true, filter: true}
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

    ngOnInit() {
        this.route?.queryParamMap?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (!this.loading && !this.loadError) this.applyRouteRequest();
        });
        this.load();
    }

    protected load(): void {
        this.loading = true;
        this.loadError = '';
        forkJoin([
            this.accountingService.get_expenses(),
            this.accountingService.get_accounts(),
            this.accountingService.get_categories()
        ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next: ([expenses, accounts, categories]) => {
            this.expenses = expenses;
            this.accounts = accounts;
            this.categories = categories;
            this.loading = false;
            this.applyRouteRequest();
        }, error: () => { this.loading = false; this.loadError = 'Unable to load expenses or editor options.'; } });
    }

    private applyRouteRequest(): void {
        const request = accountingEditorRequest(this.route);
        const key = JSON.stringify(request);
        if (key === this.handledRequest || this.submission.pending) return;
        const previous = this.handledRequest;
        this.handledRequest = key;
        if (!request.add && !request.recordId && previous === undefined) return;
        this.expense = undefined;
        this.addingExpense = false;
        this.statusMessage = '';
        this.fieldErrors = {};
        if (request.add) this.onAdd();
        else if (request.recordId) {
            const expense = this.expenses.find(item => item.id === request.recordId);
            if (expense) this.selectExpense(expense);
            else this.statusMessage = 'The requested record was not found.';
        }
    }

    trim(): void {
        this.expense!.reason = this.expense!.reason.trim();

        if (this.expense!.amount == null) {
            this.expense!.amount = 0
        }
    }

    check(): boolean {
        this.fieldErrors = {};
        if (this.expense!.account == undefined) {
            this.statusMessage = 'The expense must have an account'
            this.fieldErrors['account'] = this.statusMessage;
            return false;
        }
        if (this.expense!.category == undefined) {
            this.statusMessage = 'The expense must have a category'
            this.fieldErrors['category'] = this.statusMessage;
            return false;
        }
        if (this.expense!.reason === '') {
            this.statusMessage = 'The expense must have a reason'
            this.fieldErrors['reason'] = this.statusMessage;
            return false;
        }
        if (this.expense!.date === '') {
            this.statusMessage = 'The expense must have a date'
            this.fieldErrors['date'] = this.statusMessage;
            return false;
        }

        if (this.expense!.amount <= 0) {
            this.statusMessage = 'The expense must be greater than 0';
            this.fieldErrors['amount'] = this.statusMessage;
            return false;
        }

        return true;
    }

    reset(): void {
        this.fieldErrors = {};
        this.expense = undefined;
        this.addingExpense = false;
        this.statusMessage = '';
        clearAccountingEditorQuery(this.router, this.route);
        this.load();
    }

    onRowClicked(event: {data: Expense}): void {
        this.selectExpense(event.data);
    }

    private selectExpense(value: Expense): void {
        const account = this.accounts.find(account => account.id === value.account?.id);
        const category = this.categories.find(category => category.id === value.category?.id);
        this.expense = {
            id: value.id,
            date: value.date,
            reason: value.reason,
            amount: value.amount,
            account: account,
            category: category
        }
    }

    onAdd(): void {
        this.fieldErrors = {};
        this.successMessage = '';
        this.statusMessage = '';
        this.addingExpense = true;

        this.expense = {
            date: formatLocalDate(new Date()),
            reason: '',
            amount: 0,
            account: undefined,
            category: undefined
        }
    }

    onSave(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.accountingService.add_expense(this.expense!)).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
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
        );
    }

    onUpdate(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.accountingService.update_expense(this.expense!)).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
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
        );
    }

    onDelete(): void {
        if (this.submission.pending) return;
        if (confirm('Are you sure you want to delete this expense?')) {
            this.statusMessage = '';
            this.submission.run(() => this.accountingService.delete_expense(this.expense!.id!)).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
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
