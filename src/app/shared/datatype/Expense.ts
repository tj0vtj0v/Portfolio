import {Account} from './Account';
import {Category} from './Category';

export interface Expense {
    id?: number,
    date: string,
    reason: string,
    amount: number,
    account?: Account,
    category?: Category
}
