import { postJournalEntry, getTrialBalance } from '../lib/accounting';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('--- Testing Accounting Logic ---');

    // 1. Get Initial Trial Balance
    const initialTB = await getTrialBalance();
    console.log('Initial Trial Balance Balanced?', initialTB.isBalanced);
    console.log('Initial Debits:', initialTB.totalSystemDebit);

    // 2. Post a Transaction: Owner invests $10,000 Cash
    // Dr Cash (1000) 10,000
    // Cr Owner's Equity (3000) 10,000

    // Need to find account IDs first, or use codes if I update the logic. 
    // currently DB has IDs. Let's lookup IDs by code.
    const cash = await prisma.account.findUnique({ where: { code: '1000' } });
    const equity = await prisma.account.findUnique({ where: { code: '3000' } });

    if (!cash || !equity) {
        throw new Error('Accounts not found');
    }

    console.log('Posting Investment Transaction...');
    try {
        const entry = await postJournalEntry({
            date: new Date(),
            description: 'Initial Investment',
            lines: [
                { accountId: cash.id, debit: 10000, description: 'Cash Investment' },
                { accountId: equity.id, credit: 10000, description: 'Owner Capital' }
            ],
            status: 'POSTED'
        });
        console.log('Transaction Posted:', entry.id);
    } catch (e) {
        console.error('Failed to post transaction:', e);
    }

    // 3. Post an UNBALANCED Transaction (Should fail)
    console.log('Attempting Unbalanced Transaction...');
    try {
        await postJournalEntry({
            date: new Date(),
            description: 'Fraud Attempt',
            lines: [
                { accountId: cash.id, debit: 500, description: 'Stealing' }
                // No credit
            ],
            status: 'POSTED'
        });
        console.error('ERROR: Unbalanced transaction was ALLOWED!');
    } catch (e: any) {
        console.log('SUCCESS: Unbalanced transaction rejected:', e.message);
    }

    // 4. Verify Trial Balance Again
    const finalTB = await getTrialBalance();
    console.log('Final Trial Balance Balanced?', finalTB.isBalanced);
    console.log('Final Debits:', finalTB.totalSystemDebit);
    console.log('Final Credits:', finalTB.totalSystemCredit);

    if (finalTB.totalSystemDebit !== 10000) {
        console.error('ERROR: Total debits should be 10000');
    } else {
        console.log('SUCCESS: Debits match expected value.');
    }

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
