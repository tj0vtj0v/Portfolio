import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {GridActivateDirective, EditorGridFocus} from '../../../shared/grid/grid-activate.directive';
import {FieldErrorDirective} from '../../../shared/ui/field-error.directive';
import {SubmissionState} from '../../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GridFitDirective} from '../../../shared/grid/grid-fit.directive';
import {Component, DestroyRef, inject} from '@angular/core';
import {Refuel} from '../../../shared/datatype/Refuel';
import {AgGridModule} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ColDef, RowClickedEvent} from 'ag-grid-community';
import {FuelService} from '../../../shared/api/fuel.service';
import {forkJoin} from 'rxjs';
import {Car} from '../../../shared/datatype/Car';
import {FuelType} from '../../../shared/datatype/FuelType';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';
import {UiEmptyStateComponent} from '../../../shared/ui/empty-state/ui-empty-state.component';

@Component({
    selector: 'app-refuel',
    providers: [EditorGridFocus],
    imports: [UiSkeletonComponent, GridActivateDirective, FieldErrorDirective,
        GridFitDirective,
        NumberFormatterDirective,
        AgGridModule,
        FormsModule,
        CommonModule, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent, UiEmptyStateComponent
    ],
    templateUrl: './refuel.component.html',
    styleUrl: './refuel.component.css'
})
export class RefuelComponent {
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    protected refuels: Refuel[] = [];
    protected cars: Car[] = [];
    protected fuel_types: FuelType[] = [];
    protected refuel?: Refuel;
    protected addingRefuel: boolean = false;
    protected statusMessage: string = '';
    protected fieldErrors: Record<string, string> = {};
    protected successMessage = '';
    protected loading = true;
    protected loadError = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Date', field: 'date', sortable: true, filter: true},
        {
            headerName: 'L/100km', sortable: true, filter: false,
            valueGetter: (params) => {
                return (params.data.consumption / (params.data.distance / 100));
            },
            valueFormatter: (params) => params.value?.toFixed(1)
        },
        {
            headerName: 'Distance', field: 'distance', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(1)} km`
        },
        {
            headerName: 'Cost', field: 'cost', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)} €`
        },
        {
            headerName: 'Consumption', field: 'consumption', sortable: true, filter: true,
            valueFormatter: (params) => `${params.value?.toFixed(2)} L`
        },
        {headerName: 'Car', field: 'car.name', sortable: true, filter: true},
        {headerName: 'Fuel', field: 'fuel_type.name', sortable: true, filter: true}
    ];

    constructor(
        private fuelService: FuelService
    ) {
    }


    ngOnInit(): void {
        this.loadData();
    }

    protected loadData(): void {
        this.loading = true;
        this.loadError = '';
        forkJoin([
            this.fuelService.get_refuels(),
            this.fuelService.get_cars(),
            this.fuelService.get_fuel_types()
        ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ([refuels, cars, fuel_types]) => {
                this.refuels = refuels;
                this.cars = cars;
                this.fuel_types = fuel_types;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.loadError = 'Refuels and editor options could not be loaded.';
            }
        });
    }

    trim(): void {
        if (this.refuel!.cost == null) {
            this.refuel!.cost = 0
        }
        if (this.refuel!.consumption == null) {
            this.refuel!.consumption = 0
        }
        if (this.refuel!.distance == null) {
            this.refuel!.distance = 0
        }
    }

    check(): boolean {
        this.fieldErrors = {};
        if (this.refuel!.date && new Date(this.refuel!.date) > new Date()) {
            this.statusMessage = 'The refuel must have a date no later than today'
            this.fieldErrors['date'] = this.statusMessage;
            return false;
        }
        if (this.refuel!.distance <= 0) {
            this.statusMessage = 'The distance has to be greater than 0'
            this.fieldErrors['distance'] = this.statusMessage;
            return false;
        }
        if (this.refuel!.consumption <= 0) {
            this.statusMessage = 'The consumption has to be greater than 0'
            this.fieldErrors['consumption'] = this.statusMessage;
            return false;
        }
        if (this.refuel!.cost <= 0) {
            this.statusMessage = 'The cost has to be greater than 0'
            this.fieldErrors['cost'] = this.statusMessage;
            return false;
        }
        if (this.refuel!.fuel_type === undefined) {
            this.statusMessage = 'The refuel must have a fuel type'
            this.fieldErrors['fuel_type'] = this.statusMessage;
            return false;
        }
        if (this.refuel!.car === undefined) {
            this.statusMessage = 'The refuel must have a car'
            this.fieldErrors['car'] = this.statusMessage;
            return false;
        }

        return true;
    }

    reset(): void {
        this.fieldErrors = {};
        this.loadData();

        this.refuel = undefined;
        this.addingRefuel = false;
        this.statusMessage = '';
    }

    onRowClicked(event: {data: Refuel}): void {
        const car = this.cars.find(car => car.id === event.data.car?.id);
        const fuel_type = this.fuel_types.find(fuelType => fuelType.id === event.data.fuel_type?.id);
        this.refuel = {
            id: event.data.id,
            date: event.data.date,
            distance: event.data.distance,
            consumption: event.data.consumption,
            cost: event.data.cost,
            car: car,
            fuel_type: fuel_type
        }
    }

    onAdd(): void {
        this.fieldErrors = {};
        this.successMessage = '';
        this.statusMessage = '';
        this.addingRefuel = true;

        this.refuel = {
            date: new Date().toISOString().split('T')[0],
            distance: 0,
            consumption: 0,
            cost: 0,
            fuel_type: undefined,
            car: undefined
        }
    }

    onSave(): void {
        if (this.submission.pending) return;
        this.trim();
        if (!this.check())
            return;

        this.statusMessage = '';

        this.submission.run(() => this.fuelService.add_refuel(this.refuel!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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

        this.submission.run(() => this.fuelService.update_refuel(this.refuel!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        if (confirm('Are you sure you want to delete this refuel?')) {
            this.statusMessage = '';
            this.submission.run(() => this.fuelService.delete_refuel(this.refuel!.id!)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
