import { prisma } from "@/lib/db";
import TransactionImporter from "@/components/transactions/TransactionImporter";

export default async function ImportTransactionsPage() {
    const accounts = await prisma.account.findMany({
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            bankName: true,
        },
    });

    return (
        <div className="container mx-auto py-12 px-4">
            <TransactionImporter accounts={accounts} />
        </div>
    );
}
