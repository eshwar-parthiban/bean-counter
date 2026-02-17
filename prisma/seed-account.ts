import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
    const member = await prisma.member.findFirst();
    if (!member) {
        console.log("No members found. Run seed first.");
        return;
    }

    await prisma.account.create({
        data: {
            name: "Main Current Account",
            bankName: "HSBC",
            accountNumber: "12345678",
            currency: "GBP",
            type: "CURRENT",
            memberId: member.id
        }
    });

    console.log("✅ Sample account created.");
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
