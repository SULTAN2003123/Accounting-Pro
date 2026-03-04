import { prisma } from './prisma';

export interface CreateUserParams {
    username: string;
    email: string;
    firebaseUid: string;
    name?: string;
    role?: string;
}

/**
 * Check if a username is already taken.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { firebaseUid: true }
    });
    // If user exists but has no Firebase UID, they are likely pre-initialized (like the Admin)
    return !user || !user.firebaseUid;
}

/**
 * Fetch a user by their username to retrieve email and status.
 */
export async function getUserByUsername(username: string) {
    return await prisma.user.findUnique({
        where: { username },
        select: { email: true, status: true, role: true }
    });
}

/**
 * Create a new user in the local database or sync existing one.
 */
export async function syncUserWithDatabase(params: CreateUserParams) {
    return await prisma.user.upsert({
        where: { email: params.email },
        update: {
            firebaseUid: params.firebaseUid,
            username: params.username,
            name: params.name || undefined
        },
        create: {
            email: params.email,
            username: params.username,
            firebaseUid: params.firebaseUid,
            name: params.name,
            role: params.role || 'USER'
        }
    });
}

/**
 * Get a user by their Firebase UID.
 */
export async function getUserByFirebaseUid(uid: string) {
    return await prisma.user.findFirst({
        where: { firebaseUid: uid }
    });
}
