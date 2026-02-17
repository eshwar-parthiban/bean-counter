import { Dashboard } from "@/components/dashboard/Dashboard";
import { getMembers } from "@/lib/actions/members";
import { getAccounts } from "@/lib/actions/accounts";
import { getCategories } from "@/lib/actions/categories";

export const dynamic = "force-dynamic";

export default async function ManagementPage() {
    const [members, accounts, categories] = await Promise.all([
        getMembers(),
        getAccounts(),
        getCategories(),
    ]);

    return (
        <main className="min-h-screen p-8 md:p-16">
            <div className="max-w-7xl mx-auto">
                <Dashboard
                    initialMembers={members}
                    initialAccounts={accounts}
                    initialCategories={categories}
                />
            </div>
        </main>
    );
}
