import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const accounts = await prisma.account.findMany({
            orderBy: { code: 'asc' }
        });
        return NextResponse.json(accounts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, type, description } = body;

        if (!code || !name || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const account = await prisma.account.create({
            data: { code, name, type, description }
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
