import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, take} from 'rxjs';

import {AuthResponse} from './datatype/AuthResponse';
import {UserService} from './api/user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    constructor(
        private userService: UserService,
    ) {
    }

    login(username: string, password: string): Observable<string> {
        return this.userService.login(username, password).pipe(
            take(1),
            map((response: AuthResponse) => {
                if (response.access_token) {
                    localStorage.setItem('token', response.access_token);
                    localStorage.setItem('token-type', response.token_type);
                    return 'Login successful';
                }
                throw ('Unexpected login response');
            }),
            catchError((error) => {
                return of(error?.error?.detail
                    ? `Login failed: ${error.error.detail}`
                    : 'Login failed');
            })
        )
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('token-type');
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }
}
