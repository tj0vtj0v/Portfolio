import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {UserService} from '../../shared/api/user.service';

import {SettingsComponent} from './settings.component';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let deletion: Subject<void>;
    let userService: {get: jasmine.Spy; delete: jasmine.Spy; logout: jasmine.Spy};

    beforeEach(async () => {
        deletion = new Subject<void>();
        userService = {get: jasmine.createSpy().and.returnValue(of({username: 'Test', email: 'test@example.com', role: {name: 'User'}})),
            delete: jasmine.createSpy().and.returnValue(deletion), logout: jasmine.createSpy()};
        await TestBed.configureTestingModule({
            imports: [SettingsComponent],
            providers: [provideRouter([]), {provide: UserService, useValue: userService}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('waits for deletion to succeed and prevents duplicate submissions', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
        component.delete();
        component.delete();
        expect(userService.delete).toHaveBeenCalledTimes(1);
        expect(userService.logout).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        deletion.next();
        expect(userService.logout).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('preserves the session and displays an error when deletion fails', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
        component.delete();
        deletion.error(new Error('Conflict'));
        fixture.detectChanges();
        expect(userService.logout).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(component.deleting).toBeFalse();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('deletion failed');
    });

    it('does not delete when confirmation is cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        component.delete();
        expect(userService.delete).not.toHaveBeenCalled();
    });
});
