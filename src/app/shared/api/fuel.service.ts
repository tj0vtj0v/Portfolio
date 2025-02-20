import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Car} from '../datatype/Car';
import {Observable} from 'rxjs';
import {Refuel} from '../datatype/Refuel';

@Injectable({
    providedIn: 'root'
})
export class FuelService {

    constructor(
        private connectorService: ConnectorService
    ) {
    }

    //car management
    public add_car(car: Car): Observable<any> {
        return this.connectorService.add('fuel/cars', car);
    }

    public get_cars(): Observable<any> {
        return this.connectorService.get('fuel/cars');
    }

    public update_car(car_name: string, car: Car): Observable<any> {
        return this.connectorService.update(`fuel/cars/${car_name}`, car)
    }

    public delete_car(car_name: string): Observable<any> {
        return this.connectorService.delete(`fuel/cars/${car_name}`)
    }

    //fuel type management
    public get_fuel_types(): Observable<any> {
        return this.connectorService.get('fuel/types');
    }

    //refuel management
    public add_refuel(refuel: Refuel): Observable<any> {
        return this.connectorService.add(
            'fuel/refuels',
            {
                date: refuel.date,
                distance: refuel.distance,
                consumption: refuel.consumption,
                cost: refuel.cost,
                fuel_type_id: refuel.fuel_type!.id,
                car_id: refuel.car!.id
            }
        );
    }

    public get_refuels(): Observable<any> {
        return this.connectorService.get('fuel/refuels');
    }

    public update_refuel(refuel: Refuel): Observable<any> {
        return this.connectorService.update(
            `fuel/refuels/${refuel.id}`,
            {
                date: refuel.date,
                distance: refuel.distance,
                consumption: refuel.consumption,
                cost: refuel.cost,
                fuel_type_id: refuel.fuel_type!.id,
                car_id: refuel.car!.id
            }
        );
    }

    public delete_refuel(refuel_id: number): Observable<any> {
        return this.connectorService.delete(`fuel/refuels/${refuel_id}`)
    }

}
