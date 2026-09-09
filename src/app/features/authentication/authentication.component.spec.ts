import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {UserService} from '../../shared/api/user.service';

import {AuthenticationComponent} from './authentication.component';

describe('AuthenticationComponent', () => {
    let component: AuthenticationComponent;
    let fixture: ComponentFixture<AuthenticationComponent>;
    let query: Record<string, string>;
    let userService: {isLoggedIn: jasmine.Spy; login: jasmine.Spy};

    beforeEach(async () => {
        query = {};
        userService = {isLoggedIn: jasmine.createSpy().and.returnValue(false), login: jasmine.createSpy().and.returnValue(of(undefined))};
        await TestBed.configureTestingModule({
            imports: [AuthenticationComponent],
            providers: [provideRouter([]), {provide: UserService, useValue: userService},
                {provide: ActivatedRoute, useValue: {snapshot: {get queryParamMap() { return convertToParamMap(query); }}}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AuthenticationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    function login(): void {
        (component as any).username = 'test';
        (component as any).password = 'password';
        component.onLogin();
    }

    it('opens Accounting when there is no return destination', () => {
        const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
        login();
        expect(navigate).toHaveBeenCalledWith('/accounting');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Login successful');
    });

    it('returns to a protected deep link after a successful login', () => {
        query['returnUrl'] = '/accounting/expenses';
        component.ngOnInit();
        const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
        login();
        expect(navigate).toHaveBeenCalledWith('/accounting/expenses');
    });

    it('does not follow an external return URL', () => {
        query['returnUrl'] = '//evil.example';
        component.ngOnInit();
        const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
        login();
        expect(navigate).toHaveBeenCalledWith('/accounting');
    });

    it('sends only one login while pending and clears the password immediately on success', () => {
        spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
        const response = new Subject<void>();
        userService.login.and.returnValue(response);
        login();
        login();
        fixture.detectChanges();
        expect(userService.login).toHaveBeenCalledTimes(1);
        expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeTrue();
        response.next();
        expect((component as any).password).toBe('');
        response.complete();
        expect(component.submission.pending).toBeFalse();
    });

    it('keeps credentials available for retry after a temporary login failure', () => {
        const response = new Subject<void>();
        userService.login.and.returnValue(response);
        login();
        response.error({status: 503});
        fixture.detectChanges();
        expect((component as any).username).toBe('test');
        expect((component as any).password).toBe('password');
        expect(component.submission.pending).toBeFalse();
        expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeFalse();
        expect(fixture.nativeElement.textContent).toContain('unable to reach the backend');
    });

    it('does not send a request for missing credentials', () => {
        component.onLogin();
        expect(userService.login).not.toHaveBeenCalled();
        expect(component.submission.pending).toBeFalse();
    });
});
