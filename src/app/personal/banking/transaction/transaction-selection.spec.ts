import {TestBed} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {TransactionComponent} from './transaction.component';

describe('banking detail selection', () => {
    it('cancels older selections and closes outstanding requests', () => {
        const a = new Subject<any>();
        const b = new Subject<any>();
        const service: any = {get_transaction: (id: number) => id === 1 ? a : b};
        const component: any = TestBed.runInInjectionContext(() => new TransactionComponent(service));
        component.openTransaction(1);
        component.openTransaction(2);
        expect(a.observed).toBeFalse();
        b.next({id: 2});
        a.next({id: 1});
        expect(component.transaction.id).toBe(2);
        component.reset();
        b.next({id: 2});
        expect(component.transaction).toBeUndefined();
        component.openTransaction(1);
        TestBed.resetTestingModule();
        expect(a.observed).toBeFalse();
    });
    it('retries the selected detail after a failed response', () => {
        const response = new Subject<any>();
        const read = jasmine.createSpy().and.returnValue(response);
        const component: any = TestBed.runInInjectionContext(() => new TransactionComponent({get_transaction: read} as any));
        component.openTransaction(7);
        response.error(new Error('offline'));
        expect(component.detailLoading).toBeFalse();
        const retry = new Subject<any>();
        read.and.returnValue(retry);
        component.retryDetail();
        retry.next({id: 7});
        expect(component.transaction.id).toBe(7);
        expect(component.errorMessage).toBe('');
    });
});
