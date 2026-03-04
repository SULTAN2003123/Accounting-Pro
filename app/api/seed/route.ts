import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        console.log('Cleaning...');
        await prisma.payment.deleteMany();
        await prisma.invoiceLine.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.billLine.deleteMany();
        await prisma.bill.deleteMany();
        await prisma.journalLine.deleteMany();
        await prisma.journalEntry.deleteMany();
        await prisma.customer.deleteMany();
        await prisma.vendor.deleteMany();

        console.log('Adding data...');
        await prisma.customer.createMany({
            data: [
                { name: 'Global Tech Solutions', email: 'contact@gt.com' },
                { name: 'Nexus Studio', email: 'hello@nexus.io' }
            ]
        });

        await prisma.vendor.createMany({
            data: [
                { name: 'Cloud Services Pro', email: 'billing@cloud.com' },
                { name: 'Downtown Real Estate', email: 'rent@downtown.com' }
            ]
        });

        // Ensure base accounts exist
        const accountData = [
            { code: '1000', name: 'Cash at Bank', type: 'ASSET' },
            { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
            { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
            { code: '3000', name: 'Retained Earnings', type: 'EQUITY' },
            { code: '4000', name: 'Sales Revenue', type: 'INCOME' },
            { code: '5000', name: 'General Expenses', type: 'EXPENSE' },
        ];

        for (const data of accountData) {
            await prisma.account.upsert({
                where: { code: data.code },
                update: {},
                create: data,
            });
        }

        return NextResponse.json({ success: true, message: 'Database seeded successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
