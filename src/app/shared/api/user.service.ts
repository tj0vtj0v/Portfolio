import {AuthService} from '../../core/auth/auth.service';
import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {RegisterUser} from '../datatype/RegisterUser';
import {ModifyUser} from '../datatype/ModifyUser';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private connectorService: ConnectorService,
        private authService: AuthService
    ) {
    }

    login(username: string, password: string): Observable<void> {
        return this.authService.login(username, password)
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    logout(): void {
        this.authService.logout();
    }

    register(user: RegisterUser): Observable<any> {
        return this.connectorService.add('users', user);
    }

    get(): Observable<any> {
        return this.connectorService.get('users/me');
    }

    update(user: ModifyUser): Observable<any> {
        return this.connectorService.update('users/me', user);
    }

    delete(): Observable<any> {
        return this.connectorService.delete('users/me');
    }
}
