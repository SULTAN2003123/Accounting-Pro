import { prisma } from '../lib/prisma';

async function main() {
    console.log('Clearing all journal entries...');

    // Delete all journal lines first (due to foreign key)
    await prisma.journalLine.deleteMany({});
    console.log('Deleted all journal lines');

    // Delete all journal entries
    await prisma.journalEntry.deleteMany({});
    console.log('Deleted all journal entries');

    console.log('Done! Journal is now empty.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
