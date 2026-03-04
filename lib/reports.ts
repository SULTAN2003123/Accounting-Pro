import { prisma } from './prisma';

export async function generateIncomeStatement(startDate: Date, endDate: Date) {
    // Income: Credits - Debits
    const incomeAccounts = await prisma.account.findMany({
        where: { type: 'INCOME' },
        include: {
            journalLines: {
                where: {
                    journalEntry: {
                        status: 'POSTED',
                        date: { gte: startDate, lte: endDate }
                    }
                }
            }
        }
    });

    const income = incomeAccounts.map(acc => {
        const credits = acc.journalLines.reduce((sum, line) => sum + line.credit.toNumber(), 0);
        const debits = acc.journalLines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        return {
            account: acc.name,
            amount: credits - debits
        };
    });

    // Expenses: Debits - Credits
    const expenseAccounts = await prisma.account.findMany({
        where: { type: 'EXPENSE' },
        include: {
            journalLines: {
                where: {
                    journalEntry: {
                        status: 'POSTED',
                        date: { gte: startDate, lte: endDate }
                    }
                }
            }
        }
    });

    const expenses = expenseAccounts.map(acc => {
        const debits = acc.journalLines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        const credits = acc.journalLines.reduce((sum, line) => sum + line.credit.toNumber(), 0);
        return {
            account: acc.name,
            amount: debits - credits
        };
    });

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    return {
        income,
        expenses,
        totalIncome,
        totalExpenses,
        netIncome
    };
}

export async function generateBalanceSheet(asOfDate: Date) {
    // Assets: Debits - Credits
    const assetAccounts = await prisma.account.findMany({
        where: { type: 'ASSET' },
        include: {
            journalLines: {
                where: {
                    journalEntry: {
                        status: 'POSTED',
                        date: { lte: asOfDate }
                    }
                }
            }
        }
    });

    const assets = assetAccounts.map(acc => {
        const debits = acc.journalLines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        const credits = acc.journalLines.reduce((sum, line) => sum + line.credit.toNumber(), 0);
        return {
            account: acc.name,
            amount: debits - credits
        };
    });

    // Liabilities: Credits - Debits
    const liabilityAccounts = await prisma.account.findMany({
        where: { type: 'LIABILITY' },
        include: {
            journalLines: {
                where: {
                    journalEntry: {
                        status: 'POSTED',
                        date: { lte: asOfDate }
                    }
                }
            }
        }
    });

    const liabilities = liabilityAccounts.map(acc => {
        const credits = acc.journalLines.reduce((sum, line) => sum + line.credit.toNumber(), 0);
        const debits = acc.journalLines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        return {
            account: acc.name,
            amount: credits - debits
        };
    });

    // Equity: Credits - Debits
    const equityAccounts = await prisma.account.findMany({
        where: { type: 'EQUITY' },
        include: {
            journalLines: {
                where: {
                    journalEntry: {
                        status: 'POSTED',
                        date: { lte: asOfDate }
                    }
                }
            }
        }
    });

    const equity = equityAccounts.map(acc => {
        const credits = acc.journalLines.reduce((sum, line) => sum + line.credit.toNumber(), 0);
        const debits = acc.journalLines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        return {
            account: acc.name,
            amount: credits - debits
        };
    });

    const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

    return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
}
