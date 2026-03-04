const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Current Users in Database ---');
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, email: true, status: true, role: true }
        });
        console.table(users);
    } catch (err) {
        console.error('Database query error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
