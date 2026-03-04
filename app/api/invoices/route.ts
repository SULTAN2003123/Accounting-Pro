import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postJournalEntry } from '@/lib/accounting';

// GET all invoices
export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                customer: true,
                lines: true
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(invoices);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId, date, dueDate, lines, invoiceNumber } = body;

        if (!customerId || !date || !dueDate || !lines || !invoiceNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate total
        const totalAmount = lines.reduce((sum: number, line: any) => sum + line.amount, 0);

        // Get AR and Revenue accounts
        const arAccount = await prisma.account.findUnique({ where: { code: '1100' } });
        const revenueAccount = await prisma.account.findUnique({ where: { code: '4000' } });

        if (!arAccount || !revenueAccount) {
            return NextResponse.json({ error: 'Required accounts not found' }, { status: 500 });
        }

        // Create journal entry
        const journalEntry = await postJournalEntry({
            date: new Date(date),
            description: `Invoice ${invoiceNumber}`,
            reference: invoiceNumber,
            lines: [
                { accountId: arAccount.id, debit: totalAmount, description: 'Accounts Receivable' },
                { accountId: revenueAccount.id, credit: totalAmount, description: 'Sales Revenue' }
            ],
            status: 'POSTED'
        });

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                customerId,
                date: new Date(date),
                dueDate: new Date(dueDate),
                invoiceNumber,
                totalAmount,
                status: 'SENT',
                journalEntryId: journalEntry.id,
                lines: {
                    create: lines.map((line: any) => ({
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        amount: line.amount,
                        accountId: revenueAccount.id
                    }))
                }
            },
            include: {
                customer: true,
                lines: true
            }
        });

        return NextResponse.json({ success: true, invoice }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
