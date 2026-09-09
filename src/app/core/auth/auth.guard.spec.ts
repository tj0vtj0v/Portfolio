import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {AuthService} from './auth.service';
import {authGuard} from './auth.guard';
import {safeReturnUrl} from './return-url';

@Component({template: 'Private content'})
class PrivatePage {}
@Component({template: 'Login'})
class LoginPage {}

describe('Private route guard', () => {
    let ensureSession: jasmine.Spy;
    beforeEach(() => {
        ensureSession = jasmine.createSpy().and.resolveTo(true);
        TestBed.configureTestingModule({providers: [
            {provide: AuthService, useValue: {ensureSession}},
            provideRouter([
                {path: 'accounting/expenses', component: PrivatePage, canActivate: [authGuard]},
                {path: 'login', component: LoginPage}
            ])
        ]});
    });

    it('allows a server-validated session to open a deep link', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/accounting/expenses', PrivatePage);
        expect(ensureSession).toHaveBeenCalled();
    });

    it('waits for validation before displaying private content', async () => {
        let resolve!: (value: boolean) => void;
        ensureSession.and.returnValue(new Promise<boolean>(done => resolve = done));
        const harness = await RouterTestingHarness.create();
        const navigation = harness.navigateByUrl('/accounting/expenses');
        expect(harness.routeNativeElement?.textContent ?? '').not.toContain('Private content');
        resolve(true);
        await navigation;
        expect(harness.routeNativeElement!.textContent).toBe('Private content');
    });

    it('redirects an anonymous visitor with the internal destination preserved', async () => {
        ensureSession.and.resolveTo(false);
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/accounting/expenses?month=1', LoginPage);
        const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
        expect(url.queryParams['returnUrl']).toBe('/accounting/expenses?month=1');
    });

    it('provides a retry route when validation cannot reach the server', async () => {
        ensureSession.and.rejectWith(new Error('Offline'));
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/accounting/expenses', LoginPage);
        const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
        expect(url.queryParams['sessionCheck']).toBe('failed');
        expect(url.queryParams['returnUrl']).toBe('/accounting/expenses');
    });

    it('rejects external, malformed, and unrelated return URLs', () => {
        for (const url of ['https://evil.example', '//evil.example', '/\\evil.example', '/accounting\n', '/login', '/accounting-other', null]) {
            expect(safeReturnUrl(url)).toBeUndefined();
        }
        expect(safeReturnUrl('/accounting/expenses?month=1#details')).toBe('/accounting/expenses?month=1#details');
    });
});
