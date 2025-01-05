import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AccountingService {

    constructor(
        private connectorService: ConnectorService,
    ) {
    }

    public get_accounts(): Observable<any> {
        return this.connectorService.read('accounting/accounts');
    }
}
