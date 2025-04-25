import {BankAccount} from './BankAccount';

export interface Transaction {
    amount: number
    currencycode: string
    date: string
    peer: string
    reasonforpayment: string
    id: number
    account: BankAccount
    bdate: string
    vdate: string
    postingtext: string
    customerreference: string
    mandatereference: string
    peeraccount: string
    peerbic: string
    peerid: string
}
