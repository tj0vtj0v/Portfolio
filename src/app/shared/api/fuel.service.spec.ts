import {TestBed} from '@angular/core/testing';

import {FuelService} from './fuel.service';
import {provideHttpClient} from '@angular/common/http';

describe('FuelService', () => {
    let service: FuelService;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: [provideHttpClient()]});
        service = TestBed.inject(FuelService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
