import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {Account} from '../datatype/Account';

@Injectable({
    providedIn: 'root'
})
export class AccountingService {

    constructor(
        private connectorService: ConnectorService,
    ) {
    }

    public add_account(account: Account): Observable<any> {
        return this.connectorService.create('accounting/accounts', account);
    }

    public get_accounts(): Observable<any> {
        return this.connectorService.read('accounting/accounts');
    }

    public update_account(account_name: string, account: Account): Observable<any> {
        return this.connectorService.update(`accounting/accounts/${account_name}`, account);
    }

    public delete_account(account_name: string): Observable<any> {
        return this.connectorService.delete(`accounting/accounts/${account_name}`);
    }
}
