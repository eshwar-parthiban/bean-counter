import 'dotenv/config'
import { PrismaClient } from '@prisma/client'


if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env")
}

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? ''
})
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding database...')

    // 1. Upsert Members
    const eshwar = await prisma.member.upsert({
        where: { id: 'eshwar' },
        update: {},
        create: {
            id: 'eshwar',
            name: 'Eshwar',
            nickname: 'Esh',
        },
    })

    const deepshree = await prisma.member.upsert({
        where: { id: 'deepshree' },
        update: {},
        create: {
            id: 'deepshree',
            name: 'Deepshree',
            nickname: 'Deepu',
        },
    })

    const joint = await prisma.member.upsert({
        where: { id: 'joint' },
        update: {},
        create: {
            id: 'joint',
            name: 'Joint Account',
            nickname: 'Joint',
        },
    })

    console.log('✅ Members seeded')

    // 2. Upsert Categories
    const categories = [
        'Groceries',
        'Rent/Mortgage',
        'Utilities',
        'Transport',
        'Dining Out',
        'Entertainment',
        'Shopping',
        'Health',
        'Travel',
        'Personal - Eshwar',
        'Personal - Deepshree',
        'Transfer',
        'Settlement',
        'Uncategorized'
    ]

    for (const name of categories) {
        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        await prisma.category.upsert({
            where: { id },
            update: {},
            create: {
                id,
                name,
            },
        })
    }

    console.log('✅ Categories seeded')
    console.log('🏁 Seeding finished successfuly.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
