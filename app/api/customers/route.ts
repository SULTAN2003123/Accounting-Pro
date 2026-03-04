import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all customers
export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                invoices: true
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(customers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, address } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: { name, email, phone, address }
        });

        return NextResponse.json({ success: true, customer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
