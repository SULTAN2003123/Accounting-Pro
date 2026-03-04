import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const accounts = [
        // ASSETS
        { code: '1000', name: 'Cash', type: 'ASSET' },
        { code: '1010', name: 'Bank', type: 'ASSET' },
        { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },

        // LIABILITIES
        { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
        { code: '2100', name: 'Sales Tax Payable', type: 'LIABILITY' },

        // EQUITY
        { code: '3000', name: 'Owner\'s Equity', type: 'EQUITY' },
        { code: '3100', name: 'Retained Earnings', type: 'EQUITY' },

        // INCOME
        { code: '4000', name: 'Sales Revenue', type: 'INCOME' },
        { code: '4100', name: 'Service Revenue', type: 'INCOME' },

        // EXPENSES
        { code: '5000', name: 'Rent Expense', type: 'EXPENSE' },
        { code: '5100', name: 'Utilities Expense', type: 'EXPENSE' },
        { code: '5200', name: 'Salaries Expense', type: 'EXPENSE' },
        { code: '5300', name: 'Office Supplies', type: 'EXPENSE' },
    ]

    console.log(`Start seeding...`)

    // Clear existing data (optional but recommended for clean seed)
    await prisma.customer.deleteMany({});
    await prisma.vendor.deleteMany({});

    for (const acct of accounts) {
        await prisma.account.upsert({
            where: { code: acct.code },
            update: {},
            create: {
                code: acct.code,
                name: acct.name,
                type: acct.type,
            },
        })
    }

    // Add Sample Customers
    await prisma.customer.createMany({
        data: [
            { name: 'Global Tech Solutions', email: 'billing@globaltech.com' },
            { name: 'Nexus Design Studio', email: 'hello@nexus.io' },
        ]
    });

    // Add Sample Vendors
    await prisma.vendor.createMany({
        data: [
            { name: 'Cloud Provider Z', email: 'accounts@cloudprovider.com' },
            { name: 'Downtown Real Estate', email: 'rent@downtownre.com' },
        ]
    });

    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
