import {Car} from './Car';
import {FuelType} from './FuelType';

export interface Refuel {
    id?: number;
    date: string;
    distance: number;
    consumption: number;
    cost: number;
    fuel_type?: FuelType;
    car?: Car;
}
