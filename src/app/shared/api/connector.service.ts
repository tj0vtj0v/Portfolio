import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, take, throwError} from 'rxjs';
import {AuthResponse} from '../datatype/AuthResponse';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ConnectorService {
    private url = 'http://80.209.200.73:4053/' // TODO

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
    }

    login(username: string, password: string) {
        const body = new HttpParams().set('username', username).set('password', password);
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post<AuthResponse>(`${this.url}login`, body.toString(), {headers}).pipe(
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

    refresh() {
        return this.http.post<AuthResponse>(`${this.url}refresh`, null).pipe(
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
        return this.http.post(`${this.url}${suffix}`, body, {headers: this.buildSendHeader()}).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        this.refresh()
                        return this.add(suffix, body, true)
                    } else {
                        this.logout()
                    }
                }
                return throwError(error);
            })
        );
    }

    get(suffix: string, recursive: boolean = false): Observable<any> {
        return this.http.get(`${this.url}${suffix}`, {headers: this.buildRequestHeader()}).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        this.refresh()
                        return this.get(suffix, true)
                    } else {
                        this.logout()
                    }
                }
                return throwError(error);
            })
        );
    }

    update(suffix: string, body: any, recursive: boolean = false): Observable<any> {
        return this.http.patch(`${this.url}${suffix}`, body, {headers: this.buildSendHeader()}).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        this.refresh()
                        this.update(suffix, body, true)
                    } else {
                        this.logout()
                    }
                }
                return throwError(error);
            })
        );
    }

    delete(suffix: string, recursive: boolean = false): Observable<any> {
        return this.http.delete(`${this.url}${suffix}`, {headers: this.buildDeleteHeader()}).pipe(
            catchError(error => {
                if (error.error?.detail === 'Authorisation token expired') {
                    if (!recursive) {
                        this.refresh()
                        this.delete(suffix, true)
                    } else {
                        this.logout()
                    }
                }
                return throwError(error);
            })
        );
    }

    private logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('token-type');
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
