import { NextRequest, NextResponse } from 'next/server';
import { isUsernameAvailable, syncUserWithDatabase } from '@/lib/user-service';

export async function POST(request: NextRequest) {
    try {
        const { username, email, firebaseUid, name } = await request.json();

        if (!username || !email || !firebaseUid) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if username is already taken
        const available = await isUsernameAvailable(username);
        if (!available) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        const user = await syncUserWithDatabase({
            username,
            email,
            firebaseUid,
            name
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
