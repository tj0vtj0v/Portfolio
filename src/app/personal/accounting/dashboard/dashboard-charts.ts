import {displayDate} from '../../../shared/formatter/display-date';
import {tooltipText} from '../../../shared/charts/tooltip-text';
import {EChartsCoreOption} from 'echarts';
import {AccountingDashboardView} from './dashboard-data';
import {dateRange, formatLocalDate} from '../../../shared/date-range/period-range';

export function buildAccountingCharts(data: AccountingDashboardView, hidden = false) {
    const charts = {
        balance: build_balance_chart(data, hidden),
        category_expense: build_category_expense_chart(data, hidden),
        history: build_history_chart(data, hidden),
        transfer: build_transfer_chart(data, hidden),
    };
    // The surrounding semantic panel already owns the visible heading. A duplicate
    // canvas title crowds narrow cards and repeats the same information.
    Object.values(charts).forEach(options => delete options['title']);
    return charts;
}

function build_balance_chart(data: AccountingDashboardView, hidden: boolean): EChartsCoreOption {
    const totalBalance = data.accounts.reduce((sum, account) => sum + account.balance, 0);
    const refinedAccounts = data.accounts.map(account => (
        {
            name: account.name,
            value: account.balance
        }
    ));

    return {
        title: {
            text: `Account Liquidity - Total: ${totalBalance.toFixed(2)}€`,
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const percentage = Math.round(Number(params.percent) || 0);
                const value = parseFloat(params.value).toFixed(2);
                return hidden ? `${tooltipText(params.name)}: --- €<br>${percentage}%` : `${tooltipText(params.name)}: ${value}€<br>${percentage}%`;
            },
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            width: '20%',
            top: 40,
            selectedMode: 'multiple'
        },
        grid: {
            left: '20%',
            containLabel: true
        },
        series: [
            {
                name: 'Balance',
                type: 'pie',
                radius: '50%',
                center: ['60%', '40%'],
                data: refinedAccounts,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    };
}

function build_category_expense_chart(data: AccountingDashboardView, hidden: boolean): EChartsCoreOption {
    const totalExpenses = Array.from(data.categoryExpenseMap.values()).reduce((sum, expense) => sum + expense, 0);
    const refinedCategories = Array.from(data.categoryExpenseMap.entries()).map(entry => (
        {
            name: entry[0],
            value: entry[1]
        }
    )).sort((a, b) => b.value - a.value);

    return {
        title: {
            text: `Expenses by Category - Total: ${totalExpenses.toFixed(2)}€`,
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const percentage = (totalExpenses ? (params.value / totalExpenses) * 100 : 0).toFixed(1);
                const value = parseFloat(params.value).toFixed(2);
                return hidden ? `${tooltipText(params.name)}: --- €<br>${percentage}%` : `${tooltipText(params.name)}: ${value}€<br>${percentage}%`;
            },
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            selectedMode: 'multiple',
        },
        grid: {left: 16, right: 24, top: 40, bottom: 24, containLabel: true},
        xAxis: {
            type: 'category',
            data: refinedCategories.map(entry => entry.name),
            axisLabel: {interval: 0, rotate: 30, width: 100, overflow: 'truncate'}
        },
        yAxis: {
            type: 'value', name: 'Amount (EUR)',
            // Anchor the title inside the plot even when hidden tick labels no longer reserve space.
            nameTextStyle: {align: 'left'},
            axisLabel: {show: !hidden}, axisPointer: {label: {show: !hidden}}
        },
        series: [
            {
                type: 'bar',
                colorBy: 'data',
                data: refinedCategories.map(entry => entry.value),
                label: {show: !hidden, position: 'top', formatter: ({value}: any) => hidden ? '--- €' : `${Number(value).toFixed(2)}\u20ac`},
                select: {label: {show: !hidden}},
                emphasis: {
                    label: {show: !hidden},
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    };
}

function build_history_chart(data: AccountingDashboardView, hidden: boolean): EChartsCoreOption {
    const today = formatLocalDate(new Date());
    const dates = dateRange({from: data.startDate ?? data.minMovementDate, observedTo: data.endDate ?? data.minMovementDate ?? ''});

    const refinedHistories = Array.from(data.filteredHistories)
        .map(([accountName, history]) => {
            const historyMap = new Map(history.map(entry => [entry.date, entry.balance]));

            let balance: number | null = null;
            if (data.startDate && history.length > 0 && (new Date(history[0].date) < new Date(data.startDate))) {
                balance = history[0].balance
            }

            const balances = dates.map(date => {
                if (date > today) return null;
                if (historyMap.has(date)) {
                    balance = historyMap.get(date)!;
                }

                return balance;
            });

            return {
                name: accountName,
                type: 'line',
                symbol: 'circle',
                showSymbol: false,
                smooth: true,
                data: balances
            };
        });

    return {
        title: {
            text: 'Account Balance Over Time',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                const content = params.map((item: any) => {
                    if (hidden) return `${tooltipText(item.seriesName)}: --- €`;
                    const value = typeof item.value === 'number' || (typeof item.value === 'string' && item.value.trim())
                        ? Number(item.value) : NaN;
                    return `${tooltipText(item.seriesName)}: ${Number.isFinite(value) ? value.toFixed(2) : '-'}€`;
                }).join('<br/>');
                const date = displayDate(params[0].name);
                return `${date}<br>${content}`
            },
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 50,
            selectedMode: 'multiple',
        },
        grid: {
            left: 150,
            top: 50,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {formatter: (value: string) => displayDate(value)},
            axisPointer: {label: {formatter: (params: any) => displayDate(params.value)}},
        },
        yAxis: {
            axisLabel: {show: !hidden},
            axisPointer: {label: {show: !hidden}},
            type: 'value',
        },
        series: refinedHistories,
    };
}

function build_transfer_chart(data: AccountingDashboardView, hidden: boolean): EChartsCoreOption {
    const combinedTransfers = new Map<string, { source: string; target: string; value: number }>();

    data.filteredTransfers.forEach(transfer => {
        const source = transfer.source!.name;
        const target = transfer.target!.name;
        const amount = transfer.amount;
        const key = JSON.stringify([source, target]);

        if (!combinedTransfers.has(key)) {
            combinedTransfers.set(key, {source: source, target: target, value: amount});
        } else {
            combinedTransfers.get(key)!.value += amount;
        }
    });

    const refinedTransfers = Array.from(combinedTransfers.values()).map(entry => ({
        source: `${entry.source} `,
        target: entry.target,
        value: entry.value
    }));

    return {
        title: {
            text: 'Transfer Flow Between Accounts',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const source = tooltipText(params.data.source?.split('_')[0] || params.name || '');
                const target = tooltipText(params.data.target?.split('_')[0] || '');
                const label = target ? `${source} → ${target}` : source;
                return hidden ? `${label}: --- €` : `${label}: ${parseFloat(params.data.value).toFixed(2)}€`;
            },
        },
        series: [
            {
                type: 'sankey',
                top: 50,
                data: getNodesFromTransactions(refinedTransfers),
                links: refinedTransfers,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                },
                emphasis: {
                    focus: 'adjacency',
                },
            },
        ],
    };
}

function getNodesFromTransactions(transactions: { source: string, target: string, value: number }[]) {
    const nodesSet = new Set<string>();

    transactions.forEach(tx => {
        nodesSet.add(tx.source);
        nodesSet.add(tx.target);
    });

    return Array.from(nodesSet).map(name => ({
        name,
    }));
}
