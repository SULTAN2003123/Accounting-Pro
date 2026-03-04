
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:accounting-pro123@db.uokrheyvsyjcfqsaxebz.supabase.co:6543/postgres?pgbouncer=true"
        }
    }
})

async function main() {
    try {
        console.log('Testing connection to Supabase...')
        const userCount = await prisma.user.count()
        console.log('Connection successful! User count:', userCount)

        const users = await prisma.user.findMany({
            select: { username: true, role: true, status: true }
        })
        console.log('Users in DB:', users)
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
