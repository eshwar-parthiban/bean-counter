import Link from "next/link";
import { ArrowRight, Wallet, PieChart, TrendingUp, Plus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
              Track your wealth, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                one bean at a time.
              </span>
            </h1>
            <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              An intelligent, multi-currency personal finance tracker designed for modern nomads and joint households. Automatically categorize, split, and analyze your transactions.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/transactions/new"
                className="px-8 py-4 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold hover:opacity-90 transition-all flex items-center gap-2 group shadow-xl shadow-zinc-200 dark:shadow-none"
              >
                Import Transactions
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/management"
                className="px-8 py-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                Setup Accounts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-6">
              <Wallet size={24} />
            </div>
            <h3 className="text-zinc-500 dark:text-zinc-400 font-medium">Total Balance</h3>
            <p className="text-3xl font-bold mt-2 text-zinc-900 dark:text-zinc-50 font-mono">£12,450.80</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <TrendingUp size={16} />
              <span>+2.4% this month</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-400 border-dashed">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-6">
              <PieChart size={24} />
            </div>
            <h3 className="font-medium">Monthly Spending</h3>
            <p className="text-3xl font-bold mt-2 italic opacity-50">Coming soon</p>
            <p className="mt-4 text-sm">Visualize your expense distribution across categories.</p>
          </div>

          <Link
            href="/transactions/new"
            className="p-8 rounded-3xl bg-indigo-600 hover:bg-indigo-700 transition-colors flex flex-col items-center justify-center text-white group"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold">New Import</h3>
            <p className="text-indigo-100 mt-2 text-center">Process CSV statements and sync your data</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
