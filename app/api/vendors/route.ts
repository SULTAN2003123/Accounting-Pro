import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all vendors
export async function GET() {
    try {
        const vendors = await prisma.vendor.findMany({
            include: {
                bills: true
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(vendors);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create vendor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, address } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const vendor = await prisma.vendor.create({
            data: { name, email, phone, address }
        });

        return NextResponse.json({ success: true, vendor }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
