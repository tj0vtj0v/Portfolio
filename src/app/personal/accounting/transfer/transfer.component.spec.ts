import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TransferComponent} from './transfer.component';
import {AccountingService} from '../../../shared/api/accounting.service';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {of} from 'rxjs';

describe('TransferComponent', () => {
    let component: TransferComponent;
    let fixture: ComponentFixture<TransferComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TransferComponent],
            providers: [provideRouter([]),
                {provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: convertToParamMap({mode: 'add'})}}},
                {provide: AccountingService, useValue: {get_transfers: () => of([]), get_accounts: () => of([{id: 1, name: 'Main', balance: 0}, {id: 2, name: 'Savings', balance: 0}])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TransferComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('maps transaction add mode to an explicit source/target transfer editor', () => {
        expect((component as any).addingTransfer).toBeTrue();
        expect(fixture.nativeElement.textContent).toContain('Transfer between accounts');
        expect(fixture.nativeElement.querySelector('#add_source')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('#add_target')).toBeTruthy();
    });

    it('rejects a transfer whose source and target are the same account', () => {
        const account = (component as any).accounts[0];
        (component as any).transfer = {date: '2026-09-08', amount: 10, source: account, target: account};
        expect((component as any).check()).toBeFalse();
        expect((component as any).statusMessage).toContain('different');
    });
});
