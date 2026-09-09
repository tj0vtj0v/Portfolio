import {tooltipText} from '../../../shared/charts/tooltip-text';
import {DatePipe} from '@angular/common';
import {EChartsCoreOption} from 'echarts';
import {AccountingDashboardView} from './dashboard-data';
import {dateRange} from '../../../shared/date-range/period-range';

export function buildAccountingCharts(data: AccountingDashboardView) {
    const charts = {
        balance: build_balance_chart(data),
        category_expense: build_category_expense_chart(data),
        account_income: build_account_income_chart(data),
        history: build_history_chart(data),
        transfer: build_transfer_chart(data),
    };
    // The surrounding semantic panel already owns the visible heading. A duplicate
    // canvas title crowds narrow cards and repeats the same information.
    Object.values(charts).forEach(options => delete options['title']);
    return charts;
}

function build_balance_chart(data: AccountingDashboardView): EChartsCoreOption {
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
                const percentage = Math.round(params.percent);
                const value = parseFloat(params.value).toFixed(2);
                return `${tooltipText(params.name)}: ${value}€<br>${percentage}%`;
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

function build_category_expense_chart(data: AccountingDashboardView): EChartsCoreOption {
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
                const percentage = ((params.value / totalExpenses) * 100).toFixed(1);
                const value = parseFloat(params.value).toFixed(2);
                return `${tooltipText(params.name)}: ${value}€<br>${percentage}%`;
            },
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            selectedMode: 'multiple',
        },
        xAxis: {
            type: 'value',
            name: 'Amount (\u20ac)'
        },
        yAxis: {
            type: 'category',
            data: refinedCategories.map(entry => entry.name),
            name: 'Amount (€)'
        },
        series: [
            {
                type: 'bar',
                data: refinedCategories.map(entry => entry.value),
                label: {show: true, position: 'right', formatter: ({value}: any) => `${Number(value).toFixed(2)}\u20ac`},
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

function build_account_income_chart(data: AccountingDashboardView): EChartsCoreOption {
    const totalIncome = Array.from(data.accountIncomeMap.values()).reduce((sum, income) => sum + income, 0);
    const refinedAccounts = Array.from(data.accountIncomeMap.entries()).map(entry => (
        {
            name: entry[0],
            value: entry[1]
        }
    ));

    return {
        title: {
            text: `Income by Account - Total: ${totalIncome.toFixed(2)}€`,
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const percentage = parseFloat(params.percent).toFixed(1);
                const value = parseFloat(params.value).toFixed(2);
                return `${tooltipText(params.name)}: ${value}€<br>${percentage}%`;
            },
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            width: '20%',
            top: 40,
            selectedMode: 'multiple'
        },
        series: [
            {
                name: 'Account Incomes',
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

function build_history_chart(data: AccountingDashboardView): EChartsCoreOption {
    const dates = dateRange({from: data.startDate ?? data.minMovementDate, observedTo: data.endDate ?? data.minMovementDate ?? ''});

    const refinedHistories = Array.from(data.filteredHistories)
        .map(([accountName, history]) => {
            const historyMap = new Map(history.map(entry => [entry.date, entry.balance]));

            let balance: number | null = null;
            if (data.startDate && history.length > 0 && (new Date(history[0].date) < new Date(data.startDate))) {
                balance = history[0].balance
            }

            const balances = dates.map(date => {
                if (historyMap.has(date)) {
                    balance = historyMap.get(date)!;
                }

                return balance;
            });

            return {
                name: accountName,
                type: 'line',
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
                const content = params.map((item: any) => `${tooltipText(item.seriesName)}: ${parseFloat(item.value).toFixed(2)}€`).join('<br/>');
                const date = new DatePipe("en-US").transform(new Date(params[0].name), 'dd.MM.yyyy');
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
        },
        yAxis: {
            type: 'value',
        },
        series: refinedHistories,
    };
}

function build_transfer_chart(data: AccountingDashboardView): EChartsCoreOption {
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
                return `${tooltipText(params.data.source.split('_')[0] || '')} → ${tooltipText(params.data.target.split('_')[0] || '')}: ${parseFloat(params.data.value).toFixed(2)}€`;
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
