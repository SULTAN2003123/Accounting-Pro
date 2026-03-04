import { NextRequest } from 'next/server';

// Firebase Auth REST API endpoint for verifying ID tokens
const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

export interface FirebaseUser {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
    photoURL: string | null;
    disabled: boolean;
}

/**
 * Verify a Firebase ID token from the request
 * Returns the decoded token user info if valid, null otherwise
 */
export async function verifyIdToken(idToken: string): Promise<FirebaseUser | null> {
    try {
        const response = await fetch(FIREBASE_AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
            console.error('Firebase token verification failed:', await response.text());
            return null;
        }

        const data = await response.json();

        if (data.users && data.users.length > 0) {
            return data.users[0] as FirebaseUser;
        }

        return null;
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return null;
    }
}

/**
 * Extract ID token from Authorization header
 */
export function extractIdToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return null;
    }

    // Expect "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Extract ID token from cookies
 */
export function extractIdTokenFromCookies(request: NextRequest): string | null {
    const token = request.cookies.get('firebase-token')?.value;
    return token || null;
}
