import {bankingHistory} from './banking-history';
import {History} from '../../../shared/datatype/History';

describe('banking observed history', () => {
    const rows: History[] = [{date: '2026-09-08', amount: 100, account: {name: 'Main'}}];
    it('does not invent observations in a future-only range', () => {
        expect(bankingHistory(rows, {period: 'custom', from: '2026-10-01', to: '2026-10-31', observedTo: '2026-09-08'}).size).toBe(0);
    });
    it('carries forward without modifying the source or duplicating a boundary entry', () => {
        const range = {period: 'custom' as const, from: '2026-09-09', to: '2026-09-10', observedTo: '2026-09-10'};
        expect(bankingHistory(rows, range).get('Main')?.[0].date).toBe('2026-09-09');
        expect(rows[0].date).toBe('2026-09-08');
        const boundary = {...rows[0], date: range.from, amount: 200};
        expect(bankingHistory([...rows, boundary], range).get('Main')).toEqual([boundary]);
    });
});
