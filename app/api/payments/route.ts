import { NextRequest, NextResponse } from 'next/server';
import { recordPayment } from '@/lib/accounting';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, amount, method, type, invoiceId, billId, reference } = body;

        if (!date || !amount || !method || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const payment = await recordPayment({
            date: new Date(date),
            amount: Number(amount),
            method,
            type,
            invoiceId,
            billId,
            reference
        });

        return NextResponse.json({ success: true, payment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
