import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Only ADMIN users should be able to access this, but since we are handling 
// Firebase auth via client context mostly, we will add a simple role check 
// by looking up the email or uid passed in headers in a real app, 
// for prototyping we're keeping the API open and relying on UI protection usually.
// Or we can require the requester username in a header for an admin check.
export async function GET(request: NextRequest) {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
