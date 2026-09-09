import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {FuelService} from './fuel.service';
import {FuelSetupState} from './fuel-setup-state.service';
import {ConnectorService} from './connector.service';

describe('car setup hint', () => {
    it('highlights confirmed empty lists and clears after creation, errors and session reset', () => {
        const connector = jasmine.createSpyObj('ConnectorService', ['get', 'add']);
        TestBed.configureTestingModule({providers: [{provide: ConnectorService, useValue: connector}]});
        const service = TestBed.inject(FuelService);
        const state = TestBed.inject(FuelSetupState);
        expect(state.carsEmpty()).toBeNull();
        connector.get.and.returnValue(of([]));
        service.get_cars().subscribe();
        expect(state.carsEmpty()).toBeTrue();
        connector.add.and.returnValue(of({}));
        service.add_car({name: 'Car', usage_start: '2026-01-01'}).subscribe();
        expect(state.carsEmpty()).toBeFalse();
        connector.get.and.returnValue(throwError(() => new Error('Offline')));
        service.get_cars().subscribe({error: () => {}});
        expect(state.carsEmpty()).toBeNull();
        state.carsEmpty.set(true);
        state.reset();
        expect(state.carsEmpty()).toBeNull();
    });
});
