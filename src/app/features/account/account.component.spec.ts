import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountComponent} from './account.component';
import {provideRouter} from '@angular/router';
import {UserService} from '../../shared/api/user.service';
import {of, Subject} from 'rxjs';

describe('AccountComponent', () => {
    let component: AccountComponent;
    let fixture: ComponentFixture<AccountComponent>;
    let update: Subject<void>;
    let userService: {get: jasmine.Spy; update: jasmine.Spy};

    beforeEach(async () => {
        update = new Subject<void>();
        userService = {
            get: jasmine.createSpy().and.returnValue(of({first_name: 'Tjorven', last_name: 'Burdorf', email: 'tjorven@burdorf.dev'})),
            update: jasmine.createSpy().and.returnValue(update)
        };
        await TestBed.configureTestingModule({
            imports: [AccountComponent],
            providers: [provideRouter([]), {provide: UserService, useValue: userService}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('keeps edited values and enables retry when saving fails', () => {
        component.user.first_name = 'Edited';
        component.onUpdate();
        update.error({status: 503});
        fixture.detectChanges();
        expect(component.user.first_name).toBe('Edited');
        expect(component.submission.pending).toBeFalse();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Edit failed');
    });
});
