import { prisma } from './prisma';
import { getAccountBalance } from './accounting';

export async function getDashboardMetrics() {
    // 1. Get Key Account IDs by Code
    const accounts = await prisma.account.findMany({
        where: {
            code: { in: ['1000', '1100', '2000'] } // Cash, AR, AP
        }
    });

    const cashAccount = accounts.find(a => a.code === '1000');
    const arAccount = accounts.find(a => a.code === '1100');
    const apAccount = accounts.find(a => a.code === '2000');

    // 2. Calculate Balances
    const cashBalance = cashAccount ? await getAccountBalance(cashAccount.id) : 0;
    const arBalance = arAccount ? await getAccountBalance(arAccount.id) : 0;
    const apBalance = apAccount ? await getAccountBalance(apAccount.id) : 0;

    // 3. Calculate Net Profit (Income - Expense)
    // We need to aggregate ALL Income and ALL Expense accounts
    // This is better done with a customized query than iterating one by one

    // Sum of Credits in Income Accounts - Sum of Debits in Income Accounts
    const incomeAgg = await prisma.journalLine.aggregate({
        where: {
            account: { type: 'INCOME' },
            journalEntry: { status: 'POSTED' }
        },
        _sum: { credit: true, debit: true }
    });
    const totalIncome = (incomeAgg._sum.credit?.toNumber() || 0) - (incomeAgg._sum.debit?.toNumber() || 0);

    // Sum of Debits in Expense Accounts - Sum of Credits in Expense Accounts
    const expenseAgg = await prisma.journalLine.aggregate({
        where: {
            account: { type: 'EXPENSE' },
            journalEntry: { status: 'POSTED' }
        },
        _sum: { debit: true, credit: true }
    });
    const totalExpense = (expenseAgg._sum.debit?.toNumber() || 0) - (expenseAgg._sum.credit?.toNumber() || 0);

    const netProfit = totalIncome - totalExpense;

    return {
        cash: cashBalance,
        accountsReceivable: arBalance,
        accountsPayable: apBalance,
        netProfit,
        income: totalIncome,
        expenses: totalExpense
    };
}

export async function getRecentActivity(limit = 5) {
    const entries = await prisma.journalEntry.findMany({
        take: limit,
        orderBy: { date: 'desc' },
        include: {
            lines: {
                include: { account: true }
            }
        }
    });

    return entries.map(entry => {
        const totalAmount = entry.lines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        return {
            id: entry.id,
            date: entry.date,
            description: entry.description,
            reference: entry.reference,
            amount: totalAmount,
            status: entry.status
        };
    });
}
