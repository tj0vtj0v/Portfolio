import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, EMPTY, firstValueFrom, from, map, Observable, switchMap, take} from 'rxjs';
import {AuthResponse} from '../datatype/AuthResponse';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class ConnectorService {
    private url = `${window.location.origin}/api/`;
    private refreshPromise?: Promise<void>;

    constructor(
        private http: HttpClient,
        private cookieService: CookieService,
        private router: Router
    ) {
    }

    login(username: string, password: string) {
        const body = new HttpParams().set('username', username).set('password', password);
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.put<AuthResponse>(
            `${this.url}login`, body.toString(),
            {headers, withCredentials: true}
        ).pipe(
            take(1),
            map((response: AuthResponse) => {
                if (response.access_token) {
                    localStorage.setItem('token', response.access_token);
                    localStorage.setItem('token-type', response.token_type);
                } else {
                    throw ('Unexpected login response');
                }
            })
        );
    }

    add(suffix: string, body: any, recursive: boolean = false): Observable<any> {
        return this.http.post(
            `${this.url}${suffix}`, body,
            {headers: this.buildSendHeader()}
        ).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        return from(this.refresh_handler()).pipe(
                            switchMap(() => this.add(suffix, body, true)),
                            catchError(() => {
                                return EMPTY;
                            })
                        )
                    }
                }
                throw error;
            })
        );
    }

    get(suffix: string, recursive: boolean = false): Observable<any> {
        return this.http.get(
            `${this.url}${suffix}`,
            {headers: this.buildRequestHeader()}
        ).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        return from(this.refresh_handler()).pipe(
                            switchMap(() => this.get(suffix, true)),
                            catchError(() => {
                                return EMPTY;
                            })
                        )
                    }
                }
                throw error;
            })
        );
    }

    update(suffix: string, body: any, recursive: boolean = false): Observable<any> {
        return this.http.patch(
            `${this.url}${suffix}`, body,
            {headers: this.buildSendHeader()}
        ).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        return from(this.refresh_handler()).pipe(
                            switchMap(() => this.update(suffix, body, true)),
                            catchError(() => {
                                return EMPTY;
                            })
                        )
                    }
                }
                throw error;
            })
        );
    }

    delete(suffix: string, recursive: boolean = false): Observable<any> {
        return this.http.delete(
            `${this.url}${suffix}`,
            {headers: this.buildDeleteHeader()}
        ).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        return from(this.refresh_handler()).pipe(
                            switchMap(() => this.delete(suffix, true)),
                            catchError(() => {
                                return EMPTY;
                            })
                        )
                    }
                }
                throw error;
            })
        );
    }

    private refresh(): Promise<void> {
        return firstValueFrom(
            this.http.put<AuthResponse>(
                `${this.url}login/refresh`, {},
                {headers: this.buildSendHeader(), withCredentials: true}
            ).pipe(
                take(1),
                map((response: AuthResponse) => {
                    if (response.access_token) {
                        localStorage.setItem('token', response.access_token);
                        localStorage.setItem('token-type', response.token_type);
                    } else {
                        throw ('Unexpected refresh response');
                    }
                })
            )
        )
    }

    private refresh_handler() {
        if (this.refreshPromise !== undefined) {
            return this.refreshPromise!
        }

        this.refreshPromise = this.refresh()
            .then(() => {
                this.refreshPromise = undefined;
            })
            .catch((error) => {
                this.refreshPromise = undefined;
                this.logout()
                throw error;
            })

        return this.refreshPromise
    }

    private logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('token-type');
        this.cookieService.delete('refresh-token');
        this.router.navigate(['/login']).then();
    }

    private buildAuthHeader() {
        if (localStorage.getItem('token') !== null) {
            return new HttpHeaders().set('Authorization', `${localStorage.getItem('token-type')} ${localStorage.getItem('token')}`);
        } else {
            return new HttpHeaders()
        }
    }

    private buildDeleteHeader() {
        return this.buildAuthHeader().set('accept', '*/*')
    }

    private buildRequestHeader() {
        return this.buildAuthHeader().set('accept', 'application/json')
    }

    private buildSendHeader() {
        return this.buildRequestHeader().set('Content-Type', 'application/json');
    }
}
