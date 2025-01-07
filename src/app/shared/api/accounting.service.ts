import {Injectable} from '@angular/core';
import {ConnectorService} from './connector.service';
import {Observable} from 'rxjs';
import {Account} from '../datatype/Account';
import {Transfer} from '../datatype/Transfer';
import {Category} from '../datatype/Category';

@Injectable({
    providedIn: 'root'
})
export class AccountingService {

    constructor(
        private connectorService: ConnectorService,
    ) {
    }

    // account management
    public add_account(account: Account): Observable<any> {
        return this.connectorService.add('accounting/accounts', account);
    }

    public get_accounts(): Observable<any> {
        return this.connectorService.get('accounting/accounts');
    }

    public get_account(name: string): Observable<any> {
        return this.connectorService.get(`accounting/accounts/${name}`);
    }

    public update_account(account_name: string, account: Account): Observable<any> {
        return this.connectorService.update(`accounting/accounts/${account_name}`, account);
    }

    public delete_account(account_name: string): Observable<any> {
        return this.connectorService.delete(`accounting/accounts/${account_name}`);
    }

    // transfer management
    public add_transfer(transfer: Transfer): Observable<any> {
        return this.connectorService.add(
            'accounting/transfers',
            {
                date: transfer.date,
                amount: transfer.amount,
                source_id: transfer.source!.id,
                target_id: transfer.target!.id,
            }
        );
    }

    public get_transfers(): Observable<any> {
        return this.connectorService.get('accounting/transfers');
    }

    public update_transfer(id: number, transfer: Transfer): Observable<any> {
        return this.connectorService.update(
            `accounting/transfers/${id}`,
            {
                date: transfer.date,
                amount: transfer.amount,
                source_id: transfer.source!.id,
                target_id: transfer.target!.id,
            }
        );
    }

    public delete_transfer(id: number): Observable<any> {
        return this.connectorService.delete(`accounting/transfers/${id}`);
    }

    // category management
    public add_category(category: Category): Observable<any> {
        return this.connectorService.add('accounting/categories', category);
    }

    public get_categories(): Observable<any> {
        return this.connectorService.get('accounting/categories');
    }

    public get_category(name: string): Observable<any> {
        return this.connectorService.get(`accounting/categories${name}`);
    }

    public update_category(name: string, category: Category): Observable<any> {
        return this.connectorService.update(`accounting/categories/${name}`, category);
    }

    public delete_category(name: string): Observable<any> {
        return this.connectorService.delete(`accounting/categories/${name}`);
    }
}
