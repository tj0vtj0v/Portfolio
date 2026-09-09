import {TestBed} from '@angular/core/testing';

import {ConnectorService} from './connector.service';
import {provideHttpClient} from '@angular/common/http';

describe('ConnectorService', () => {
    let service: ConnectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: [provideHttpClient()]});
        service = TestBed.inject(ConnectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
