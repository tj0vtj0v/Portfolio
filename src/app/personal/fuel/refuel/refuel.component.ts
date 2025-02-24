import {Component} from '@angular/core';
import {Refuel} from '../../../shared/datatype/Refuel';
import {AgGridModule} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AllCommunityModule, ColDef, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {FuelService} from '../../../shared/api/fuel.service';
import {forkJoin} from 'rxjs';
import {Car} from '../../../shared/datatype/Car';
import {FuelType} from '../../../shared/datatype/FuelType';
import {NumberFormatterDirective} from '../../../shared/formatter/number-formatter.directive';

@Component({
    selector: 'app-refuel',
    imports: [
        NumberFormatterDirective,
        AgGridModule,
        FormsModule,
        CommonModule
    ],
    templateUrl: './refuel.component.html',
    styleUrl: './refuel.component.css'
})
export class RefuelComponent {
    protected refuels: Refuel[] = [];
    protected cars: Car[] = [];
    protected fuel_types: FuelType[] = [];
    protected refuel?: Refuel;
    protected addingRefuel: boolean = false;
    protected statusMessage: string = '';

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
        ModuleRegistry.registerModules([AllCommunityModule])
    }

    onGridReady(params: any) {
        params.api.sizeColumnsToFit();
        window.addEventListener('resize', () => {
            params.api.sizeColumnsToFit();
        });
    }

    ngOnInit(): void {
        forkJoin([
            this.fuelService.get_refuels(),
            this.fuelService.get_cars(),
            this.fuelService.get_fuel_types()
        ]).subscribe(([refuels, cars, fuel_types]) => {
            this.refuels = refuels;
            this.cars = cars;
            this.fuel_types = fuel_types;
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
        if (this.refuel!.date && new Date(this.refuel!.date) > new Date()) {
            this.statusMessage = 'The refuel must have a date no later than today'
            return false;
        }
        if (this.refuel!.distance <= 0) {
            this.statusMessage = 'The distance has to be greater than 0'
            return false;
        }
        if (this.refuel!.consumption <= 0) {
            this.statusMessage = 'The consumption has to be greater than 0'
            return false;
        }
        if (this.refuel!.cost <= 0) {
            this.statusMessage = 'The cost has to be greater than 0'
            return false;
        }
        if (this.refuel!.fuel_type === undefined) {
            this.statusMessage = 'The refuel must have a fuel type'
            return false;
        }
        if (this.refuel!.car === undefined) {
            this.statusMessage = 'The refuel must have a car'
            return false;
        }

        return true;
    }

    reset(): void {
        this.ngOnInit();

        this.refuel = undefined;
        this.addingRefuel = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        const car = this.cars.find(car => car.id === event.data.car.id);
        const fuel_type = this.fuel_types.find(fuelType => fuelType.id === event.data.fuel_type.id);
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
        this.trim();
        if (!this.check())
            return;

        this.fuelService.add_refuel(this.refuel!).subscribe(
            () => this.reset(),
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
        this.trim();
        if (!this.check())
            return;

        this.fuelService.update_refuel(this.refuel!).subscribe(
            () => this.reset(),
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
        if (confirm('Are you sure you want to delete this refuel?')) {
            this.fuelService.delete_refuel(this.refuel!.id!).subscribe(
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
