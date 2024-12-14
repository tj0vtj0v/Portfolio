import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {AuthResponse} from '../datatype/AuthResponse';
import {ModifyRestrictedUser} from '../datatype/ModifyRestrictedUser';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

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
}
