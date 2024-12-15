import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {AuthResponse} from '../datatype/AuthResponse';
import {ModifyRestrictedUser} from '../datatype/ModifyRestrictedUser';
import {MinimalModifyUser} from '../datatype/MinimalModifyUser';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private connectorService: ConnectorService
    ) {
    }

    login(username: string, password: string): Observable<AuthResponse> {
        return this.connectorService.login(username, password)
    }

    register(user: ModifyRestrictedUser): Observable<any> {
        return this.connectorService.create('users', user);
    }

    get(): Observable<any> {
        return this.connectorService.read('users/me');
    }

    update(user: MinimalModifyUser): Observable<any> {
        return this.connectorService.update('users/me', user);
    }

    delete(): Observable<any> {
        return this.connectorService.delete('users/me');
    }
}
