import {Component} from '@angular/core';
import {AllCommunityModule, ModuleRegistry} from 'ag-grid-community';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CommonModule} from '@angular/common';
import {CarComponent} from './car/car.component';
import {RefuelComponent} from './refuel/refuel.component';

@Component({
    selector: 'app-fuel',
    imports: [
        CommonModule,
        DashboardComponent,
        CarComponent,
        RefuelComponent
    ],
    templateUrl: './fuel.component.html',
    styleUrl: './fuel.component.css'
})
export class FuelComponent {
    protected selectedOption: string = '';

    constructor() {
        ModuleRegistry.registerModules([AllCommunityModule]);
    }

    protected selectOption(option: string) {
        this.selectedOption = option;
    }
}
