import {Component} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Car} from '../../../shared/datatype/Car';
import {AllCommunityModule, ColDef, ModuleRegistry, RowClickedEvent} from 'ag-grid-community';
import {FuelService} from '../../../shared/api/fuel.service';

@Component({
    selector: 'app-car',
    imports: [
        AgGridModule,
        FormsModule,
        CommonModule
    ],
    templateUrl: './car.component.html',
    styleUrl: './car.component.css'
})
export class CarComponent {
    protected cars: Car[] = [];
    protected car?: Car;
    protected carName?: string;
    protected addingCar: boolean = false;
    protected statusMessage: string = '';

    protected columnDefs: ColDef[] = [
        {headerName: 'Name', field: 'name', sortable: true, filter: true},
        {headerName: 'Usage start', field: 'usage_start', sortable: true, filter: true},
        {headerName: 'Usage end', field: 'usage_end', sortable: true, filter: true}
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
        this.fuelService.get_cars().subscribe(
            (cars: Car[]) => this.cars = cars
        );
    }

    trim(): void {
        this.car!.name = this.car!.name.trim();

        if (this.car!.usage_end === '') {
            delete this.car!.usage_end
        }
    }

    check(): boolean {
        if (this.car!.name === '') {
            this.statusMessage = 'The car must have a name';
            return false;
        }
        if (this.car!.usage_start === '') {
            this.statusMessage = 'The car must have a start usage';
            return false;
        }

        if (new Date(this.car!.usage_start) > new Date()) {
            this.statusMessage = 'The start of usage must not be in the future'
            return false;
        }
        if (this.car!.usage_end && new Date(this.car!.usage_start) > new Date(this.car!.usage_end)) {
            this.statusMessage = 'The start must not be after the end of usage'
            return false;
        }

        return true;
    }

    reset(): void {
        this.ngOnInit();

        this.car = undefined;
        this.carName = undefined;
        this.addingCar = false;
        this.statusMessage = '';
    }

    onRowClicked(event: RowClickedEvent): void {
        this.car = {...event.data};
        this.carName = event.data.name;
    }

    onAdd(): void {
        this.addingCar = true;
        this.car = {
            name: '',
            usage_start: ''
        };
    }

    onSave(): void {
        this.trim();
        if (!this.check())
            return;

        this.fuelService.add_car(this.car!).subscribe(
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
        this.trim();
        if (!this.check())
            return;

        this.fuelService.update_car(this.carName!, this.car!).subscribe(
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
        if (confirm('Are you sure you want to delete this car?')) {
            this.fuelService.delete_car(this.carName!).subscribe(
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
