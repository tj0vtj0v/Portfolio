import {Injectable, inject} from '@angular/core';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {AccountingService} from '../../../shared/api/accounting.service';
import {Account} from '../../../shared/datatype/Account';
import {BalanceHistory} from '../../../shared/datatype/BalanceHistory';
import {AccountingDashboardData} from './dashboard-data';

@Injectable({providedIn: 'root'})
export class DashboardDataService {
    private readonly accounting = inject(AccountingService);

    load(): Observable<AccountingDashboardData> {
        return forkJoin({
            accounts: this.accounting.get_accounts() as Observable<Account[]>,
            expenses: this.accounting.get_expenses(),
            incomes: this.accounting.get_incomes(),
            transfers: this.accounting.get_transfers()
        }).pipe(switchMap(data => {
            const requests = data.accounts.map(account =>
                this.accounting.get_account_history(account.name) as Observable<BalanceHistory[]>);
            // forkJoin([]) completes without a value, so explicitly handle a new account.
            return (requests.length ? forkJoin(requests) : of([] as BalanceHistory[][])).pipe(map(histories => ({
                ...data,
                histories: new Map(data.accounts.map((account, index) => [account.name, histories[index]]))
            })));
        }));
    }
}
