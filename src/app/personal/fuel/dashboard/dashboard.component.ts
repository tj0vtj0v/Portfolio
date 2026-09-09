import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';
import {tooltipText} from '../../../shared/charts/tooltip-text';
import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ChartCardComponent} from '../../../shared/charts/chart-card.component';
import {CommonModule, DatePipe} from '@angular/common';
import {Car} from '../../../shared/datatype/Car';
import {Refuel} from '../../../shared/datatype/Refuel';
import {FuelType} from '../../../shared/datatype/FuelType';
import {EChartsCoreOption} from 'echarts';
import {FuelService} from '../../../shared/api/fuel.service';
import {forkJoin} from 'rxjs';
import {DateRangeComponent} from '../../../shared/date-range/date-range.component';
import {PeriodRange, formatLocalDate} from '../../../shared/date-range/period-range';
import {UiPageHeaderComponent} from '../../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-dashboard',
    imports: [UiSkeletonComponent, RouterLink,
        ChartCardComponent,
        CommonModule,
        DateRangeComponent,
        UiPageHeaderComponent,
        UiPanelComponent,
        UiFeedbackComponent
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
    private range?: PeriodRange;

    //visual data
    protected filteredRefuels: Refuel[] = [];
    protected fuelRefuelMap: Map<string, Refuel[]> = new Map();
    protected carRefuelMap: Map<string, Refuel[]> = new Map();

    //visuals
    protected travel_chart: EChartsCoreOption = {};
    protected fuel_chart: EChartsCoreOption = {};
    protected consumption_chart: EChartsCoreOption = {};
    protected fuel_consumption_chart: EChartsCoreOption = {};
    protected travelSummary = {distance: 0, fuel: 0, cost: 0, lastRefuel: ''};
    protected validPeriod = false;
    protected loading = true;
    protected errorMessage = '';

    constructor(
        private fuelService: FuelService
    ) {
    }

    ngOnInit(): void {
        this.loadData();
    }

    protected loadData(): void {
        this.loading = true;
        this.errorMessage = '';
        forkJoin(
            [
                this.fuelService.get_fuel_types(),
                this.fuelService.get_cars(),
                this.fuelService.get_refuels()
            ]
        ).subscribe({
            next: ([fuelTypes, cars, refuels]) => {
                this.fuelTypes = fuelTypes;
                this.cars = cars;
                this.refuels = refuels;
                this.loading = false;
                this.update(this.range);
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Fuel data could not be loaded.';
            }
        });
    }

    update(range: PeriodRange | null | undefined = this.range): void {
        this.range = range ?? undefined;
        this.filterData(range);
        this.validPeriod = !!range;
        this.travelSummary = this.filteredRefuels.reduce((summary, refuel) => ({
            distance: summary.distance + refuel.distance,
            fuel: summary.fuel + refuel.consumption,
            cost: summary.cost + refuel.cost,
            lastRefuel: refuel.date > summary.lastRefuel ? refuel.date : summary.lastRefuel
        }), {distance: 0, fuel: 0, cost: 0, lastRefuel: ''});
        this.build_travel_chart();
        this.build_fuel_chart();
        this.build_consumption_chart();
        this.build_fuel_consumption_chart();
    }

    private build_travel_chart(): void {
        const today = formatLocalDate(new Date());
        const carMap = new Map<string, { date: string, distance: number }[]>();
        this.filteredRefuels.filter(refuel => refuel.date <= today).forEach(refuel => {
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
            refuels = [...refuels].sort((a, b) => a.date.localeCompare(b.date));

            let cumulativeDistance = 0;
            const dateMap = new Map<string, number>();

            if (this.range?.from) {
                dateMap.set(this.range.from, 0);
            }

            refuels.forEach(entry => {
                cumulativeDistance += entry.distance;
                dateMap.set(entry.date, cumulativeDistance);
            });

            if (this.range) dateMap.set(this.range.to < today ? this.range.to : today, cumulativeDistance);

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
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const date = new DatePipe("en-US").transform(new Date(params[0].value[0]), 'dd.MM.yyyy');
                    const content = params.map((param: any) => {
                        const value = parseFloat(param.value[1]).toFixed(0);
                        return `${tooltipText(param.seriesName)}: ${value} km`
                    }).join('<br>')
                    return `${date}<br>${content}`;
                },
            },
            xAxis: {
                type: 'time',
                name: 'Date',
                min: this.range?.from,
                max: this.range?.to,
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
            tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                    const consumption = (params.data[1] / (params.data[0] / 100)).toFixed(1)
                    const price = (params.data[2] / params.data[0]).toFixed(2)
                    return `${tooltipText(params.seriesName)}<br>${tooltipText(params.data[0])} km, ${tooltipText(params.data[1])} L<br>${consumption} L/100km<br>${price} €/km`;
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
            tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                    return `${tooltipText(params.seriesName)}<br/>Min: ${params.data[1].toFixed(1)} L<br/>Median: ${params.data[3].toFixed(1)} L<br/>Max: ${params.data[5].toFixed(1)} L`;
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

    private build_fuel_consumption_chart(): void {
        const refinedData: { name: string, data: [number, number, number, number, number][] }[] = [];
        this.fuelRefuelMap.forEach((refuels: Refuel[], fuel: string) => {
            if (refuels.length < 5) return;

            const validRefuels = refuels.filter(entry => entry.distance > 0);
            if (validRefuels.length < 5) return;
            const consumptions = validRefuels.map(entry => entry.consumption / entry.distance * 100);
            consumptions.sort((a, b) => a - b);

            const min = consumptions[0];
            const q1 = consumptions[Math.floor(consumptions.length * 0.25)];
            const median = consumptions[Math.floor(consumptions.length * 0.5)];
            const q3 = consumptions[Math.floor(consumptions.length * 0.75)];
            const max = consumptions[consumptions.length - 1];

            refinedData.push({
                name: fuel,
                data: [[min, q1, median, q3, max]],
            });
        });


        const unit = 'L/100 km';
        const chart: EChartsCoreOption = {
            tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                    return `${tooltipText(params.name)}<br/>Min: ${params.data[1].toFixed(3)} ${unit}<br/>Median: ${params.data[3].toFixed(3)} ${unit}<br/>Max: ${params.data[5].toFixed(3)} ${unit}`;
                }
            },
            xAxis: {
                type: 'value',
                name: 'Consumption (L/100 km)'
            },
            yAxis: {
                type: 'category',
                name: 'Fuel Type',
                data: refinedData.map((s) => s.name)
            },
            series: [{
                type: 'boxplot',
                colorBy: 'data',
                data: refinedData.map(s => s.data[0])
            }]
        };
        this.fuel_consumption_chart = chart;
    }

    private filterData(range: PeriodRange | null | undefined): void {
        this.carRefuelMap = new Map();
        this.fuelRefuelMap = new Map();
        if (!range) {
            this.filteredRefuels = [];
            return;
        }
        this.filteredRefuels = this.refuels.filter(refuel => {
            const isAfterStart = range.from ? refuel.date >= range.from : true;
            const isBeforeEnd = refuel.date <= range.observedTo;

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
