import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, of, take} from 'rxjs';

interface AuthResponse {
    access_token: string;
    token_type: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private loginUrl = 'http://80.209.200.73:4053/login';


    constructor(private http: HttpClient) {
    }

    login(username: string, password: string): Observable<string> {
        const body = new HttpParams().set('username', username).set('password', password);
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post<AuthResponse>(this.loginUrl, body.toString(), {headers}).pipe(
            take(1),
            map((response: AuthResponse) => {
                if (response.access_token) {
                    localStorage.setItem('auth-token', response.access_token);
                    return 'Login successful';
                }
                throw ('Unexpected login response');
            }),
            catchError((error) => {
                return of(error?.statusText
                    ? `Login failed: ${error.statusText}`
                    : 'Login failed');
            })
        )
    }

    logout(): void {
        localStorage.removeItem('auth-token');
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('auth-token') !== null;
    }
}
