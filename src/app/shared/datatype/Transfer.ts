import {Account} from './Account';

export interface Transfer {
    id?: number;
    date: string;
    amount: number;
    source: Account;
    target: Account;
}
