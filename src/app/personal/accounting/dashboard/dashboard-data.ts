import {Account} from '../../../shared/datatype/Account';
import {BalanceHistory} from '../../../shared/datatype/BalanceHistory';
import {Expense} from '../../../shared/datatype/Expense';
import {Income} from '../../../shared/datatype/Income';
import {Transfer} from '../../../shared/datatype/Transfer';

export interface AccountingDashboardData {
    accounts: Account[];
    expenses: Expense[];
    incomes: Income[];
    transfers: Transfer[];
    histories: Map<string, BalanceHistory[]>;
}

export interface AccountingDashboardView {
    accounts: Account[];
    startDate?: string;
    endDate?: string;
    minMovementDate?: string;
    filteredHistories: Map<string, BalanceHistory[]>;
    filteredExpenses: Expense[];
    filteredIncomes: Income[];
    filteredTransfers: Transfer[];
    categoryExpenseMap: Map<string, number>;
    accountIncomeMap: Map<string, number>;
}

export type AccountingActivityType = 'expense' | 'income' | 'transfer';

export interface AccountingActivity {
    type: AccountingActivityType;
    id: number;
    date: string;
    description: string;
    context: string;
    amount: number;
}

export function filterAccountingData(data: AccountingDashboardData, startDate?: string, endDate?: string): AccountingDashboardView {
    startDate = startDate || undefined;
    endDate = endDate || undefined;
    const inRange = (date: string) => (!startDate || date >= startDate) && (!endDate || date <= endDate);
    const filteredHistories = new Map<string, BalanceHistory[]>();
    let minMovementDate: string | undefined;

    data.histories.forEach((history, name) => {
        const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
        const filtered = sorted.filter(entry => inRange(entry.date));
        // Carry the last balance before the range into the first displayed day.
        const earlier = startDate ? sorted.filter(entry => entry.date < startDate!).at(-1) : undefined;
        filteredHistories.set(name, earlier ? [earlier, ...filtered] : filtered);
        if (filtered.length && (!minMovementDate || filtered[0].date < minMovementDate)) {
            minMovementDate = filtered[0].date;
        }
    });

    const filteredExpenses = data.expenses.filter(entry => inRange(entry.date));
    const filteredIncomes = data.incomes.filter(entry => inRange(entry.date));
    const filteredTransfers = data.transfers.filter(entry => inRange(entry.date));
    const categoryExpenseMap = new Map<string, number>();
    filteredExpenses.forEach(expense => {
        const name = expense.category!.name;
        categoryExpenseMap.set(name, (categoryExpenseMap.get(name) ?? 0) + expense.amount);
    });
    const accountIncomeMap = new Map<string, number>();
    filteredIncomes.forEach(income => {
        const name = income.account!.name;
        accountIncomeMap.set(name, (accountIncomeMap.get(name) ?? 0) + income.amount);
    });

    return {
        accounts: data.accounts, startDate, endDate, minMovementDate,
        filteredHistories, filteredExpenses, filteredIncomes, filteredTransfers,
        categoryExpenseMap, accountIncomeMap
    };
}

export function accountingActivity(view: AccountingDashboardView): AccountingActivity[] {
    const expenses = view.filteredExpenses.filter(entry => Number.isInteger(entry.id)).map(entry => ({
        type: 'expense' as const, id: entry.id!, date: entry.date, description: entry.reason,
        context: [entry.account?.name, entry.category?.name].filter(Boolean).join(' / '), amount: -entry.amount
    }));
    const incomes = view.filteredIncomes.filter(entry => Number.isInteger(entry.id)).map(entry => ({
        type: 'income' as const, id: entry.id!, date: entry.date, description: entry.reason,
        context: entry.account?.name ?? '', amount: entry.amount
    }));
    const transfers = view.filteredTransfers.filter(entry => Number.isInteger(entry.id)).map(entry => ({
        type: 'transfer' as const, id: entry.id!, date: entry.date, description: 'Transfer',
        context: `${entry.source?.name ?? 'Unknown account'} \u2192 ${entry.target?.name ?? 'Unknown account'}`,
        amount: entry.amount
    }));
    const typeOrder: Record<AccountingActivityType, number> = {expense: 0, income: 1, transfer: 2};
    return [...expenses, ...incomes, ...transfers].sort((a, b) =>
        b.date.localeCompare(a.date) || typeOrder[a.type] - typeOrder[b.type] || a.id - b.id);
}
