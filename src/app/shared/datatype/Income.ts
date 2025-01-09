import {Account} from './Account';

export interface Income {
    id?: number;
    date: string;
    reason: string;
    amount: number;
    account: Account;
}
