import {DestroyRef, Injectable, inject} from '@angular/core';
import {HttpClient, HttpContext, HttpContextToken, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {firstValueFrom, map, Observable, fromEvent, Subject, takeUntil} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthResponse} from '../../shared/datatype/AuthResponse';
import {browserStorage, readStoredValue, removeStoredValue} from './browser-storage';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
// Preserve the deployed backend URL contract from main.
export const API_BASE_URL = `${window.location.origin}/api/`;

@Injectable({providedIn: 'root'})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private refreshPromise?: Promise<void>;
    private validationPromise?: Promise<boolean>;
    private sessionGeneration = 0;
    private readonly sessionEnded = new Subject<void>();
    readonly sessionEnded$ = this.sessionEnded.asObservable();

    constructor() {
        fromEvent<StorageEvent>(window, 'storage').pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => {
            if (event.storageArea === browserStorage() && (event.key === null || (event.key === 'token' && event.newValue === null))) {
                this.sessionGeneration++;
                this.refreshPromise = undefined;
                this.validationPromise = undefined;
                this.sessionEnded.next();
                if (/^\/(account|settings|accounting|banking|fuel|proximity)(\/|\?|$)/.test(this.router.url)) {
                    void this.router.navigate(['/home']);
                }
            }
        });
    }

    /** Validate private navigation with the server, sharing concurrent guard checks. */
    ensureSession(): Promise<boolean> {
        if (!this.isLoggedIn()) return Promise.resolve(false);
        if (!this.validationPromise) {
            const generation = this.sessionGeneration;
            const validation = firstValueFrom(this.http.get(`${API_BASE_URL}users/me`, {headers: {accept: 'application/json'}})).then(() =>
                generation === this.sessionGeneration && this.isLoggedIn()
            ).catch(error => {
                if (generation !== this.sessionGeneration) return false;
                if (error.status === 401 || error.status === 418) {
                    this.logout();
                    return false;
                }
                throw error;
            }).finally(() => {
                if (this.validationPromise === validation) this.validationPromise = undefined;
            });
            this.validationPromise = validation;
        }
        return this.validationPromise;
    }

    get authorization(): string | null {
        const token = readStoredValue('token');
        return token === null ? null : `${readStoredValue('token-type')} ${token}`;
    }

    isLoggedIn(): boolean {
        return readStoredValue('token') !== null;
    }

    login(username: string, password: string): Observable<void> {
        const generation = ++this.sessionGeneration;
        this.refreshPromise = undefined;
        this.validationPromise = undefined;
        const body = new HttpParams().set('username', username).set('password', password);
        return this.http.put<AuthResponse>(`${API_BASE_URL}login`, body.toString(), {
            headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'}),
            context: new HttpContext().set(SKIP_AUTH, true),
            withCredentials: true
        }).pipe(takeUntil(this.sessionEnded$), map(response => {
            if (generation !== this.sessionGeneration) throw new Error('Session changed during login');
            this.storeTokens(response);
        }));
    }

    logout(): void {
        this.sessionGeneration++;
        this.refreshPromise = undefined;
        this.validationPromise = undefined;
        removeStoredValue('token');
        removeStoredValue('token-type');
        this.sessionEnded.next();
    }

    refresh(): Promise<void> {
        if (!this.refreshPromise) {
            const generation = this.sessionGeneration;
            let headers = new HttpHeaders({'Content-Type': 'application/json', accept: 'application/json'});
            if (this.authorization) headers = headers.set('Authorization', this.authorization);
            const refresh = firstValueFrom(this.http.put<AuthResponse>(`${API_BASE_URL}login/refresh`, {}, {
                headers,
                context: new HttpContext().set(SKIP_AUTH, true),
                withCredentials: true
            }).pipe(takeUntil(this.sessionEnded$))).then(response => {
                if (generation !== this.sessionGeneration) throw new Error('Session changed during refresh');
                this.storeTokens(response);
            }).catch(error => {
                // A timeout or server outage must not destroy a potentially valid session.
                if (generation === this.sessionGeneration && (error.status === 401 || error.status === 418)) {
                    const returnUrl = this.router.url;
                    this.logout();
                    void this.router.navigate(['/login'], {queryParams: {returnUrl}});
                }
                throw error;
            }).finally(() => {
                if (this.refreshPromise === refresh) this.refreshPromise = undefined;
            });
            this.refreshPromise = refresh;
        }
        return this.refreshPromise;
    }

    private storeTokens(response: AuthResponse): void {
        if (!response.access_token) throw new Error('Unexpected authentication response');
        try {
            const storage = browserStorage();
            if (!storage) throw new Error('Browser storage is unavailable');
            storage.setItem('token-type', response.token_type);
            storage.setItem('token', response.access_token);
        } catch {
            this.logout();
            throw new Error('Unable to store this session in browser storage');
        }
    }
}
