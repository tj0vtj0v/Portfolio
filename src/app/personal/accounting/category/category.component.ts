import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {GridActivateDirective, EditorGridFocus} from '../../../shared/grid/grid-activate.directive';
import {FieldErrorDirective} from '../../../shared/ui/field-error.directive';
import {SubmissionState} from '../../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component, DestroyRef, inject} from '@angular/core';
import {Category} from '../../../shared/datatype/Category';
import {ColDef, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {AgGridModule} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-category',
    providers: [EditorGridFocus],
    imports: [UiSkeletonComponent, GridActivateDirective, FieldErrorDirective,
        GridFitDirective,
        AgGridModule,
        FormsModule,
        CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent
    ],
    templateUrl: './category.component.html',
    styleUrl: './category.component.css'
})
export class CategoryComponent {
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    protected categories: Category[] = [];
    protected category?: Category;
    protected categoryName?: string;
    protected addingCategory: boolean = false;
    protected statusMessage = '';
    protected loading = true;
    protected loadError = '';
    protected fieldErrors: Record<string, string> = {};
    protected successMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Name', field: 'name', sortable: true, filter: true}
    ]

    constructor(
        private accountingService: AccountingService
    ) {
    }


    ngOnInit(): void { this.load(); }

    protected load(): void {
        this.loading = true;
        this.loadError = '';
        this.accountingService.get_categories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (categories: Category[]) => { this.categories = categories; this.loading = false; },
            error: () => { this.loading = false; this.loadError = 'Unable to load categories.'; }
        });
    }

    trim(): void {
        this.category!.name = this.category!.name.trim();
    }

    check(): boolean {
        this.fieldErrors = {};
        if (this.category!.name === '') {
            this.statusMessage = 'The category must have a name';
            this.fieldErrors['name'] = this.statusMessage;
            return false;
        }

        return true;
    }

    reset(): void {
        this.fieldErrors = {};
        this.load()

        this.category = undefined;
        this.categoryName = undefined;
        this.addingCategory = false;
        this.statusMessage = '';
    }

    onRowClicked(event: {data: Category}): void {
        this.category = {...event.data};
        this.categoryName = event.data.name;
    }

    onAdd(): void {
        this.fieldErrors = {};
        this.successMessage = '';
        this.statusMessage = '';
        this.addingCategory = true;
        this.category = {
            name: ''
        }
    }

    onSave(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.accountingService.add_category(this.category!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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

        this.submission.run(() => this.accountingService.update_category(this.categoryName!, this.category!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        if (confirm('Are you sure you want to delete this category?')) {
            this.statusMessage = '';
            this.submission.run(() => this.accountingService.delete_category(this.categoryName!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
