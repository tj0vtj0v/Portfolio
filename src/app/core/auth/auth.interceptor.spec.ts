import {TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, Router} from '@angular/router';
import {authInterceptor} from './auth.interceptor';
import {AuthService} from './auth.service';

describe('Authentication requests', () => {
    let http: HttpClient;
    let backend: HttpTestingController;
    let auth: AuthService;
    let previousToken: string | null;
    let previousType: string | null;

    beforeEach(() => {
        previousToken = localStorage.getItem('token');
        previousType = localStorage.getItem('token-type');
        localStorage.setItem('token', 'old-token');
        localStorage.setItem('token-type', 'Bearer');
        TestBed.configureTestingModule({providers: [
            provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()
        ]});
        http = TestBed.inject(HttpClient);
        backend = TestBed.inject(HttpTestingController);
        auth = TestBed.inject(AuthService);
    });

    afterEach(() => {
        backend.verify();
        for (const [key, value] of [['token', previousToken], ['token-type', previousType]]) {
            if (value === null) localStorage.removeItem(key!);
            else localStorage.setItem(key!, value!);
        }
    });

    it('adds authorization only to API requests', () => {
        http.get('/api/accounts').subscribe();
        expect(backend.expectOne('/api/accounts').request.headers.get('Authorization')).toBe('Bearer old-token');
        http.get('https://example.com/data').subscribe();
        expect(backend.expectOne('https://example.com/data').request.headers.has('Authorization')).toBeFalse();
    });

    it('keeps login form encoding and stores the returned tokens', () => {
        auth.login('a+b', 'p&word').subscribe();
        const request = backend.expectOne(window.location.origin + '/api/login');
        expect(request.request.headers.has('Authorization')).toBeFalse();
        expect(request.request.withCredentials).toBeTrue();
        expect(request.request.body).toBe('username=a%2Bb&password=p%26word');
        request.flush({access_token: 'new-token', token_type: 'Bearer'});
        expect(auth.authorization).toBe('Bearer new-token');
    });

    it('shares a refresh across simultaneous failures and retries with the new token', fakeAsync(() => {
        const values: unknown[] = [];
        http.get('/api/one').subscribe(value => values.push(value));
        http.get('/api/two').subscribe(value => values.push(value));
        for (const url of ['/api/one', '/api/two']) {
            backend.expectOne(url).flush({detail: 'Authorisation token expired'}, {status: 401, statusText: 'Unauthorized'});
        }
        const refresh = backend.expectOne(window.location.origin + '/api/login/refresh');
        expect(refresh.request.withCredentials).toBeTrue();
        refresh.flush({access_token: 'fresh', token_type: 'Bearer'});
        flushMicrotasks();
        for (const url of ['/api/one', '/api/two']) {
            const retry = backend.expectOne(url);
            expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh');
            retry.flush({ok: true});
        }
        expect(values.length).toBe(2);
    }));

    it('propagates a retry failure without refreshing a second time', fakeAsync(() => {
        const failure = jasmine.createSpy('failure');
        http.post('/api/accounts', {name: 'Test'}).subscribe({error: failure});
        backend.expectOne('/api/accounts').flush({detail: 'Authorisation token expired'}, {status: 401, statusText: 'Unauthorized'});
        backend.expectOne(window.location.origin + '/api/login/refresh').flush({access_token: 'fresh', token_type: 'Bearer'});
        flushMicrotasks();
        const retry = backend.expectOne('/api/accounts');
        expect(retry.request.body).toEqual({name: 'Test'});
        retry.flush({detail: 'Authorisation token expired'}, {status: 401, statusText: 'Unauthorized'});
        expect(failure).toHaveBeenCalled();
        backend.expectNone(window.location.origin + '/api/login/refresh');
    }));

    it('ends pending private requests when refresh rejects the session', fakeAsync(() => {
        const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
        const complete = jasmine.createSpy('complete');
        http.get('/api/accounts').subscribe({complete});
        backend.expectOne('/api/accounts').flush({detail: 'Authorisation token expired'}, {status: 401, statusText: 'Unauthorized'});
        backend.expectOne(window.location.origin + '/api/login/refresh').flush({}, {status: 401, statusText: 'Unauthorized'});
        flushMicrotasks();
        expect(complete).toHaveBeenCalled();
        expect(auth.isLoggedIn()).toBeFalse();
        expect(navigate).toHaveBeenCalledWith(['/login'], {queryParams: {returnUrl: '/'}});
    }));

    it('passes ordinary API errors straight to the caller', () => {
        const failure = jasmine.createSpy('failure');
        http.get('/api/accounts').subscribe({error: failure});
        backend.expectOne('/api/accounts').flush({}, {status: 500, statusText: 'Server error'});
        expect(failure).toHaveBeenCalled();
        backend.expectNone(window.location.origin + '/api/login/refresh');
    });

    it('does not let a late refresh restore a logged-out session or retry the request', fakeAsync(() => {
        const complete = jasmine.createSpy('complete');
        http.get('/api/accounts').subscribe({complete});
        backend.expectOne('/api/accounts').flush({detail: 'Authorisation token expired'}, {status: 401, statusText: 'Unauthorized'});
        const refresh = backend.expectOne(window.location.origin + '/api/login/refresh');
        auth.logout();
        expect(refresh.cancelled).toBeTrue();
        flushMicrotasks();
        expect(auth.isLoggedIn()).toBeFalse();
        expect(complete).toHaveBeenCalled();
        backend.expectNone('/api/accounts');
    }));

    it('retains the session after a temporary refresh failure', fakeAsync(() => {
        const failure = jasmine.createSpy('failure');
        const navigate = spyOn(TestBed.inject(Router), 'navigate');
        http.get('/api/accounts').subscribe({error: failure});
        backend.expectOne('/api/accounts').flush({detail: 'Authorisation token expired'}, {status: 401, statusText: 'Unauthorized'});
        backend.expectOne(window.location.origin + '/api/login/refresh').flush({}, {status: 503, statusText: 'Unavailable'});
        flushMicrotasks();
        expect(auth.authorization).toBe('Bearer old-token');
        expect(navigate).not.toHaveBeenCalled();
        expect(failure).toHaveBeenCalled();
    }));

    it('cancels a login request on logout', () => {
        const complete = jasmine.createSpy('complete');
        auth.login('test', 'password').subscribe({complete});
        const login = backend.expectOne(window.location.origin + '/api/login');
        auth.logout();
        expect(login.cancelled).toBeTrue();
        expect(auth.isLoggedIn()).toBeFalse();
        expect(complete).toHaveBeenCalled();
    });

    it('validates saved sessions against the server and shares concurrent checks', fakeAsync(() => {
        let valid = false;
        const first = auth.ensureSession();
        const second = auth.ensureSession();
        expect(first).toBe(second);
        first.then(result => valid = result);
        backend.expectOne(window.location.origin + '/api/users/me').flush({username: 'test'});
        flushMicrotasks();
        expect(valid).toBeTrue();
    }));

    it('invalidates pending refresh work when another tab logs out', fakeAsync(() => {
        auth.refresh().catch(() => undefined);
        const refresh = backend.expectOne(window.location.origin + '/api/login/refresh');
        localStorage.removeItem('token');
        window.dispatchEvent(new StorageEvent('storage', {key: 'token', oldValue: 'old-token', newValue: null, storageArea: localStorage}));
        expect(refresh.cancelled).toBeTrue();
        flushMicrotasks();
        expect(auth.isLoggedIn()).toBeFalse();
    }));

    it('cancels outstanding authenticated reads and writes without emitting data', () => {
        const received = jasmine.createSpy('received');
        http.get('/api/accounts').subscribe(received);
        http.post('/api/expenses', {amount: 12}).subscribe(received);
        const read = backend.expectOne('/api/accounts');
        const write = backend.expectOne('/api/expenses');
        auth.logout();
        expect(read.cancelled).toBeTrue();
        expect(write.cancelled).toBeTrue();
        expect(received).not.toHaveBeenCalled();
    });

    it('leaves unrelated and anonymous requests running', () => {
        http.get('https://example.com/data').subscribe();
        const external = backend.expectOne('https://example.com/data');
        auth.logout();
        http.post('/api/users', {username: 'new-user'}).subscribe();
        const registration = backend.expectOne('/api/users');
        auth.logout();
        expect(external.cancelled).toBeFalse();
        expect(registration.cancelled).toBeFalse();
        external.flush({});
        registration.flush({});
    });

    it('allows new authenticated requests after logging in again', () => {
        auth.logout();
        auth.login('test', 'password').subscribe();
        backend.expectOne(window.location.origin + '/api/login').flush({access_token: 'new-session', token_type: 'Bearer'});
        const received = jasmine.createSpy('received');
        http.get('/api/accounts').subscribe(received);
        const request = backend.expectOne('/api/accounts');
        expect(request.request.headers.get('Authorization')).toBe('Bearer new-session');
        request.flush([]);
        expect(received).toHaveBeenCalledWith([]);
    });
});
