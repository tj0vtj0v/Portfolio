import type {EChartsCoreOption} from 'echarts';
import type {AccountingDashboardView} from './dashboard-data';

export interface MonthlyComparison {
    month: string;
    expenses: number;
    income: number;
    options: EChartsCoreOption;
}

/** Uses already-filtered records; partial months never pull in out-of-range transactions. */
export function monthlyComparison(view: AccountingDashboardView, selectedTo = view.endDate): MonthlyComparison[] {
    const records = [...view.filteredExpenses, ...view.filteredIncomes];
    const earliest = records.reduce<string | undefined>((date, record) => !date || record.date < date ? record.date : date, view.minMovementDate);
    const from = view.startDate ?? earliest;
    const to = selectedTo ?? records.reduce((date, record) => record.date > date ? record.date : date, from ?? '');
    if (!from || !to || from > to) return [];
    const totals = new Map<string, {expenses: number; income: number}>();
    for (const [key, rows] of [['expenses', view.filteredExpenses], ['income', view.filteredIncomes]] as const) {
        for (const row of rows) {
            const month = row.date.slice(0, 7);
            const total = totals.get(month) ?? {expenses: 0, income: 0};
            total[key] += row.amount;
            totals.set(month, total);
        }
    }
    const months: Array<{month: string; expenses: number; income: number}> = [];
    let [year, month] = from.slice(0, 7).split('-').map(Number);
    while (`${year}-${String(month).padStart(2, '0')}` <= to.slice(0, 7)) {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        months.push({month: key, ...(totals.get(key) ?? {expenses: 0, income: 0})});
        if (++month > 12) { month = 1; year++; }
    }
    const maximum = months.reduce((max, month) => Math.max(max, month.expenses, month.income), 0) || 1;
    const currency = new Intl.NumberFormat('en', {style: 'currency', currency: 'EUR'});
    return months.map(month => ({...month, options: {
        animation: false,
        legend: {show: false},
        grid: {left: 8, right: 8, top: 8, bottom: 1},
        xAxis: {type: 'category', data: [month.month], axisLabel: {show: false}, axisTick: {show: false}, axisLine: {show: true, onZero: true}, splitLine: {show: false}},
        yAxis: {type: 'value', min: 0, max: maximum, show: false},
        tooltip: {
            trigger: 'axis',
            appendTo: 'body',
            confine: false,
            formatter: () => `${month.month}<br>Expenses: ${currency.format(month.expenses)}<br>Income: ${currency.format(month.income)}`
        },
        series: [
            {name: 'Expenses', type: 'bar', data: [month.expenses], barMaxWidth: 16, barGap: '25%', itemStyle: {borderRadius: [4, 4, 0, 0]}, label: {show: false}},
            {name: 'Income', type: 'bar', data: [month.income], barMaxWidth: 16, itemStyle: {borderRadius: [4, 4, 0, 0]}, label: {show: false}}
        ]
    }}));
}
