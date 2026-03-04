import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/user-service';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    try {
        const user = await getUserByUsername(username);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.status === 'PENDING') {
            return NextResponse.json({ error: 'PENDING_APPROVAL' }, { status: 403 });
        } else if (user.status === 'REJECTED') {
            return NextResponse.json({ error: 'ACCOUNT_REJECTED' }, { status: 403 });
        }

        return NextResponse.json({ email: user.email, role: user.role });
    } catch (error: any) {
        console.error('Login lookup error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
