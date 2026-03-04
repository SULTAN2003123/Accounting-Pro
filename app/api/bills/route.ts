import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postJournalEntry } from '@/lib/accounting';

// GET all bills
export async function GET() {
    try {
        const bills = await prisma.bill.findMany({
            include: {
                vendor: true,
                lines: true
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(bills);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create bill
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { vendorId, date, dueDate, lines, billNumber } = body;

        if (!vendorId || !date || !dueDate || !lines) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate total
        const totalAmount = lines.reduce((sum: number, line: any) => sum + line.amount, 0);

        // Get AP and Expense accounts
        const apAccount = await prisma.account.findUnique({ where: { code: '2000' } });
        const expenseAccount = await prisma.account.findUnique({ where: { code: '5000' } });

        if (!apAccount || !expenseAccount) {
            return NextResponse.json({ error: 'Required accounts not found' }, { status: 500 });
        }

        // Create journal entry
        const journalEntry = await postJournalEntry({
            date: new Date(date),
            description: `Bill ${billNumber || 'from vendor'}`,
            reference: billNumber,
            lines: [
                { accountId: expenseAccount.id, debit: totalAmount, description: 'Expense' },
                { accountId: apAccount.id, credit: totalAmount, description: 'Accounts Payable' }
            ],
            status: 'POSTED'
        });

        // Create bill
        const bill = await prisma.bill.create({
            data: {
                vendorId,
                date: new Date(date),
                dueDate: new Date(dueDate),
                billNumber,
                totalAmount,
                status: 'OPEN',
                journalEntryId: journalEntry.id,
                lines: {
                    create: lines.map((line: any) => ({
                        description: line.description,
                        amount: line.amount,
                        accountId: expenseAccount.id
                    }))
                }
            },
            include: {
                vendor: true,
                lines: true
            }
        });

        return NextResponse.json({ success: true, bill }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
