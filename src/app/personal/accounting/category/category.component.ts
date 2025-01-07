import {Component} from '@angular/core';
import {Category} from '../../../shared/datatype/Category';
import {ClientSideRowModelModule, ColDef, Module, RowClickedEvent} from 'ag-grid-community';
import {AccountingService} from '../../../shared/api/accounting.service';
import {AgGridModule} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-category',
    imports: [
        AgGridModule,
        FormsModule,
        CommonModule
    ],
    templateUrl: './category.component.html',
    styleUrl: './category.component.css'
})
export class CategoryComponent {
    protected categories: Category[] = [];
    protected category?: Category;
    protected categoryName?: string;
    protected addingCategory: boolean = false;
    protected statusMessage = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Name', field: 'name', sortable: true, filter: true}
    ]
    protected modules: Module[] = [ClientSideRowModelModule]

    constructor(
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.accountingService.get_categories().subscribe(
            (categories: Category[]) => this.categories = categories
        )
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
        this.accountingService.add_category(this.category!).subscribe(
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
        this.accountingService.update_category(this.categoryName!, this.category!).subscribe(
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
        if (confirm('Are you sure you want to delete this category?')) {
            this.accountingService.delete_category(this.categoryName!).subscribe(
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
