import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {AccountingService} from './accounting.service';
import {AccountingSetupState} from './accounting-setup-state.service';
import {ConnectorService} from './connector.service';

describe('accounting setup hints', () => {
    it('distinguishes empty, populated and failed reads and clears hints after creation', () => {
        const connector = jasmine.createSpyObj('ConnectorService', ['get', 'add']);
        TestBed.configureTestingModule({providers: [{provide: ConnectorService, useValue: connector}]});
        const service = TestBed.inject(AccountingService);
        const state = TestBed.inject(AccountingSetupState);
        expect(state.accountsEmpty()).toBeNull();
        expect(state.categoriesEmpty()).toBeNull();
        connector.get.and.returnValue(of([]));
        service.get_accounts().subscribe();
        service.get_categories().subscribe();
        expect(state.accountsEmpty()).toBeTrue();
        expect(state.categoriesEmpty()).toBeTrue();
        connector.add.and.returnValue(of({}));
        service.add_account({name: 'Main', balance: 0}).subscribe();
        expect(state.accountsEmpty()).toBeFalse();
        expect(state.categoriesEmpty()).toBeTrue();
        service.add_category({name: 'Food'}).subscribe();
        expect(state.categoriesEmpty()).toBeFalse();
        connector.get.and.returnValue(throwError(() => new Error('Offline')));
        service.get_accounts().subscribe({error: () => {}});
        expect(state.accountsEmpty()).toBeNull();
        state.reset();
        expect(state.categoriesEmpty()).toBeNull();
    });
});
