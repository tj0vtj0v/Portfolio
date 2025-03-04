import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {History} from '../datatype/History';

@Injectable({
    providedIn: 'root'
})
export class BankingService {

    constructor(
        private connectorService: ConnectorService
    ) {
    }

    // account management
    public get_accounts(): Observable<any> {
        return this.connectorService.get('banking/accounts/me')
    }

    // history management
    public get_history(): Observable<any>{
        return this.connectorService.get('banking/history/me')
    }

    // transaction management
    public get_transactions(): Observable<any>{
        return this.connectorService.get('banking/transactions/me')
    }
    public get_transaction(id: number): Observable<any>{
        return this.connectorService.get(`banking/transactions/me/${id}`)
    }
}
