import {Component} from '@angular/core';
import {NgxEchartsDirective, NgxEchartsModule, provideEchartsCore} from 'ngx-echarts';
import {FormsModule} from '@angular/forms';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CommonModule, DatePipe} from '@angular/common';
import {Car} from '../../../shared/datatype/Car';
import {Refuel} from '../../../shared/datatype/Refuel';
import {FuelType} from '../../../shared/datatype/FuelType';
import {EChartsCoreOption} from 'echarts';
import {FuelService} from '../../../shared/api/fuel.service';
import {forkJoin} from 'rxjs';

@Component({
    selector: 'app-dashboard',
    imports: [
        NgxEchartsDirective,
        NgxEchartsModule,
        MatOptionModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        FormsModule,
        CommonModule
    ],
    providers: [
        provideEchartsCore({
            echarts: () => import('echarts')
        })
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    //original data
    protected cars: Car[] = [];
    protected fuelTypes: FuelType[] = [];
    private refuels: Refuel[] = [];

    //filter
    protected startDate?: string = new Date(Date.UTC(new Date().getFullYear(), 0, 1)).toISOString().split('T')[0];
    protected endDate?: string;

    //visual data
    protected filteredRefuels: Refuel[] = [];

    //visuals
    protected travel_chart: EChartsCoreOption = {};

    constructor(
        private fuelService: FuelService
    ) {
    }

    ngOnInit(): void {
        forkJoin(
            [
                this.fuelService.get_fuel_types(),
                this.fuelService.get_cars(),
                this.fuelService.get_refuels()
            ]
        ).subscribe(([fuelTypes, cars, refuels]) => {
            this.fuelTypes = fuelTypes;
            this.cars = cars;
            this.refuels = refuels;

            this.update();
        });
    }

    update(): void {
        this.filterData();
        this.build_travel_chart();
    }

    private build_travel_chart(): void {
        let travelDistance = this.filteredRefuels.map(refuel => ({
            date: refuel.date,
            distance: refuel.distance
        }));
        travelDistance.reverse()

        let cumulativeDistance = 0;
        const dateMap = new Map<string, number>();

        if (this.startDate) {
            dateMap.set(this.startDate, 0)
        }

        travelDistance.forEach(entry => {
            cumulativeDistance += entry.distance;

            dateMap.set(entry.date, cumulativeDistance);
        });

        dateMap.set(this.endDate || new Date().toISOString().split("T")[0], cumulativeDistance);

        travelDistance = Array.from(dateMap.entries()).map(([date, distance]) => ({
            date,
            distance
        }));

        this.travel_chart = {
            title: {
                text: 'Cumulative Distance Over Time',
                left: 'center',
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const content = parseFloat(params[0].value[1]).toFixed(0);
                    const date = new DatePipe("en-US").transform(new Date(params[0].value[0]), 'dd.MM.yyyy');
                    return `${date}<br>${content} km`;
                },
            },
            xAxis: {
                type: 'time',
                name: 'Date',
            },
            yAxis: {
                type: 'value',
                name: 'Cumulative Distance (km)',
            },
            series: [
                {
                    name: 'Cumulative Distance',
                    type: 'line',
                    data: travelDistance.map(entry => [entry.date, entry.distance])
                }
            ]
        };
    }

    private filterData(): void {
        this.startDate = this.startDate === "" ? undefined : this.startDate;
        this.endDate = this.endDate === "" ? undefined : this.endDate;

        this.filteredRefuels = this.refuels.filter(refuel => {
            const isAfterStart = this.startDate ? refuel.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? refuel.date <= this.endDate : true;
            return isAfterStart && isBeforeEnd;
        })
    }
}
