import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map} from 'rxjs';

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

    login(username: string, password: string) {
        const body = new HttpParams().set('username', username).set('password', password);
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        return this.http.post<AuthResponse>(this.loginUrl, body.toString(), {headers}).pipe(
            map((response: AuthResponse) => {
                console.log(response);
                if (response.access_token) {
                    localStorage.setItem('auth-token', response.access_token);
                }
            }),
            catchError((error) => {
                alert(error?.error?.detail);
                throw error
            })
        )
    }

    logout(): void {
        localStorage.removeItem('auth-token');
    }

    is_logged_in(): boolean {
        return localStorage.getItem('auth-token') !== undefined;
    }
}
