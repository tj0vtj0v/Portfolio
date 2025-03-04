import {BankAccount} from './BankAccount';

export interface History {
    id?: number
    account?: BankAccount
    date: string
    amount: number
}
