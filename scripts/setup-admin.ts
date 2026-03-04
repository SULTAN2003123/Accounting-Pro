const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const email = 'admin@system.local';

    console.log(`Setting up admin user: ${username}...`);

    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {
                role: 'ADMIN',
                status: 'APPROVED',
                email: email,
            },
            create: {
                username,
                email,
                name: 'System Admin',
                role: 'ADMIN',
                status: 'APPROVED',
            },
        });

        console.log('Admin user created/updated successfully in database:');
        console.log(user);
        console.log('\nIMPORTANT: Now you must register this user in the app UI with:');
        console.log(`Username: ${username}`);
        console.log('Password: (your choice)');
        console.log('Even if it says it already exists, the database record is now ready.');
    } catch (error) {
        console.error('Error setting up admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
