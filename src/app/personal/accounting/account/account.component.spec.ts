import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountComponent} from './account.component';
import {AccountingService} from '../../../shared/api/accounting.service';
import {of} from 'rxjs';

describe('AccountComponent', () => {
    let component: AccountComponent;
    let fixture: ComponentFixture<AccountComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccountComponent],
            providers: [{provide: AccountingService, useValue: {get_accounts: () => of([])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
