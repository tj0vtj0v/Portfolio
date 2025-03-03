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
    protected fuelRefuelMap: Map<string, Refuel[]> = new Map();
    protected carRefuelMap: Map<string, Refuel[]> = new Map();

    //visuals
    protected travel_chart: EChartsCoreOption = {};
    protected fuel_chart: EChartsCoreOption = {};
    protected consumption_chart: EChartsCoreOption = {};
    protected price_chart: EChartsCoreOption = {};

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
        this.build_fuel_chart();
        this.build_consumption_chart();
        this.build_price_chart();
    }

    private build_travel_chart(): void {
        const carMap = new Map<string, { date: string, distance: number }[]>();
        this.filteredRefuels.forEach(refuel => {
            let car = refuel.car!.name;

            if (!carMap.has(car)) {
                carMap.set(car, []);
            }

            carMap.get(car)!.push({
                date: refuel.date,
                distance: refuel.distance
            });
        });

        const refinedData: { name: string, type: string, showSymbol: boolean, data: [string, number][] }[] = [];
        carMap.forEach((refuels, car) => {
            refuels.reverse();

            let cumulativeDistance = 0;
            const dateMap = new Map<string, number>();

            if (this.startDate) {
                dateMap.set(this.startDate, 0);
            }

            refuels.forEach(entry => {
                cumulativeDistance += entry.distance;
                dateMap.set(entry.date, cumulativeDistance);
            });

            dateMap.set(this.endDate || new Date().toISOString().split('T')[0], cumulativeDistance);

            refuels = Array.from(dateMap.entries()).map(([date, distance]) => (
                {date, distance}
            ));

            refinedData.push({
                name: car,
                type: 'line',
                showSymbol: false,
                data: refuels.map(entry => [entry.date, entry.distance])
            });
        });

        this.travel_chart = {
            title: {
                text: 'Cumulative Distance Over Time',
                left: 'center',
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const date = new DatePipe("en-US").transform(new Date(params[0].value[0]), 'dd.MM.yyyy');
                    const content = params.map((param: any) => {
                        const value = parseFloat(param.value[1]).toFixed(0);
                        return `${param.seriesName}: ${value} km`
                    }).join('<br>')
                    return `${date}<br>${content}`;
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
            legend: {
                orient: 'vertical',
                left: 'left',
                selectedMode: 'multiple',
            },
            series: refinedData
        };
    }

    private build_fuel_chart(): void {
        const seriesData: { name: string, type: string, data: [number, number, number][] }[] = [];
        this.carRefuelMap.forEach((refuels: Refuel[], car: string) => {

            seriesData.push({
                name: car,
                type: 'scatter',
                data: refuels.map(entry => [entry.distance, entry.consumption, entry.cost])
            });
        });


        this.fuel_chart = {
            title: {
                text: 'Consumption over Distance',
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                    const consumption = (params.data[1] / (params.data[0] / 100)).toFixed(1)
                    const price = (params.data[2] / params.data[0]).toFixed(2)
                    return `${params.seriesName}<br>${params.data[0]} km, ${params.data[1]} L<br>${consumption} L/100km<br>${price} €/km`;
                }
            },
            xAxis: {
                type: 'value',
                name: 'Travelled distance'
            },
            yAxis: {
                type: 'value',
                name: 'Consumed Fuel'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                selectedMode: 'multiple',
            },
            series: seriesData
        };
    }

    private build_consumption_chart(): void {
        const seriesData: { name: string, type: string, data: [number, number, number, number, number][] }[] = [];
        this.carRefuelMap.forEach((refuels: Refuel[], car: string) => {
            if (refuels.length < 5) return;

            const consumptions = refuels.map(entry => entry.consumption / (entry.distance / 100));
            consumptions.sort((a, b) => a - b);

            const min = consumptions[0];
            const q1 = consumptions[Math.floor(consumptions.length * 0.25)];
            const median = consumptions[Math.floor(consumptions.length * 0.5)];
            const q3 = consumptions[Math.floor(consumptions.length * 0.75)];
            const max = consumptions[consumptions.length - 1];

            seriesData.push({
                name: car,
                type: 'boxplot',
                data: [[min, q1, median, q3, max]],
            });
        });


        this.consumption_chart = {
            title: {
                text: 'Consumption',
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                    return `${params.seriesName}<br/>Min: ${params.data[1].toFixed(1)} L<br/>Median: ${params.data[3].toFixed(1)} L<br/>Max: ${params.data[5].toFixed(1)} L`;
                }
            },
            xAxis: {
                type: 'value',
                name: 'Consumption'
            },
            yAxis: {
                type: 'category',
                data: seriesData.map(s => s.name)
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                selectedMode: 'multiple',
            },
            series: seriesData
        };
    }

    private build_price_chart(): void {
        const refinedData: { name: string, data: [number, number, number, number, number][] }[] = [];
        this.fuelRefuelMap.forEach((refuels: Refuel[], fuel: string) => {
            if (refuels.length < 5) return;

            const prices = refuels.map(entry => entry.cost / entry.consumption);
            prices.sort((a, b) => a - b);

            const min = prices[0];
            const q1 = prices[Math.floor(prices.length * 0.25)];
            const median = prices[Math.floor(prices.length * 0.5)];
            const q3 = prices[Math.floor(prices.length * 0.75)];
            const max = prices[prices.length - 1];

            refinedData.push({
                name: fuel,
                data: [[min, q1, median, q3, max]],
            });
        });


        this.price_chart = {
            title: {
                text: 'Price per Liter',
                left: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                    console.log(params)
                    return `${params.name}<br/>Min: ${params.data[1].toFixed(3)} €<br/>Median: ${params.data[3].toFixed(3)} €<br/>Max: ${params.data[5].toFixed(3)} €`;
                }
            },
            xAxis: {
                type: 'value',
                name: 'Price'
            },
            yAxis: {
                type: 'category',
                name: 'Fuel Type',
                data: refinedData.map((s) => s.name)
            },
            series: [{
                type: 'boxplot',
                data: refinedData.map(s => s.data[0])
            }]
        };
    }

    private filterData(): void {
        this.startDate = this.startDate === '' ? undefined : this.startDate;
        this.endDate = this.endDate === '' ? undefined : this.endDate;

        this.carRefuelMap = new Map();
        this.filteredRefuels = this.refuels.filter(refuel => {
            const isAfterStart = this.startDate ? refuel.date >= this.startDate : true;
            const isBeforeEnd = this.endDate ? refuel.date <= this.endDate : true;

            if (isAfterStart && isBeforeEnd) {
                if (!this.carRefuelMap.has(refuel.car!.name)) {
                    this.carRefuelMap.set(refuel.car!.name, []);
                }
                this.carRefuelMap.get(refuel.car!.name)!.push(refuel);

                if (!this.fuelRefuelMap.has(refuel.fuel_type!.name)) {
                    this.fuelRefuelMap.set(refuel.fuel_type!.name, []);
                }
                this.fuelRefuelMap.get(refuel.fuel_type!.name)!.push(refuel);

                return true;
            }

            return false;
        })
    }
}
