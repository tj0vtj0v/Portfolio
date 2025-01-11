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
        private connectorService: ConnectorService
    ) {
    }

    login(username: string, password: string): Observable<void> {
        return this.connectorService.login(username, password)
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('token-type');
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
