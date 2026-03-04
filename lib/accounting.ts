import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Types for Journal Entry Input
export type JournalLineInput = {
    accountId: string;
    debit?: number;
    credit?: number;
    description?: string;
};

export type JournalEntryInput = {
    date: Date;
    description: string;
    reference?: string;
    lines: JournalLineInput[];
    status?: 'DRAFT' | 'POSTED';
};

/**
 * Core Accounting Logic: Posts a Journal Entry ensuring Debits = Credits
 */
export async function postJournalEntry(entry: JournalEntryInput) {
    // 1. Validate Balance
    const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Transaction does not balance! Debits: ${totalDebit}, Credits: ${totalCredit}`);
    }

    // 2. Format Custom Date (if strictly creating dates is tricky in TS without date-fns, just use native Date)
    // entry.date is assumed to be a Date object

    // 3. Create Transaction in DB
    // Use prisma.$transaction if we were doing more complex related writes, but create with nested writes is atomic enough here
    // for a single journal entry structure.

    // However, if we need to verify account types or other constraints, we might want interactive transactions later.

    const createdEntry = await prisma.journalEntry.create({
        data: {
            date: entry.date,
            description: entry.description,
            reference: entry.reference,
            status: entry.status || "POSTED",
            lines: {
                create: entry.lines.map(line => ({
                    accountId: line.accountId,
                    debit: line.debit || 0,
                    credit: line.credit || 0,
                    description: line.description
                }))
            }
        },
        include: {
            lines: true
        }
    });

    return createdEntry;
}

/**
 * Calculate Account Balance
 * Asset/Expense: Debit - Credit
 * Liability/Equity/Income: Credit - Debit
 */
export async function getAccountBalance(accountId: string) {
    const account = await prisma.account.findUnique({
        where: { id: accountId }
    });

    if (!account) throw new Error("Account not found");

    const aggregations = await prisma.journalLine.aggregate({
        where: {
            accountId: accountId,
            journalEntry: {
                status: 'POSTED'
            }
        },
        _sum: {
            debit: true,
            credit: true
        }
    });

    const totalDebits = aggregations._sum.debit?.toNumber() || 0;
    const totalCredits = aggregations._sum.credit?.toNumber() || 0;

    let balance = 0;
    if (['ASSET', 'EXPENSE'].includes(account.type)) {
        balance = totalDebits - totalCredits;
    } else {
        balance = totalCredits - totalDebits;
    }

    return balance;
}

/**
 * Get Trial Balance
 * Returns list of accounts and their balances.
 * Total Debits must equal Total Credits.
 */
export async function getTrialBalance() {
    const accounts = await prisma.account.findMany({
        include: {
            journalLines: {
                where: {
                    journalEntry: { status: 'POSTED' }
                }
            }
        }
    });

    // Calculate balances in memory for now (or improve with raw SQL for speed later)
    let totalSystemDebit = 0;
    let totalSystemCredit = 0;

    const trialBalance = accounts.map(acc => {
        const debits = acc.journalLines.reduce((sum, line) => sum + line.debit.toNumber(), 0);
        const credits = acc.journalLines.reduce((sum, line) => sum + line.credit.toNumber(), 0);

        totalSystemDebit += debits;
        totalSystemCredit += credits;

        let balance = 0;
        if (['ASSET', 'EXPENSE'].includes(acc.type)) {
            balance = debits - credits;
        } else {
            balance = credits - debits;
        }

        return {
            ...acc,
            debits,
            credits,
            balance
        };
    });

    return {
        accounts: trialBalance,
        totalSystemDebit,
        totalSystemCredit,
        isBalanced: Math.abs(totalSystemDebit - totalSystemCredit) < 0.01
    };
}
/**
 * Record a Payment and its corresponding Journal Entry
 */
export async function recordPayment(input: {
    date: Date;
    amount: number;
    method: 'CASH' | 'BANK' | 'CHECK';
    reference?: string;
    type: 'RECEIVE' | 'SPEND';
    invoiceId?: string;
    billId?: string;
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Get required accounts
        // We assume 1000 is Bank/Cash for now. 
        // 1100 is AR, 2000 is AP.
        const bankAccount = await tx.account.findUnique({ where: { code: '1000' } });
        const arAccount = await tx.account.findUnique({ where: { code: '1100' } });
        const apAccount = await tx.account.findUnique({ where: { code: '2000' } });

        if (!bankAccount || !arAccount || !apAccount) {
            throw new Error("Missing required system accounts (1000, 1100, or 2000)");
        }

        const description = input.type === 'RECEIVE'
            ? `Payment received for Invoice ${input.invoiceId || ''}`
            : `Payment made for Bill ${input.billId || ''}`;

        // 2. Create Journal Entry
        const journalLines: any[] = [];
        if (input.type === 'RECEIVE') {
            // Debit Bank, Credit AR
            journalLines.push({ accountId: bankAccount.id, debit: input.amount, credit: 0, description });
            journalLines.push({ accountId: arAccount.id, debit: 0, credit: input.amount, description });
        } else {
            // Debit AP, Credit Bank
            journalLines.push({ accountId: apAccount.id, debit: input.amount, credit: 0, description });
            journalLines.push({ accountId: bankAccount.id, debit: 0, credit: input.amount, description });
        }

        const journalEntry = await tx.journalEntry.create({
            data: {
                date: input.date,
                description,
                reference: input.reference,
                status: 'POSTED',
                lines: {
                    create: journalLines
                }
            }
        });

        // 3. Create Payment Record
        const payment = await tx.payment.create({
            data: {
                date: input.date,
                amount: input.amount,
                method: input.method,
                reference: input.reference,
                type: input.type,
                invoiceId: input.invoiceId,
                billId: input.billId,
                journalEntryId: journalEntry.id
            }
        });

        // 4. Update Invoice/Bill Status
        if (input.invoiceId) {
            const invoice = await tx.invoice.findUnique({
                where: { id: input.invoiceId },
                include: { payments: true }
            });
            if (invoice) {
                const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0) + input.amount;
                const status = totalPaid >= invoice.totalAmount.toNumber() ? 'PAID' : 'PARTIALLY_PAID';
                await tx.invoice.update({
                    where: { id: input.invoiceId },
                    data: { status }
                });
            }
        }

        if (input.billId) {
            const bill = await tx.bill.findUnique({
                where: { id: input.billId },
                include: { payments: true }
            });
            if (bill) {
                const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0) + input.amount;
                const status = totalPaid >= bill.totalAmount.toNumber() ? 'PAID' : 'PARTIALLY_PAID';
                await tx.bill.update({
                    where: { id: input.billId },
                    data: { status }
                });
            }
        }

        return payment;
    });
}
