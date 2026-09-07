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

@Component({
    selector: 'app-category',
    imports: [
        GridFitDirective,
        AgGridModule,
        FormsModule,
        CommonModule
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

    protected columnDefs: ColDef[] = [
        {headerName: 'Name', field: 'name', sortable: true, filter: true}
    ]

    constructor(
        private accountingService: AccountingService
    ) {
    }


    ngOnInit(): void {
        this.accountingService.get_categories().subscribe(
            (categories: Category[]) => this.categories = categories
        )
    }

    trim(): void {
        this.category!.name = this.category!.name.trim();
    }

    check(): boolean {
        if (this.category!.name === '') {
            this.statusMessage = 'The category must have a name';
            return false;
        }

        return true;
    }

    reset(): void {
        this.ngOnInit()

        this.category = undefined;
        this.categoryName = undefined;
        this.addingCategory = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.category = {...event.data};
        this.categoryName = event.data.name;
    }

    onAdd(): void {
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

        this.submission.run(() => this.accountingService.update_category(this.categoryName!, this.category!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        if (confirm('Are you sure you want to delete this category?')) {
            this.statusMessage = '';
            this.submission.run(() => this.accountingService.delete_category(this.categoryName!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
