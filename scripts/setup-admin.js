const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('--- Admin Setup Script ---');
    console.log('This script will elevate an existing user to ADMIN status and APPROVE their account.');

    rl.question('Enter the username of the account to elevate: ', async (username) => {
        try {
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) {
                console.error(`Error: User '${username}' not found in the database.`);
                console.log('Please register the account from the web interface first.');
                process.exit(1);
            }

            const updatedUser = await prisma.user.update({
                where: { username },
                data: { role: 'ADMIN', status: 'APPROVED' }
            });

            console.log(`\nSuccess! User '${username}' is now an ADMIN and APPROVED.`);
            console.log(updatedUser);
        } catch (err) {
            console.error('Database error:', err);
        } finally {
            await prisma.$disconnect();
            rl.close();
        }
    });
}

main();
